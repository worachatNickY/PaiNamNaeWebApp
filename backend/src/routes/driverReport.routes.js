const express = require('express');
const router = express.Router();
const reportController = require('../controllers/driverReport.controller');
const { protect, requireAdmin, requireDriver } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { z } = require('zod');

// ==================== Validation Schemas ====================

const createReportSchema = {
    body: z.object({
        driverId: z.string().min(1),
        bookingId: z.string().optional().nullable(),
        category: z.enum([
            'DRIVING_BEHAVIOR',
            'VEHICLE_CONDITION',
            'SERVICE_QUALITY',
            'SAFETY_CONCERN',
            'PAYMENT_ISSUE',
            'OTHER'
        ]),
        type: z.enum([
            'SPEEDING',
            'RECKLESS_DRIVING',
            'PHONE_WHILE_DRIVING',
            'DIRTY_VEHICLE',
            'VEHICLE_MALFUNCTION',
            'BAD_SMELL',
            'RUDE_BEHAVIOR',
            'UNPROFESSIONAL',
            'LATE_ARRIVAL',
            'WRONG_ROUTE',
            'UNSAFE_FEELING',
            'HARASSMENT',
            'INTOXICATED',
            'OVERCHARGING',
            'REFUSED_PAYMENT_METHOD',
            'NO_SHOW',
            'OTHER'
        ]),
        description: z.string().min(10).max(1000),
        attachments: z.array(z.string().url()).optional().nullable()
    })
};

const resolveReportSchema = {
    body: z.object({
        status: z.enum(['RESOLVED', 'DISMISSED']),
        adminNotes: z.string().max(500).optional().nullable(),
        resolution: z.string().max(500).optional().nullable()
    })
};

// ==================== Public Routes ====================

// Get report types and categories
router.get('/types', reportController.getReportTypes);

// ==================== Passenger Routes ====================

// Create report
router.post(
    '/',
    protect,
    validate(createReportSchema),
    reportController.createReport
);

// Get my reports
router.get(
    '/my-reports',
    protect,
    reportController.getMyReports
);

// ==================== Driver Routes ====================

// Get reports against me (as driver)
router.get(
    '/against-me',
    protect,
    requireDriver,
    reportController.getReportsAgainstMe
);

// Get my report statistics (as driver)
router.get(
    '/my-stats',
    protect,
    requireDriver,
    reportController.getMyReportStats
);

// ==================== Admin Routes ====================

// Get all reports
router.get(
    '/admin/all',
    protect,
    requireAdmin,
    reportController.getAllReports
);

// Get report statistics
router.get(
    '/admin/stats',
    protect,
    requireAdmin,
    reportController.getReportStats
);

// Get driver's report history
router.get(
    '/admin/driver/:driverId',
    protect,
    requireAdmin,
    reportController.getDriverHistory
);

// Get report by ID (admin)
router.get(
    '/admin/:id',
    protect,
    requireAdmin,
    reportController.getReportById
);

// Start reviewing
router.patch(
    '/:id/review',
    protect,
    requireAdmin,
    reportController.startReview
);

// Resolve/Dismiss report
router.patch(
    '/:id/resolve',
    protect,
    requireAdmin,
    validate(resolveReportSchema),
    reportController.resolveReport
);

module.exports = router;
