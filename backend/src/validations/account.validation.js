const { z } = require('zod');

// ==================== PBI #16: Account & Data Removal ====================

const deleteReasons = [
    'NOT_USING_ANYMORE',
    'PRIVACY_CONCERN',
    'FOUND_ALTERNATIVE',
    'BAD_EXPERIENCE',
    'TOO_MANY_NOTIFICATIONS',
    'OTHER'
];

const requestDeleteSchema = {
    body: z.object({
        reason: z.enum(deleteReasons, {
            errorMap: () => ({ message: 'Please select a valid reason' })
        }),
        otherReason: z.string().max(500).optional()
    }).refine(
        (data) => {
            // ถ้าเลือก OTHER ต้องกรอก otherReason
            if (data.reason === 'OTHER' && !data.otherReason) {
                return false;
            }
            return true;
        },
        { message: 'Please specify your reason', path: ['otherReason'] }
    )
};

const verifyDeleteSchema = {
    body: z.object({
        otp: z.string()
            .length(6, 'OTP must be 6 digits')
            .regex(/^\d{6}$/, 'OTP must contain only numbers'),
        otpRef: z.string()
            .min(1, 'OTP reference is required')
    })
};

const confirmDeleteSchema = {
    body: z.object({
        deleteToken: z.string().min(1, 'Delete token is required')
    })
};

module.exports = {
    requestDeleteSchema,
    verifyDeleteSchema,
    confirmDeleteSchema
};
