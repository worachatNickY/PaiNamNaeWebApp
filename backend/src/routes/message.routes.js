const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const messageController = require('../controllers/message.controller');
const { z } = require('zod');
const upload = require('../middlewares/upload.middleware');

const sendMessageSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty'),
  allowPersonalInfo: z.boolean().optional(),
});

const sendLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

// GET /api/messages/admin/:bookingId - list messages for a booking (admin)
// NOTE: must be defined before "/:bookingId" to avoid route param collision
router.get('/admin', protect, requireAdmin, messageController.listConversationsAdmin);
router.get('/admin/:bookingId', protect, requireAdmin, messageController.getMessagesAdmin);

// GET /api/messages/:bookingId - list messages for a booking (driver/passenger)
router.get('/:bookingId', protect, messageController.getMessages);

// POST /api/messages/:bookingId - send a text message
router.post(
  '/:bookingId',
  protect,
  validate({ body: sendMessageSchema }),
  messageController.sendMessage
);

// POST /api/messages/:bookingId/location - send location message
router.post(
  '/:bookingId/location',
  protect,
  validate({ body: sendLocationSchema }),
  messageController.sendLocation
);

// POST /api/messages/:bookingId/image - send image message
router.post(
  '/:bookingId/image',
  protect,
  upload.single('image'),
  messageController.sendImage
);

module.exports = router;

