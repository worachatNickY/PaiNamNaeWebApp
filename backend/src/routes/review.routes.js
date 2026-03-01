const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const reviewController = require('../controllers/review.controller');
const { createReviewSchema, listReviewsQuerySchema, driverIdParamSchema } = require('../validations/review.validation');

// POST /api/reviews - create review (passenger only, auth required)
router.post(
    '/',
    protect,
    validate({ body: createReviewSchema }),
    reviewController.createReview
);

// GET /api/reviews/me - my reviews (auth required)
router.get(
    '/me',
    protect,
    reviewController.getMyReviews
);

// GET /api/reviews/reviewable - trips I can still review (auth required)
router.get(
    '/reviewable',
    protect,
    reviewController.getReviewable
);

// GET /api/reviews/driver/:driverId - reviews for a driver (public)
router.get(
    '/driver/:driverId',
    validate({ params: driverIdParamSchema }),
    reviewController.getReviewsForDriver
);

// GET /api/reviews - list with optional filters (query: page, limit, driverId, passengerId, bookingId)
router.get(
    '/',
    validate({ query: listReviewsQuerySchema }),
    reviewController.listReviews
);

module.exports = router;
