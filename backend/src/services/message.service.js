const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

// Simple regex patterns to detect obvious personal info
const PHONE_REGEX = /\b0\d{8,9}\b/; // Thai-style numbers like 0XXXXXXXXX
const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

async function getBookingForUser(bookingId, userId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      route: {
        select: {
          driverId: true,
        },
      },
      passenger: {
        select: { id: true },
      },
    },
  });

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  const isDriver = booking.route.driverId === userId;
  const isPassenger = booking.passengerId === userId;

  if (!isDriver && !isPassenger) {
    throw new ApiError(403, 'You are not part of this ride');
  }

  return { booking, isDriver, isPassenger };
}

function checkRideStatus(booking) {
  if (booking.status === 'COMPLETED') {
    throw new ApiError(
      400,
      'Chat is no longer available after the ride has been completed.'
    );
  }
}

function validateMessageText(text, { allowPersonalInfo } = { allowPersonalInfo: false }) {
  if (!text || !text.trim()) {
    throw new ApiError(400, 'Message cannot be empty');
  }
  if (text.length > 1000) {
    throw new ApiError(400, 'Message is too long');
  }
  if (!allowPersonalInfo && (PHONE_REGEX.test(text) || EMAIL_REGEX.test(text))) {
    // ให้ frontend แสดง dialog ยืนยันก่อนส่ง
    throw new ApiError(
      400,
      'MESSAGE_CONTAINS_PERSONAL_INFO'
    );
  }
}

async function sendTextMessage(bookingId, senderId, text, options = {}) {
  const { allowPersonalInfo = false } = options;
  const { booking, isDriver, isPassenger } = await getBookingForUser(
    bookingId,
    senderId
  );

  checkRideStatus(booking);
  validateMessageText(text, { allowPersonalInfo });

  const receiverId = isDriver ? booking.passengerId : booking.route.driverId;

  const message = await prisma.message.create({
    data: {
      bookingId,
      senderId,
      receiverId,
      type: 'TEXT',
      text: text.trim(),
      status: 'SENT',
    },
  });

  return message;
}

async function listMessages(bookingId, userId) {
  await getBookingForUser(bookingId, userId); // access check

  const messages = await prisma.message.findMany({
    where: { bookingId },
    orderBy: { createdAt: 'asc' },
  });

  return messages;
}

module.exports = {
  sendTextMessage,
  listMessages,
};

