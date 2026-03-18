const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

// Simple regex patterns to detect obvious personal info
const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const ADDRESS_REGEX = /(ที่อยู่|เลขที่|ถนน|ซอย|หมู่|ต\.|อ\.|จ\.|แขวง|เขต|ตำบล|อำเภอ|จังหวัด|road|rd\.|street|st\.|soi|subdistrict|district|province|address)/i;
// Online IDs / social handles (english + thai, case-insensitive)
const SOCIAL_REGEX = /(line\s?id|ไลน์|facebook|Facebook|เฟซบุ๊ก|fb\.com|instagram|Instagram|ig\b|ไอจี|tiktok|Tiktok|ติ๊กต็อก|ตต|whatsapp|Whatsapp|line|Line|telegram|Telegram|Discord|disc\w*|discord|@[\w\.]{3,})/i;

function hasPhoneLike(text) {
  if (!text) return false;
  const digits = String(text).replace(/\D/g, '');
  if (digits.length < 9) return false;
  if (/0\d{8,9}/.test(digits)) return true;
  if (/66\d{8,9}/.test(digits)) return true;
  return false;
}

async function getBookingForUser(bookingId, userId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      route: {
        select: {
          driverId: true,
        },
      },
      passenger: {
        select: { id: true },
      },
    },
  });

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  const isDriver = booking.route.driverId === userId;
  const isPassenger = booking.passengerId === userId;

  if (!isDriver && !isPassenger) {
    throw new ApiError(403, 'You are not part of this ride');
  }

  return { booking, isDriver, isPassenger };
}

function checkRideStatus(booking) {
  if (booking.status === 'COMPLETED') {
    throw new ApiError(
      400,
      'Chat is no longer available after the ride has been completed.'
    );
  }
}

function validateMessageText(text, { allowPersonalInfo } = { allowPersonalInfo: false }) {
  if (!text || !text.trim()) {
    throw new ApiError(400, 'Message cannot be empty');
  }
  if (text.length > 1000) {
    throw new ApiError(400, 'Message is too long');
  }
  const hasPhone = hasPhoneLike(text);
  const hasEmail = EMAIL_REGEX.test(text);
  const hasAddress = ADDRESS_REGEX.test(text);
  const hasSocial = SOCIAL_REGEX.test(text);

  // บังคับให้ยืนยันเฉพาะข้อความที่ "มีแนวโน้มเป็นข้อมูลส่วนตัว"
  if (!allowPersonalInfo && (hasPhone || hasEmail || hasAddress || hasSocial)) {
    throw new ApiError(
      400,
      'MESSAGE_CONTAINS_PERSONAL_INFO'
    );
  }
}

async function sendTextMessage(bookingId, senderId, text, options = {}) {
  const { allowPersonalInfo = false } = options;
  const { booking, isDriver, isPassenger } = await getBookingForUser(
    bookingId,
    senderId
  );

  checkRideStatus(booking);
  validateMessageText(text, { allowPersonalInfo });

  const receiverId = isDriver ? booking.passengerId : booking.route.driverId;

  const message = await prisma.message.create({
    data: {
      bookingId,
      senderId,
      receiverId,
      type: 'TEXT',
      text: text.trim(),
      status: 'SENT',
    },
  });

  return message;
}

async function sendLocationMessage(bookingId, senderId, { latitude, longitude }) {
  const { booking, isDriver } = await getBookingForUser(bookingId, senderId);
  checkRideStatus(booking);

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new ApiError(400, 'Invalid location');
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new ApiError(400, 'Invalid location');
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new ApiError(400, 'Invalid location');
  }

  const receiverId = isDriver ? booking.passengerId : booking.route.driverId;

  const message = await prisma.message.create({
    data: {
      bookingId,
      senderId,
      receiverId,
      type: 'LOCATION',
      latitude,
      longitude,
      status: 'SENT',
    },
  });

  return message;
}

async function sendImageMessage(bookingId, senderId, mediaUrl) {
  const { booking, isDriver } = await getBookingForUser(bookingId, senderId);
  checkRideStatus(booking);

  if (!mediaUrl || typeof mediaUrl !== 'string') {
    throw new ApiError(400, 'Invalid image URL');
  }

  const receiverId = isDriver ? booking.passengerId : booking.route.driverId;

  const message = await prisma.message.create({
    data: {
      bookingId,
      senderId,
      receiverId,
      type: 'IMAGE',
      mediaUrl,
      status: 'SENT',
    },
  });

  return message;
}

async function listMessages(bookingId, userId) {
  await getBookingForUser(bookingId, userId); // access check

  const messages = await prisma.message.findMany({
    where: { bookingId },
    orderBy: { createdAt: 'asc' },
  });

  return messages;
}

async function getBookingForAdmin(bookingId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      status: true,
      createdAt: true,
      passengerId: true,
      route: {
        select: {
          id: true,
          driverId: true,
          departureTime: true,
          // startLocation/endLocation are Json scalars in this schema
          startLocation: true,
          endLocation: true,
        },
      },
    },
  });

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  return booking;
}

async function listMessagesAdmin(bookingId) {
  const booking = await getBookingForAdmin(bookingId);
  const messages = await prisma.message.findMany({
    where: { bookingId },
    orderBy: { createdAt: 'asc' },
  });

  return { booking, messages };
}

async function listConversationsAdmin({ page = 1, limit = 20, bookingId } = {}) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  // IMPORTANT: Prisma dislikes explicit `where: undefined` on some queries.
  // Build args conditionally so undefined fields are omitted.
  const whereClause = bookingId ? { bookingId } : null;

  const [groups, totalGroups] = await Promise.all([
    prisma.message.groupBy(
      Object.assign(
        {
          by: ['bookingId'],
          _count: { _all: true },
          _max: { createdAt: true },
          orderBy: { _max: { createdAt: 'desc' } },
          skip,
          take: safeLimit,
        },
        whereClause ? { where: whereClause } : null
      )
    ),
    prisma.message
      .groupBy(
        Object.assign(
          {
            by: ['bookingId'],
            _count: { _all: true },
          },
          whereClause ? { where: whereClause } : null
        )
      )
      .then((rows) => rows.length),
  ]);

  const bookingIds = groups.map((g) => g.bookingId);
  const bookings = bookingIds.length
    ? await prisma.booking.findMany({
        where: { id: { in: bookingIds } },
        select: {
          id: true,
          status: true,
          passengerId: true,
          route: {
            select: {
              driverId: true,
              departureTime: true,
              // startLocation/endLocation are Json scalars in this schema
              startLocation: true,
              endLocation: true,
            },
          },
        },
      })
    : [];

  const bookingById = new Map(bookings.map((b) => [b.id, b]));

  const items = groups.map((g) => {
    const b = bookingById.get(g.bookingId) || null;
    return {
      bookingId: g.bookingId,
      messageCount: g._count?._all || 0,
      lastMessageAt: g._max?.createdAt || null,
      booking: b,
    };
  });

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: totalGroups,
      totalPages: Math.ceil(totalGroups / safeLimit),
    },
  };
}

module.exports = {
  sendTextMessage,
  sendLocationMessage,
  sendImageMessage,
  listMessages,
  listMessagesAdmin,
  listConversationsAdmin,
};

