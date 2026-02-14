const express = require('express');
const { protect, requireAdmin } = require('../middlewares/auth');
const activityLogController = require('../controllers/activityLog.controller');

const router = express.Router();

// ==================== Activity Log Routes (Admin Only) ====================

/**
 * @route GET /api/activity-logs/admin
 * @desc ดู Activity Log ทั้งหมด
 * @access Admin
 */
router.get(
    '/admin',
    protect,
    requireAdmin,
    activityLogController.getActivityLogs
);

/**
 * @route GET /api/activity-logs/admin/stats
 * @desc สถิติ Activity Log
 * @access Admin
 */
router.get(
    '/admin/stats',
    protect,
    requireAdmin,
    activityLogController.getActivityStats
);

/**
 * @route GET /api/activity-logs/admin/activity-types
 * @desc ดึง Activity Types ทั้งหมด
 * @access Admin
 */
router.get(
    '/admin/activity-types',
    protect,
    requireAdmin,
    activityLogController.getActivityTypes
);

/**
 * @route GET /api/activity-logs/admin/:id
 * @desc ดูรายละเอียด Activity Log
 * @access Admin
 */
router.get(
    '/admin/:id',
    protect,
    requireAdmin,
    activityLogController.getActivityLogById
);

module.exports = router;
