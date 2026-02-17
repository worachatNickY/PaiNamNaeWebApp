const prisma = require('../utils/prisma');
const { logActivity } = require('./activityLog.service');
const ApiError = require('../utils/ApiError');

/**
 * สร้างคำขอฉุกเฉิน (SOS)
 */
const createEmergencyRequest = async (driverId, data, connectionInfo = {}) => {
    // ตรวจสอบว่าเป็น driver
    const driver = await prisma.user.findUnique({
        where: { id: driverId },
        include: { driverVerification: true }
    });

    if (!driver || driver.role !== 'DRIVER') {
        throw new ApiError(403, 'Only verified drivers can create emergency requests');
    }

    // ตรวจสอบว่ามี active emergency request อยู่หรือไม่
    const existingActive = await prisma.emergencyRequest.findFirst({
        where: {
            driverId,
            status: { in: ['ACTIVE', 'RESPONDING'] }
        }
    });

    if (existingActive) {
        throw new ApiError(400, 'You already have an active emergency request');
    }

    // สร้าง emergency request
    const emergencyRequest = await prisma.emergencyRequest.create({
        data: {
            driverId,
            type: data.type,
            description: data.description || null,
            latitude: data.latitude,
            longitude: data.longitude,
            address: data.address || null,
            rideId: data.rideId || null,
            status: 'ACTIVE'
        },
        include: {
            driver: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    phoneNumber: true,
                    email: true
                }
            }
        }
    });

    // Log activity
    await logActivity({
        userId: driverId,
        userEmail: driver.email,
        activityType: 'EMERGENCY_REQUEST',
        description: `Driver created emergency request: ${data.type}`,
        metadata: {
            emergencyId: emergencyRequest.id,
            type: data.type,
            latitude: data.latitude,
            longitude: data.longitude
        },
        connectionInfo
    });

    // Notify admins
    await notifyAdmins(
        'EMERGENCY',
        'SOS: Driver Emergency',
        `Driver ${driver.firstName || driver.username} has requested emergency assistance (${getEmergencyTypeLabel(data.type)})`,
        `/admin/emergencies/${emergencyRequest.id}`,
        { emergencyId: emergencyRequest.id, driverId, type: data.type }
    );

    return emergencyRequest;
};

/**
 * ดึงรายการ emergency requests ของ driver
 */
const getDriverEmergencies = async (driverId, filters = {}) => {
    const { status, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = { driverId };
    if (status) where.status = status;

    const [requests, total] = await Promise.all([
        prisma.emergencyRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.emergencyRequest.count({ where })
    ]);

    return {
        requests,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * ดึง emergency request by ID
 */
const getEmergencyById = async (id, userId = null, isAdmin = false) => {
    const emergency = await prisma.emergencyRequest.findUnique({
        where: { id },
        include: {
            driver: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    phoneNumber: true,
                    email: true,
                    profilePicture: true
                }
            }
        }
    });

    if (!emergency) {
        throw new ApiError(404, 'Emergency request not found');
    }

    // ตรวจสอบสิทธิ์: Admin หรือ driver ที่เป็นเจ้าของ
    if (!isAdmin && emergency.driverId !== userId) {
        throw new ApiError(403, 'Not authorized to view this emergency request');
    }

    return emergency;
};

/**
 * ยกเลิก emergency request (กดผิด)
 */
const cancelEmergency = async (id, driverId, reason, connectionInfo = {}) => {
    const emergency = await prisma.emergencyRequest.findUnique({
        where: { id },
        include: { driver: true }
    });

    if (!emergency) {
        throw new ApiError(404, 'Emergency request not found');
    }

    if (emergency.driverId !== driverId) {
        throw new ApiError(403, 'Not authorized to cancel this emergency request');
    }

    if (!['ACTIVE', 'RESPONDING'].includes(emergency.status)) {
        throw new ApiError(400, 'Cannot cancel this emergency request');
    }

    const updated = await prisma.emergencyRequest.update({
        where: { id },
        data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancelReason: reason || 'False alarm'
        }
    });

    // Log activity
    await logActivity({
        userId: driverId,
        userEmail: emergency.driver.email,
        activityType: 'EMERGENCY_REQUEST',
        description: `Driver cancelled emergency request`,
        metadata: { emergencyId: id, reason },
        connectionInfo
    });

    return updated;
};

// ==================== Admin Functions ====================

/**
 * Admin: ดึงรายการ emergency requests ทั้งหมด
 */
const getAllEmergencies = async (filters = {}) => {
    const { status, type, search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
        where.OR = [
            { driver: { username: { contains: search, mode: 'insensitive' } } },
            { driver: { firstName: { contains: search, mode: 'insensitive' } } },
            { driver: { phoneNumber: { contains: search } } },
            { address: { contains: search, mode: 'insensitive' } }
        ];
    }

    const [requests, total] = await Promise.all([
        prisma.emergencyRequest.findMany({
            where,
            include: {
                driver: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        phoneNumber: true,
                        profilePicture: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.emergencyRequest.count({ where })
    ]);

    return {
        requests,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Admin: ตอบรับ emergency request
 */
const respondToEmergency = async (id, adminId, adminNotes) => {
    const emergency = await prisma.emergencyRequest.findUnique({
        where: { id },
        include: { driver: true }
    });

    if (!emergency) {
        throw new ApiError(404, 'Emergency request not found');
    }

    if (emergency.status !== 'ACTIVE') {
        throw new ApiError(400, 'Emergency is not in ACTIVE status');
    }

    const updated = await prisma.emergencyRequest.update({
        where: { id },
        data: {
            status: 'RESPONDING',
            respondedAt: new Date(),
            adminNotes
        },
        include: { driver: true }
    });

    // Notify driver
    await createNotification(
        emergency.driverId,
        'EMERGENCY',
        'Help is on the way',
        'Admin has acknowledged your emergency request and help is being dispatched.',
        `/emergency/${id}`,
        { emergencyId: id }
    );

    return updated;
};

/**
 * Admin: แก้ไข emergency request เสร็จสิ้น
 */
const resolveEmergency = async (id, adminId, adminNotes) => {
    const emergency = await prisma.emergencyRequest.findUnique({
        where: { id },
        include: { driver: true }
    });

    if (!emergency) {
        throw new ApiError(404, 'Emergency request not found');
    }

    if (!['ACTIVE', 'RESPONDING'].includes(emergency.status)) {
        throw new ApiError(400, 'Cannot resolve this emergency');
    }

    const updated = await prisma.emergencyRequest.update({
        where: { id },
        data: {
            status: 'RESOLVED',
            resolvedAt: new Date(),
            resolvedById: adminId,
            adminNotes: adminNotes || emergency.adminNotes
        },
        include: { driver: true }
    });

    // Notify driver
    await createNotification(
        emergency.driverId,
        'EMERGENCY',
        'Emergency Resolved',
        'Your emergency request has been resolved. We hope you are safe.',
        `/emergency/${id}`,
        { emergencyId: id }
    );

    return updated;
};

/**
 * Admin: ดึง statistics
 */
const getEmergencyStats = async () => {
    const [
        totalActive,
        totalResponding,
        totalResolved,
        totalCancelled,
        byType,
        recentEmergencies
    ] = await Promise.all([
        prisma.emergencyRequest.count({ where: { status: 'ACTIVE' } }),
        prisma.emergencyRequest.count({ where: { status: 'RESPONDING' } }),
        prisma.emergencyRequest.count({ where: { status: 'RESOLVED' } }),
        prisma.emergencyRequest.count({ where: { status: 'CANCELLED' } }),
        prisma.emergencyRequest.groupBy({
            by: ['type'],
            _count: { type: true }
        }),
        prisma.emergencyRequest.findMany({
            where: { status: { in: ['ACTIVE', 'RESPONDING'] } },
            include: {
                driver: {
                    select: { id: true, username: true, firstName: true, phoneNumber: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        })
    ]);

    return {
        counts: {
            active: totalActive,
            responding: totalResponding,
            resolved: totalResolved,
            cancelled: totalCancelled,
            total: totalActive + totalResponding + totalResolved + totalCancelled
        },
        byType: byType.reduce((acc, item) => {
            acc[item.type] = item._count.type;
            return acc;
        }, {}),
        recentEmergencies
    };
};

// ==================== Emergency Contacts ====================

/**
 * เพิ่ม/อัพเดท emergency contacts
 */
const saveEmergencyContact = async (userId, data) => {
    // ถ้า isPrimary = true, reset อันอื่นก่อน
    if (data.isPrimary) {
        await prisma.emergencyContact.updateMany({
            where: { userId },
            data: { isPrimary: false }
        });
    }

    if (data.id) {
        // Update existing
        return prisma.emergencyContact.update({
            where: { id: data.id, userId },
            data: {
                name: data.name,
                phone: data.phone,
                relationship: data.relationship,
                isPrimary: data.isPrimary || false
            }
        });
    } else {
        // Create new
        return prisma.emergencyContact.create({
            data: {
                userId,
                name: data.name,
                phone: data.phone,
                relationship: data.relationship,
                isPrimary: data.isPrimary || false
            }
        });
    }
};

/**
 * ดึง emergency contacts ของ user
 */
const getEmergencyContacts = async (userId) => {
    return prisma.emergencyContact.findMany({
        where: { userId },
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }]
    });
};

/**
 * ลบ emergency contact
 */
const deleteEmergencyContact = async (id, userId) => {
    const contact = await prisma.emergencyContact.findUnique({
        where: { id }
    });

    if (!contact || contact.userId !== userId) {
        throw new ApiError(404, 'Contact not found or not authorized');
    }

    return prisma.emergencyContact.delete({ where: { id } });
};

// ==================== Helper Functions ====================

const getEmergencyTypeLabel = (type) => {
    const labels = {
        ACCIDENT: 'Accident',
        MEDICAL: 'Medical Emergency',
        THREAT: 'Threat/Danger',
        VEHICLE_BREAKDOWN: 'Vehicle Breakdown',
        OTHER: 'Other'
    };
    return labels[type] || type;
};

const createNotification = async (userId, type, title, body, link = null, metadata = null) => {
    try {
        await prisma.notification.create({
            data: { userId, type, title, body, link, metadata }
        });
    } catch (error) {
        console.error('Failed to create notification:', error.message);
    }
};

const notifyAdmins = async (type, title, body, link = null, metadata = null) => {
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN', isActive: true },
            select: { id: true }
        });

        for (const admin of admins) {
            await createNotification(admin.id, type, title, body, link, metadata);
        }
    } catch (error) {
        console.error('Failed to notify admins:', error.message);
    }
};

module.exports = {
    createEmergencyRequest,
    getDriverEmergencies,
    getEmergencyById,
    cancelEmergency,
    getAllEmergencies,
    respondToEmergency,
    resolveEmergency,
    getEmergencyStats,
    saveEmergencyContact,
    getEmergencyContacts,
    deleteEmergencyContact
};
