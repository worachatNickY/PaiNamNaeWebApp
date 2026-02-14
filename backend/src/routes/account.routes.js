const express = require('express');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const accountController = require('../controllers/account.controller');
const {
    requestDeleteSchema,
    verifyDeleteSchema,
    confirmDeleteSchema
} = require('../validations/account.validation');

// ==================== PBI #16: Account & Data Removal ====================

const router = express.Router();

/**
 * @route POST /api/account/request-delete
 * @desc ส่งคำขอลบบัญชี + รับ OTP
 * @access Private
 */
router.post(
    '/request-delete',
    protect,
    validate(requestDeleteSchema),
    accountController.requestDelete
);

/**
 * @route POST /api/account/verify-delete
 * @desc ยืนยัน OTP
 * @access Private
 */
router.post(
    '/verify-delete',
    protect,
    validate(verifyDeleteSchema),
    accountController.verifyDelete
);

/**
 * @route DELETE /api/account/confirm
 * @desc ยืนยันการลบบัญชี (Soft Delete)
 * @access Private
 */
router.delete(
    '/confirm',
    protect,
    validate(confirmDeleteSchema),
    accountController.confirmDelete
);

/**
 * @route POST /api/account/cancel-delete
 * @desc ยกเลิกคำขอลบบัญชี
 * @access Private
 */
router.post(
    '/cancel-delete',
    protect,
    accountController.cancelDelete
);

/**
 * @route GET /api/account/deletion-status
 * @desc ดูสถานะการลบบัญชี
 * @access Private
 */
router.get(
    '/deletion-status',
    protect,
    accountController.getDeletionStatus
);

/**
 * @route POST /api/account/resend-otp
 * @desc ส่ง OTP ใหม่
 * @access Private
 */
router.post(
    '/resend-otp',
    protect,
    accountController.resendOTP
);

module.exports = router;
