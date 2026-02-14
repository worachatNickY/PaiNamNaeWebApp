const prisma = require("../utils/prisma");

// ==================== Activity Log Service (พ.ร.บ.คอมพิวเตอร์ฯ มาตรา 26) ====================

/**
 * บันทึก Activity Log
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.userEmail - User email (เก็บไว้เผื่อ user ถูกลบ)
 * @param {string} params.activityType - ประเภท activity
 * @param {string} params.description - รายละเอียด
 * @param {Object} params.metadata - ข้อมูลเพิ่มเติม
 * @param {Object} params.connectionInfo - ข้อมูลการเชื่อมต่อ (ip, userAgent, etc.)
 */
const logActivity = async ({
    userId,
    userEmail,
    activityType,
    description = null,
    metadata = null,
    connectionInfo = {}
}) => {
    try {
        await prisma.activityLog.create({
            data: {
                userId,
                userEmail,
                activityType,
                description,
                metadata,
                ipAddress: connectionInfo.ipAddress || null,
                userAgent: connectionInfo.userAgent || null,
                deviceInfo: connectionInfo.deviceInfo || null
            }
        });
    } catch (error) {
        // Log quietly - ไม่ให้กระทบ flow หลัก
        console.error('Failed to log activity:', error.message);
    }
};

/**
 * ดึง Activity Log ของ user
 */
const getUserActivityLogs = async (userId, options = {}) => {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.activityLog.count({ where: { userId } })
    ]);

    return {
        logs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * ตั้งเวลาลบ Log (90 วันหลังจาก user ถูก hard delete)
 */
const scheduleLogDeletion = async (userId, userEmail) => {
    const scheduledLogDeleteAt = new Date();
    scheduledLogDeleteAt.setDate(scheduledLogDeleteAt.getDate() + 90); // 90 วันจากวันนี้

    await prisma.activityLog.updateMany({
        where: { 
            OR: [
                { userId },
                { userEmail }
            ]
        },
        data: { scheduledLogDeleteAt }
    });

    console.log(`[Activity Log] Scheduled log deletion for user ${userId} at ${scheduledLogDeleteAt.toISOString()}`);
};

/**
 * ลบ Log ที่หมดอายุแล้ว (Scheduled Job)
 */
const deleteExpiredLogs = async () => {
    const now = new Date();

    const result = await prisma.activityLog.deleteMany({
        where: {
            scheduledLogDeleteAt: {
                lte: now
            }
        }
    });

    console.log(`[Activity Log Cleanup] Deleted ${result.count} expired logs`);
    return result.count;
};

/**
 * Extract connection info จาก request
 */
const getConnectionInfo = (req) => {
    return {
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'] || null,
        deviceInfo: req.headers['x-device-info'] || null
    };
};

module.exports = {
    logActivity,
    getUserActivityLogs,
    scheduleLogDeletion,
    deleteExpiredLogs,
    getConnectionInfo
};
