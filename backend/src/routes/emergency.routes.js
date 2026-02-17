const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergency.controller');
const { protect, requireAdmin, requireDriver } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { z } = require('zod');

// ==================== Validation Schemas ====================

const createEmergencySchema = {
    body: z.object({
        type: z.enum(['ACCIDENT', 'MEDICAL', 'THREAT', 'VEHICLE_BREAKDOWN', 'OTHER']),
        description: z.string().max(500).optional().nullable(),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        address: z.string().max(255).optional().nullable(),
        rideId: z.string().optional().nullable()
    })
};

const cancelEmergencySchema = {
    body: z.object({
        reason: z.string().max(255).optional()
    })
};

const respondEmergencySchema = {
    body: z.object({
        adminNotes: z.string().max(500).optional()
    })
};

const saveContactSchema = {
    body: z.object({
        id: z.string().optional(),
        name: z.string().min(1).max(100),
        phone: z.string().regex(/^0\d{9}$/, 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0'),
        relationship: z.string().max(50).optional(),
        isPrimary: z.boolean().optional()
    })
};

// ==================== Driver Routes ====================

// Create emergency (SOS)
router.post(
    '/',
    protect,
    requireDriver,
    validate(createEmergencySchema),
    emergencyController.createEmergency
);

// Get driver's emergency history
router.get(
    '/my-emergencies',
    protect,
    requireDriver,
    emergencyController.getMyEmergencies
);

// ==================== Admin Routes ====================

// Get all emergencies (Admin)
router.get(
    '/admin/all',
    protect,
    requireAdmin,
    emergencyController.getAllEmergencies
);

// Get emergency statistics (Admin)
router.get(
    '/admin/stats',
    protect,
    requireAdmin,
    emergencyController.getEmergencyStats
);

// Respond to emergency (Admin)
router.patch(
    '/:id/respond',
    protect,
    requireAdmin,
    validate(respondEmergencySchema),
    emergencyController.respondToEmergency
);

// Resolve emergency (Admin)
router.patch(
    '/:id/resolve',
    protect,
    requireAdmin,
    validate(respondEmergencySchema),
    emergencyController.resolveEmergency
);

// ==================== Emergency Contacts ====================

// Get user's emergency contacts
router.get(
    '/contacts',
    protect,
    emergencyController.getContacts
);

// Save emergency contact
router.post(
    '/contacts',
    protect,
    validate(saveContactSchema),
    emergencyController.saveContact
);

// Delete emergency contact
router.delete(
    '/contacts/:id',
    protect,
    emergencyController.deleteContact
);

// ==================== Shared Routes ====================

// Get emergency by ID (must be after /admin routes)
router.get(
    '/:id',
    protect,
    emergencyController.getEmergencyById
);

// Cancel emergency
router.patch(
    '/:id/cancel',
    protect,
    requireDriver,
    validate(cancelEmergencySchema),
    emergencyController.cancelEmergency
);

module.exports = router;
