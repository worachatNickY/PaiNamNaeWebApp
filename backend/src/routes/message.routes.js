const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const messageController = require('../controllers/message.controller');
const { z } = require('zod');

const sendMessageSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty'),
  allowPersonalInfo: z.boolean().optional(),
});

// GET /api/messages/:bookingId - list messages for a booking
router.get('/:bookingId', protect, messageController.getMessages);

// POST /api/messages/:bookingId - send a text message
router.post(
  '/:bookingId',
  protect,
  validate({ body: sendMessageSchema }),
  messageController.sendMessage
);

module.exports = router;

