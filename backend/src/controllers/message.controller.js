const asyncHandler = require('express-async-handler');
const messageService = require('../services/message.service');

// POST /api/messages/:bookingId - send a text message within an active ride
const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user.sub;
  const { bookingId } = req.params;
  const { text, allowPersonalInfo } = req.body;

  const message = await messageService.sendTextMessage(
    bookingId,
    senderId,
    text,
    { allowPersonalInfo: !!allowPersonalInfo }
  );

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: message,
  });
});

// GET /api/messages/:bookingId - list messages for a ride (driver/passenger only)
const getMessages = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const { bookingId } = req.params;

  const messages = await messageService.listMessages(bookingId, userId);

  res.status(200).json({
    success: true,
    data: messages,
  });
});

module.exports = {
  sendMessage,
  getMessages,
};

