const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');

// ==================== Activity Log Controller (Admin) ====================

/**
 * GET /api/activity-logs/admin
 * ดู Activity Log ทั้งหมด (Admin only)
 */
const getActivityLogs = asyncHandler(async (req, res) => {
    const {
        page: pageParam = '1',
        limit: limitParam = '20',
        userId,
        userEmail,
        activityType,
        startDate,
        endDate,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
    } = req.query;

    // Safe parsing with validation
    const page = Math.max(1, parseInt(pageParam) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitParam) || 20));
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (userId) {
        where.userId = userId;
    }

    if (userEmail) {
        where.userEmail = { contains: userEmail, mode: 'insensitive' };
    }

    if (activityType) {
        where.activityType = activityType;
    }

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
            where.createdAt.gte = new Date(startDate);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            where.createdAt.lte = end;
        }
    }

    if (search) {
        where.OR = [
            { userEmail: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { ipAddress: { contains: search, mode: 'insensitive' } }
        ];
    }

    // Execute query
    const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
            where,
            orderBy: { [sortBy]: sortOrder },
            skip,
            take: limit
        }),
        prisma.activityLog.count({ where })
    ]);

    res.status(200).json({
        success: true,
        data: logs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
});

/**
 * GET /api/activity-logs/admin/stats
 * สถิติ Activity Log
 */
const getActivityStats = asyncHandler(async (req, res) => {
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // นับจำนวนแต่ละ activity type
    const activityCounts = await prisma.activityLog.groupBy({
        by: ['activityType'],
        _count: { id: true },
        where: {
            createdAt: { gte: startDate }
        }
    });

    // นับ total logs
    const totalLogs = await prisma.activityLog.count();

    // นับ logs ที่จะถูกลบ (มี scheduledLogDeleteAt)
    const pendingDeletion = await prisma.activityLog.count({
        where: {
            scheduledLogDeleteAt: { not: null }
        }
    });

    res.status(200).json({
        success: true,
        data: {
            totalLogs,
            pendingDeletion,
            activityCounts: activityCounts.map(item => ({
                type: item.activityType,
                count: item._count.id
            })),
            period: `Last ${days} days`
        }
    });
});

/**
 * GET /api/activity-logs/admin/activity-types
 * ดึง Activity Types ทั้งหมด
 */
const getActivityTypes = asyncHandler(async (req, res) => {
    const types = [
        { value: 'LOGIN', label: 'เข้าสู่ระบบ' },
        { value: 'LOGOUT', label: 'ออกจากระบบ' },
        { value: 'REGISTER', label: 'สมัครสมาชิก' },
        { value: 'PASSWORD_CHANGE', label: 'เปลี่ยนรหัสผ่าน' },
        { value: 'PROFILE_UPDATE', label: 'อัพเดทโปรไฟล์' },
        { value: 'BOOKING_CREATE', label: 'สร้างการจอง' },
        { value: 'BOOKING_CANCEL', label: 'ยกเลิกการจอง' },
        { value: 'ROUTE_CREATE', label: 'สร้างเส้นทาง' },
        { value: 'ROUTE_CANCEL', label: 'ยกเลิกเส้นทาง' },
        { value: 'PAYMENT', label: 'ชำระเงิน' },
        { value: 'ACCOUNT_DELETE_REQUEST', label: 'ขอลบบัญชี' },
        { value: 'ACCOUNT_DELETE_CONFIRM', label: 'ยืนยันลบบัญชี' },
        { value: 'ACCOUNT_DELETE_CANCEL', label: 'ยกเลิกลบบัญชี' },
        { value: 'DRIVER_VERIFICATION', label: 'ยืนยันตัวตนคนขับ' },
        { value: 'EMERGENCY_REQUEST', label: 'แจ้งเหตุฉุกเฉิน' },
        { value: 'REPORT_SUBMIT', label: 'รายงานปัญหา' }
    ];

    res.status(200).json({
        success: true,
        data: types
    });
});

/**
 * GET /api/activity-logs/admin/:id
 * ดูรายละเอียด Activity Log
 */
const getActivityLogById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const log = await prisma.activityLog.findUnique({
        where: { id }
    });

    if (!log) {
        return res.status(404).json({
            success: false,
            message: 'Activity log not found'
        });
    }

    res.status(200).json({
        success: true,
        data: log
    });
});

module.exports = {
    getActivityLogs,
    getActivityStats,
    getActivityTypes,
    getActivityLogById
};
