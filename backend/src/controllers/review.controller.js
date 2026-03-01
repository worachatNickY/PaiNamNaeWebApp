const asyncHandler = require('express-async-handler');
const reviewService = require('../services/review.service');

/**
 * POST /api/reviews
 * Create a review for a trip (booking). Body: trip_id, rating, tags?, comment?, isAnonymous?
 */
const createReview = asyncHandler(async (req, res) => {
    const passengerId = req.user.sub;
    const review = await reviewService.createReview(passengerId, req.body);
    res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review,
    });
});

/**
 * GET /api/reviews
 * List reviews. Query: page, limit, driverId?, passengerId?, bookingId?
 * If no driverId/passengerId/bookingId, returns all (or we restrict to own). For simplicity we allow driverId for public driver profile; passengerId only for own (me).
 */
const listReviews = asyncHandler(async (req, res) => {
    const { page, limit, driverId, passengerId, bookingId } = req.query;
    const opts = {
        page: parseInt(page, 10) || 1,
        limit: Math.min(parseInt(limit, 10) || 20, 100),
    };
    if (driverId) opts.driverId = driverId;
    if (passengerId) opts.passengerId = passengerId;
    if (bookingId) opts.bookingId = bookingId;
    const result = await reviewService.listReviews(opts);
    res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
    });
});

/**
 * GET /api/reviews/me
 * List reviews I gave (as passenger)
 */
const getMyReviews = asyncHandler(async (req, res) => {
    const passengerId = req.user.sub;
    const { page, limit } = req.query;
    const opts = {
        page: parseInt(page, 10) || 1,
        limit: Math.min(parseInt(limit, 10) || 20, 100),
    };
    const result = await reviewService.getMyReviews(passengerId, opts);
    res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
    });
});

/**
 * GET /api/reviews/reviewable
 * List my trips that I can still review (CONFIRMED, no review yet, within 7 days)
 */
const getReviewable = asyncHandler(async (req, res) => {
    const passengerId = req.user.sub;
    const bookings = await reviewService.getReviewableBookings(passengerId);
    res.status(200).json({
        success: true,
        data: bookings,
    });
});

/**
 * GET /api/reviews/driver/:driverId
 * List reviews for a driver (public, for driver profile)
 */
const getReviewsForDriver = asyncHandler(async (req, res) => {
    const { driverId } = req.params;
    const { page, limit } = req.query;
    const opts = {
        page: parseInt(page, 10) || 1,
        limit: Math.min(parseInt(limit, 10) || 20, 100),
    };
    const result = await reviewService.getReviewsForDriver(driverId, opts);
    res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
    });
});

module.exports = {
    createReview,
    listReviews,
    getMyReviews,
    getReviewable,
    getReviewsForDriver,
};
