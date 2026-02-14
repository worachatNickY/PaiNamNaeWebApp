const prisma = require("../utils/prisma");
const ApiError = require('../utils/ApiError');

// ==================== PBI #16: Account & Data Removal ====================

/**
 * สร้าง Notification
 */
const createNotification = async (userId, type, title, body, link = null, metadata = null) => {
    try {
        await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                body,
                link,
                metadata
            }
        });
    } catch (error) {
        console.error('Failed to create notification:', error.message);
    }
};

/**
 * แจ้งเตือน Admin ทั้งหมด
 */
const notifyAdmins = async (type, title, body, link = null, metadata = null) => {
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN', isActive: true },
            select: { id: true }
        });

        for (const admin of admins) {
            await createNotification(admin.id, type, title, body, link, metadata);
        }
    } catch (error) {
        console.error('Failed to notify admins:', error.message);
    }
};

/**
 * บันทึก Activity Log (สำหรับ internal use)
 */
const logActivity = async (userId, userEmail, activityType, description, metadata, connectionInfo = {}) => {
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
        console.error('Failed to log activity:', error.message);
    }
};

/**
 * สร้าง OTP 6 หลัก
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * สร้าง OTP Reference
 */
const generateOTPRef = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * 16-BE1: Request Delete - สร้างคำขอลบบัญชี + ส่ง OTP
 */
const requestDelete = async (userId, reason, otherReason = null, connectionInfo = {}) => {
    // ตรวจสอบว่า user มีอยู่จริง
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // ตรวจสอบว่า user ไม่ได้อยู่ในสถานะ pending deletion อยู่แล้ว
    if (user.status === 'PENDING_DELETION') {
        throw new ApiError(400, 'You already have a pending deletion request');
    }

    if (user.status === 'DELETED') {
        throw new ApiError(400, 'This account has already been deleted');
    }

    // ตรวจสอบว่ามี active deletion request อยู่หรือไม่
    const existingRequest = await prisma.deletionRequest.findFirst({
        where: {
            userId,
            status: { in: ['PENDING', 'VERIFIED'] }
        }
    });

    // สร้าง OTP
    const otpCode = generateOTP();
    const otpRef = generateOTPRef();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // หมดอายุใน 5 นาที

    let deletionRequest;

    if (existingRequest) {
        // ถ้ามี request เดิมอยู่ อัพเดท OTP ใหม่แทน
        deletionRequest = await prisma.deletionRequest.update({
            where: { id: existingRequest.id },
            data: {
                reason,
                otherReason: reason === 'OTHER' ? otherReason : null,
                otpCode,
                otpRef,
                otpExpiresAt,
                otpAttempts: 0,
                status: 'PENDING'
            }
        });
    } else {
        // สร้าง deletion request ใหม่
        deletionRequest = await prisma.deletionRequest.create({
            data: {
                userId,
                reason,
                otherReason: reason === 'OTHER' ? otherReason : null,
                otpCode,
                otpRef,
                otpExpiresAt,
                status: 'PENDING'
            }
        });
    }

    // TODO: ส่ง OTP ไปยังเบอร์โทรศัพท์จริง (ตอนนี้ return กลับไปก่อน สำหรับ dev)
    // ในระบบจริงควรใช้ SMS Gateway เช่น Twilio, ThaiBulkSMS
    
    // Mask phone number สำหรับแสดงผล
    const maskedPhone = user.phoneNumber 
        ? user.phoneNumber.replace(/(\d{3})\d{4}(\d{3})/, '$1-XXX-X$2')
        : 'N/A';

    // Log activity (พ.ร.บ.คอมพิวเตอร์ฯ)
    await logActivity(
        userId,
        user.email,
        'ACCOUNT_DELETE_REQUEST',
        'User requested account deletion',
        { reason, otpRef },
        connectionInfo
    );

    return {
        success: true,
        message: 'OTP sent to your phone',
        otpRef,
        maskedPhone,
        expiresIn: 300, // 5 minutes in seconds
        // DEV ONLY: ลบบรรทัดนี้ใน production
        devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined
    };
};

/**
 * 16-BE2: Verify Delete - ตรวจสอบ OTP
 */
const verifyDelete = async (userId, otp, otpRef) => {
    // หา deletion request ที่ตรงกับ user และ otpRef
    const request = await prisma.deletionRequest.findFirst({
        where: {
            userId,
            otpRef,
            status: 'PENDING'
        }
    });

    if (!request) {
        throw new ApiError(404, 'Deletion request not found or already processed');
    }

    // ตรวจสอบ OTP หมดอายุ
    if (new Date() > request.otpExpiresAt) {
        throw new ApiError(400, 'OTP has expired. Please request a new one.');
    }

    // ตรวจสอบจำนวนครั้งที่ลองผิด (max 3 ครั้ง)
    if (request.otpAttempts >= 3) {
        throw new ApiError(429, 'Too many failed attempts. Please request a new OTP.');
    }

    // ตรวจสอบ OTP ถูกต้อง
    if (request.otpCode !== otp) {
        // เพิ่มจำนวนครั้งที่ลองผิด
        await prisma.deletionRequest.update({
            where: { id: request.id },
            data: { otpAttempts: request.otpAttempts + 1 }
        });

        const remainingAttempts = 3 - (request.otpAttempts + 1);
        throw new ApiError(400, `Invalid OTP. ${remainingAttempts} attempts remaining.`);
    }

    // OTP ถูกต้อง - อัพเดทสถานะ
    await prisma.deletionRequest.update({
        where: { id: request.id },
        data: {
            status: 'VERIFIED',
            verifiedAt: new Date()
        }
    });

    // สร้าง delete token (ใช้ request id เป็น token)
    const deleteToken = request.id;

    return {
        success: true,
        message: 'OTP verified successfully',
        deleteToken,
        validFor: 600 // 10 minutes
    };
};

/**
 * 16-BE3: Confirm Delete - ทำ Soft Delete
 */
const confirmDelete = async (userId, deleteToken, connectionInfo = {}) => {
    // ตรวจสอบ delete token (request id)
    const request = await prisma.deletionRequest.findFirst({
        where: {
            id: deleteToken,
            userId,
            status: 'VERIFIED'
        }
    });

    if (!request) {
        throw new ApiError(401, 'Invalid or expired delete token');
    }

    // ตรวจสอบว่า verify ไม่เกิน 10 นาที
    const verifiedAt = new Date(request.verifiedAt);
    const tenMinutesLater = new Date(verifiedAt.getTime() + 10 * 60 * 1000);
    if (new Date() > tenMinutesLater) {
        throw new ApiError(401, 'Delete token has expired. Please verify again.');
    }

    // คำนวณวันที่จะลบถาวร (30 วันหลังจากนี้)
    const scheduledDeleteAt = new Date();
    scheduledDeleteAt.setDate(scheduledDeleteAt.getDate() + 30);

    // ทำ Soft Delete - อัพเดท user status
    await prisma.$transaction([
        // อัพเดท user
        prisma.user.update({
            where: { id: userId },
            data: {
                status: 'PENDING_DELETION',
                scheduledDeleteAt,
                deleteReason: request.reason,
                isActive: false
            }
        }),
        // อัพเดท deletion request
        prisma.deletionRequest.update({
            where: { id: request.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date()
            }
        })
    ]);

    // ดึง user email สำหรับ log
    const user = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { email: true }
    });

    // Log activity (พ.ร.บ.คอมพิวเตอร์ฯ)
    await logActivity(
        userId,
        user?.email,
        'ACCOUNT_DELETE_CONFIRM',
        'User confirmed account deletion (soft delete)',
        { 
            scheduledDeleteAt: scheduledDeleteAt.toISOString(),
            deleteReason: request.reason
        },
        connectionInfo
    );

    // แจ้งเตือน User
    await createNotification(
        userId,
        'SYSTEM',
        'คำขอลบบัญชีได้รับการยืนยัน',
        `บัญชีของคุณจะถูกลบถาวรในวันที่ ${scheduledDeleteAt.toLocaleDateString('th-TH')} หากเปลี่ยนใจ สามารถยกเลิกได้ก่อนวันดังกล่าว`,
        '/profile/delete-account',
        { scheduledDeleteAt: scheduledDeleteAt.toISOString() }
    );

    // แจ้งเตือน Admin
    await notifyAdmins(
        'SYSTEM',
        'มีผู้ใช้ขอลบบัญชี',
        `ผู้ใช้ ${user?.email} ได้ยืนยันการลบบัญชี กำหนดลบวันที่ ${scheduledDeleteAt.toLocaleDateString('th-TH')}`,
        '/admin/users',
        { userId, userEmail: user?.email, scheduledDeleteAt: scheduledDeleteAt.toISOString() }
    );

    return {
        success: true,
        message: 'Account scheduled for deletion',
        deletionDate: scheduledDeleteAt.toISOString(),
        daysRemaining: 30
    };
};

/**
 * 16-BE4: Cancel Delete - ยกเลิกคำขอลบ
 */
const cancelDelete = async (userId, connectionInfo = {}) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    if (user.status !== 'PENDING_DELETION') {
        throw new ApiError(400, 'No pending deletion request to cancel');
    }

    // ยกเลิก deletion - คืนสถานะ user
    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: {
                status: 'ACTIVE',
                scheduledDeleteAt: null,
                deleteReason: null,
                isActive: true
            }
        }),
        // อัพเดท deletion requests ที่ completed เป็น cancelled
        prisma.deletionRequest.updateMany({
            where: {
                userId,
                status: 'COMPLETED'
            },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date()
            }
        })
    ]);

    // Log activity (พ.ร.บ.คอมพิวเตอร์ฯ)
    await logActivity(
        userId,
        user.email,
        'ACCOUNT_DELETE_CANCEL',
        'User cancelled account deletion',
        { cancelledAt: new Date().toISOString() },
        connectionInfo
    );

    // แจ้งเตือน User
    await createNotification(
        userId,
        'SYSTEM',
        'ยกเลิกคำขอลบบัญชีสำเร็จ',
        'บัญชีของคุณจะไม่ถูกลบแล้ว ขอบคุณที่ยังอยู่กับเรา!',
        '/profile',
        null
    );

    return {
        success: true,
        message: 'Account deletion cancelled successfully'
    };
};

/**
 * ดูสถานะการลบบัญชี
 */
const getDeletionStatus = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            status: true,
            scheduledDeleteAt: true,
            deleteReason: true
        }
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    if (user.status !== 'PENDING_DELETION') {
        return {
            isPendingDeletion: false,
            status: user.status
        };
    }

    // คำนวณจำนวนวันที่เหลือ
    const now = new Date();
    const deleteDate = new Date(user.scheduledDeleteAt);
    const diffTime = deleteDate - now;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
        isPendingDeletion: true,
        status: user.status,
        scheduledDeleteAt: user.scheduledDeleteAt,
        deleteReason: user.deleteReason,
        daysRemaining: Math.max(0, daysRemaining)
    };
};

/**
 * Resend OTP
 */
const resendOTP = async (userId) => {
    // หา pending request
    const request = await prisma.deletionRequest.findFirst({
        where: {
            userId,
            status: 'PENDING'
        },
        orderBy: { requestedAt: 'desc' }
    });

    if (!request) {
        throw new ApiError(404, 'No pending deletion request found');
    }

    // สร้าง OTP ใหม่
    const otpCode = generateOTP();
    const otpRef = generateOTPRef();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // อัพเดท request
    await prisma.deletionRequest.update({
        where: { id: request.id },
        data: {
            otpCode,
            otpRef,
            otpExpiresAt,
            otpAttempts: 0
        }
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const maskedPhone = user.phoneNumber 
        ? user.phoneNumber.replace(/(\d{3})\d{4}(\d{3})/, '$1-XXX-X$2')
        : 'N/A';

    return {
        success: true,
        message: 'New OTP sent to your phone',
        otpRef,
        maskedPhone,
        expiresIn: 300,
        devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined
    };
};

module.exports = {
    requestDelete,
    verifyDelete,
    confirmDelete,
    cancelDelete,
    getDeletionStatus,
    resendOTP
};
