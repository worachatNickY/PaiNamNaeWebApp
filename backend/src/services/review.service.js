const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

const LOW_RATING_THRESHOLD = 2;
const REVIEW_WINDOW_DAYS = 7;
const REVIEW_WINDOW_MS = REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;

function notifyAdmins(type, title, body, link, metadata) {
    return prisma.user.findMany({ where: { role: 'ADMIN', isActive: true }, select: { id: true } })
        .then(admins => Promise.all(admins.map(admin =>
            prisma.notification.create({ data: { userId: admin.id, type, title, body, link, metadata } })
        )))
        .catch(err => console.error('Failed to notify admins:', err.message));
}

async function updateDriverRating(driverId) {
    const agg = await prisma.review.aggregate({
        where: { driverId },
        _avg: { rating: true },
        _count: { id: true },
    });
    await prisma.user.update({
        where: { id: driverId },
        data: {
            averageRating: agg._avg.rating ?? 0,
            reviewCount: agg._count.id ?? 0,
        },
    });
}

async function createReview(passengerId, data) {
    const { trip_id: bookingId, rating, tags, comment, isAnonymous } = data;

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { route: { select: { driverId: true, departureTime: true } } },
    });

    if (!booking) throw new ApiError(404, 'Booking (trip) not found');
    if (booking.passengerId !== passengerId) {
        throw new ApiError(403, 'You can only review trips you participated in as a passenger');
    }
    if (booking.status !== 'COMPLETED') {
        throw new ApiError(400, 'You can only review trips that have ended. The driver must complete the trip first.');
    }

    const existing = await prisma.review.findUnique({ where: { bookingId } });
    if (existing) throw new ApiError(400, 'You have already reviewed this trip');

    const departureTime = new Date(booking.route.departureTime).getTime();
    const now = Date.now();
    if (now - departureTime > REVIEW_WINDOW_MS) {
        throw new ApiError(400, `Review period has ended. Reviews must be submitted within ${REVIEW_WINDOW_DAYS} days after the trip.`);
    }

    const driverId = booking.route.driverId;

    const review = await prisma.review.create({
        data: {
            bookingId,
            passengerId,
            driverId,
            rating,
            tags: tags || undefined,
            comment: comment || undefined,
            isAnonymous: !!isAnonymous,
        },
        include: {
            booking: { select: { id: true, routeId: true } },
            driver: { select: { id: true, firstName: true, lastName: true, averageRating: true, reviewCount: true } },
        },
    });

    await updateDriverRating(driverId);

    if (rating < LOW_RATING_THRESHOLD) {
        await notifyAdmins(
            'SYSTEM',
            'Low rating review submitted',
            'A passenger left a ' + rating + '-star review. Please check and follow up.',
            '/admin/reviews',
            { reviewId: review.id, driverId, bookingId, rating }
        );
    }

    return review;
}

async function listReviews(opts) {
    const { page = 1, limit = 20, driverId, passengerId, bookingId } = opts || {};
    const skip = (page - 1) * limit;
    const where = {};
    if (driverId) where.driverId = driverId;
    if (passengerId) where.passengerId = passengerId;
    if (bookingId) where.bookingId = bookingId;

    const [total, data] = await Promise.all([
        prisma.review.count({ where }),
        prisma.review.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
                booking: { select: { id: true, routeId: true } },
                passenger: { select: { id: true, firstName: true, lastName: true } },
                driver: { select: { id: true, firstName: true, lastName: true, averageRating: true, reviewCount: true } },
            },
        }),
    ]);

    const dataWithAnonymization = data.map(r => {
        const row = { ...r };
        if (r.isAnonymous && row.passenger) {
            row.passenger = { id: r.passenger.id, firstName: null, lastName: null };
        }
        return row;
    });

    return {
        data: dataWithAnonymization,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

async function getMyReviews(passengerId, opts) {
    return listReviews({ ...opts, passengerId });
}

/**
 * Get bookings to show in "ทริปที่รอรีวิว"
 * - แสดงทุกทริปที่เดินทางสำเร็จแล้ว และ "ยังไม่ได้รีวิว"
 * - เพิ่ม flag canReview เพื่อบอกว่ายังอยู่ในช่วง 7 วันหรือไม่
 */
async function getReviewableBookings(passengerId) {
    const bookings = await prisma.booking.findMany({
        where: {
            passengerId,
            status: 'COMPLETED',
        },
        include: {
            route: {
                select: {
                    id: true,
                    driverId: true,
                    departureTime: true,
                    startLocation: true,
                    endLocation: true,
                    driver: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            averageRating: true,
                            reviewCount: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!bookings.length) return [];

    const reviewIds = await prisma.review.findMany({
        where: { bookingId: { in: bookings.map((b) => b.id) } },
        select: { bookingId: true },
    });
    const reviewedSet = new Set(reviewIds.map((r) => r.bookingId));

    const now = Date.now();

    return bookings
        // แสดงเฉพาะทริปที่ยัง "ไม่ได้รีวิว"
        .filter((b) => !reviewedSet.has(b.id))
        // map เพิ่ม canReview = ภายใน 7 วันหรือไม่
        .map((b) => {
            const dep = new Date(b.route.departureTime).getTime();
            const withinWindow = now - dep <= REVIEW_WINDOW_MS;
            return {
                ...b,
                canReview: withinWindow,
            };
        });
}

async function getReviewsForDriver(driverId, opts) {
    return listReviews({ ...opts, driverId });
}

module.exports = {
    createReview,
    listReviews,
    getMyReviews,
    getReviewsForDriver,
    getReviewableBookings,
    updateDriverRating,
};
