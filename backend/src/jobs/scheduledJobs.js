const prisma = require("../utils/prisma");
const { scheduleLogDeletion, deleteExpiredLogs } = require("../services/activityLog.service");

// ==================== Scheduled Jobs (PDPA + พ.ร.บ.คอมพิวเตอร์ฯ) ====================

/**
 * Job 1: Hard Delete Users - ลบข้อมูลส่วนตัวหลัง 30 วัน (PDPA)
 * รัน: ทุกวันตอนเที่ยงคืน
 */
const hardDeleteUsers = async () => {
    console.log('[Hard Delete Job] Starting...');
    const now = new Date();

    // หา users ที่ถึงเวลา hard delete แล้ว
    const usersToDelete = await prisma.user.findMany({
        where: {
            status: 'PENDING_DELETION',
            scheduledDeleteAt: {
                lte: now
            }
        },
        select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            phoneNumber: true
        }
    });

    console.log(`[Hard Delete Job] Found ${usersToDelete.length} users to process`);

    for (const user of usersToDelete) {
        try {
            // Log activity ก่อนลบ
            await prisma.activityLog.create({
                data: {
                    userId: user.id,
                    userEmail: user.email,
                    activityType: 'ACCOUNT_DELETE_CONFIRM',
                    description: 'Account hard deleted (30 days after request)',
                    metadata: {
                        deletedAt: now.toISOString(),
                        originalUsername: user.username
                    }
                }
            });

            // Anonymize ข้อมูลส่วนตัว (ไม่ลบทิ้งเลย เพื่อเก็บ reference)
            const anonymizedId = `deleted_${user.id.slice(-8)}`;
            
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    // Anonymize PII (Personal Identifiable Information)
                    username: anonymizedId,
                    email: `${anonymizedId}@deleted.local`,
                    password: 'DELETED',
                    firstName: null,
                    lastName: null,
                    phoneNumber: null,
                    profilePicture: null,
                    nationalIdNumber: null,
                    nationalIdPhotoUrl: null,
                    nationalIdExpiryDate: null,
                    selfiePhotoUrl: null,
                    gender: null,
                    
                    // Update status
                    status: 'DELETED',
                    deletedAt: now,
                    isActive: false
                }
            });

            // ลบข้อมูลที่เกี่ยวข้อง
            await prisma.$transaction([
                // ลบ Driver Verification
                prisma.driverVerification.deleteMany({
                    where: { userId: user.id }
                }),
                // ลบ Vehicles
                prisma.vehicle.deleteMany({
                    where: { userId: user.id }
                }),
                // ลบ Notifications
                prisma.notification.deleteMany({
                    where: { userId: user.id }
                }),
                // ลบ Deletion Requests
                prisma.deletionRequest.deleteMany({
                    where: { userId: user.id }
                })
            ]);

            // Schedule log deletion (90 วันหลังจากวันนี้)
            await scheduleLogDeletion(user.id, user.email);

            console.log(`[Hard Delete Job] Successfully processed user ${user.id}`);

        } catch (error) {
            console.error(`[Hard Delete Job] Failed to process user ${user.id}:`, error.message);
        }
    }

    console.log('[Hard Delete Job] Completed');
    return usersToDelete.length;
};

/**
 * Job 2: Log Cleanup - ลบ Log ที่หมดอายุ 90 วัน (พ.ร.บ.คอมพิวเตอร์ฯ)
 * รัน: ทุกวันตอนเที่ยงคืน
 */
const cleanupExpiredLogs = async () => {
    console.log('[Log Cleanup Job] Starting...');
    const deletedCount = await deleteExpiredLogs();
    console.log(`[Log Cleanup Job] Completed - Deleted ${deletedCount} logs`);
    return deletedCount;
};

/**
 * รัน Jobs ทั้งหมด
 */
const runAllJobs = async () => {
    console.log('========================================');
    console.log('[Scheduled Jobs] Running at', new Date().toISOString());
    console.log('========================================');

    try {
        // Job 1: Hard Delete (30 วัน - PDPA)
        const deletedUsers = await hardDeleteUsers();

        // Job 2: Log Cleanup (90 วัน - พ.ร.บ.คอมพิวเตอร์ฯ)
        const deletedLogs = await cleanupExpiredLogs();

        console.log('========================================');
        console.log('[Scheduled Jobs] Summary:');
        console.log(`  - Users hard deleted: ${deletedUsers}`);
        console.log(`  - Logs cleaned up: ${deletedLogs}`);
        console.log('========================================');

        return { deletedUsers, deletedLogs };

    } catch (error) {
        console.error('[Scheduled Jobs] Error:', error);
        throw error;
    }
};

module.exports = {
    hardDeleteUsers,
    cleanupExpiredLogs,
    runAllJobs
};
