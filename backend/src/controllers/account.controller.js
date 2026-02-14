const asyncHandler = require('express-async-handler');
const accountService = require('../services/account.service');
const ApiError = require('../utils/ApiError');

// ==================== PBI #16: Account & Data Removal ====================

/**
 * Extract connection info จาก request (สำหรับ พ.ร.บ.คอมพิวเตอร์ฯ)
 */
const getConnectionInfo = (req) => ({
    ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent'] || null,
    deviceInfo: req.headers['x-device-info'] || null
});

/**
 * POST /api/account/request-delete
 * ส่งคำขอลบบัญชี + รับ OTP
 */
const requestDelete = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const { reason, otherReason } = req.body;
    const connectionInfo = getConnectionInfo(req);

    const result = await accountService.requestDelete(userId, reason, otherReason, connectionInfo);

    res.status(200).json(result);
});

/**
 * POST /api/account/verify-delete
 * ยืนยัน OTP
 */
const verifyDelete = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const { otp, otpRef } = req.body;

    const result = await accountService.verifyDelete(userId, otp, otpRef);

    res.status(200).json(result);
});

/**
 * DELETE /api/account/confirm
 * ยืนยันการลบบัญชี (Soft Delete)
 */
const confirmDelete = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const { deleteToken } = req.body;
    const connectionInfo = getConnectionInfo(req);

    const result = await accountService.confirmDelete(userId, deleteToken, connectionInfo);

    res.status(200).json(result);
});

/**
 * POST /api/account/cancel-delete
 * ยกเลิกคำขอลบบัญชี
 */
const cancelDelete = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const connectionInfo = getConnectionInfo(req);

    const result = await accountService.cancelDelete(userId, connectionInfo);

    res.status(200).json(result);
});

/**
 * GET /api/account/deletion-status
 * ดูสถานะการลบบัญชี
 */
const getDeletionStatus = asyncHandler(async (req, res) => {
    const userId = req.user.sub;

    const result = await accountService.getDeletionStatus(userId);

    res.status(200).json({
        success: true,
        data: result
    });
});

/**
 * POST /api/account/resend-otp
 * ส่ง OTP ใหม่
 */
const resendOTP = asyncHandler(async (req, res) => {
    const userId = req.user.sub;

    const result = await accountService.resendOTP(userId);

    res.status(200).json(result);
});

module.exports = {
    requestDelete,
    verifyDelete,
    confirmDelete,
    cancelDelete,
    getDeletionStatus,
    resendOTP
};
