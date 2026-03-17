const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

// Simple regex patterns to detect obvious personal info
const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const ADDRESS_REGEX = /(ที่อยู่|เลขที่|ถนน|ซอย|หมู่|ต\.|อ\.|จ\.|แขวง|เขต|ตำบล|อำเภอ|จังหวัด|road|rd\.|street|st\.|soi|subdistrict|district|province|address)/i;

function hasPhoneLike(text) {
  if (!text) return false;
  const digits = String(text).replace(/\D/g, '');
  if (digits.length < 9) return false;
  if (/0\d{8,9}/.test(digits)) return true;
  if (/66\d{8,9}/.test(digits)) return true;
  return false;
}

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
  // เพื่อกันหลุดทุกเคสใน sprint นี้:
  // ถ้ายังไม่ได้ยืนยัน allowPersonalInfo ให้บล็อกการส่งข้อความทุกประเภท
  // แล้วให้ frontend เปิด modal ถามยืนยันก่อน
  if (!allowPersonalInfo) {
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

async function sendLocationMessage(bookingId, senderId, { latitude, longitude }) {
  const { booking, isDriver } = await getBookingForUser(bookingId, senderId);
  checkRideStatus(booking);

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new ApiError(400, 'Invalid location');
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new ApiError(400, 'Invalid location');
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new ApiError(400, 'Invalid location');
  }

  const receiverId = isDriver ? booking.passengerId : booking.route.driverId;

  const message = await prisma.message.create({
    data: {
      bookingId,
      senderId,
      receiverId,
      type: 'LOCATION',
      latitude,
      longitude,
      status: 'SENT',
    },
  });

  return message;
}

async function sendImageMessage(bookingId, senderId, mediaUrl) {
  const { booking, isDriver } = await getBookingForUser(bookingId, senderId);
  checkRideStatus(booking);

  if (!mediaUrl || typeof mediaUrl !== 'string') {
    throw new ApiError(400, 'Invalid image URL');
  }

  const receiverId = isDriver ? booking.passengerId : booking.route.driverId;

  const message = await prisma.message.create({
    data: {
      bookingId,
      senderId,
      receiverId,
      type: 'IMAGE',
      mediaUrl,
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
  sendLocationMessage,
  sendImageMessage,
  listMessages,
};

