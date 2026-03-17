const asyncHandler = require('express-async-handler');
const messageService = require('../services/message.service');
const ApiError = require('../utils/ApiError');
const { uploadToCloudinary } = require('../utils/cloudinary');

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
  sendLocation: asyncHandler(async (req, res) => {
    const senderId = req.user.sub;
    const { bookingId } = req.params;
    const { latitude, longitude } = req.body;

    const message = await messageService.sendLocationMessage(bookingId, senderId, {
      latitude,
      longitude,
    });

    res.status(201).json({
      success: true,
      message: 'Location sent successfully',
      data: message,
    });
  }),
  sendImage: asyncHandler(async (req, res) => {
    const senderId = req.user.sub;
    const { bookingId } = req.params;

    const file = req.file;
    if (!file || !file.buffer) {
      throw new ApiError(400, 'Image file is required');
    }

    const uploaded = await uploadToCloudinary(file.buffer, 'painamnae/messages');
    const message = await messageService.sendImageMessage(bookingId, senderId, uploaded.url);

    res.status(201).json({
      success: true,
      message: 'Image sent successfully',
      data: message,
    });
  }),
  getMessages,
};

