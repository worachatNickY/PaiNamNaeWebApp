const { z } = require('zod');

const createReviewSchema = z.object({
    trip_id: z.string().min(1, 'trip_id (booking id) is required'),
    rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
    tags: z.array(z.string()).optional().nullable(),
    comment: z.string().max(1000).optional().nullable(),
    isAnonymous: z.boolean().optional().default(false),
});

const listReviewsQuerySchema = z.object({
    page: z.string().optional().default('1'),
    limit: z.string().optional().default('20'),
    driverId: z.string().optional(),
    passengerId: z.string().optional(),
    bookingId: z.string().optional(),
});

const driverIdParamSchema = z.object({
    driverId: z.string().min(1, 'driverId is required'),
});

module.exports = {
    createReviewSchema,
    listReviewsQuerySchema,
    driverIdParamSchema,
};
