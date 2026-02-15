const prisma = require('../utils/prisma');
const { logActivity } = require('./activityLog.service');

// ==================== Report Categories & Types Mapping ====================
const REPORT_TYPES_BY_CATEGORY = {
    DRIVING_BEHAVIOR: ['SPEEDING', 'RECKLESS_DRIVING', 'PHONE_WHILE_DRIVING'],
    VEHICLE_CONDITION: ['DIRTY_VEHICLE', 'VEHICLE_MALFUNCTION', 'BAD_SMELL'],
    SERVICE_QUALITY: ['RUDE_BEHAVIOR', 'UNPROFESSIONAL', 'LATE_ARRIVAL', 'WRONG_ROUTE'],
    SAFETY_CONCERN: ['UNSAFE_FEELING', 'HARASSMENT', 'INTOXICATED'],
    PAYMENT_ISSUE: ['OVERCHARGING', 'REFUSED_PAYMENT_METHOD'],
    OTHER: ['NO_SHOW', 'OTHER']
};

const TYPE_LABELS = {
    SPEEDING: 'ขับรถเร็วเกินไป',
    RECKLESS_DRIVING: 'ขับรถประมาท',
    PHONE_WHILE_DRIVING: 'ใช้โทรศัพท์ขณะขับรถ',
    DIRTY_VEHICLE: 'รถไม่สะอาด',
    VEHICLE_MALFUNCTION: 'รถมีปัญหา/ชำรุด',
    BAD_SMELL: 'รถมีกลิ่นไม่พึงประสงค์',
    RUDE_BEHAVIOR: 'พูดจาไม่สุภาพ',
    UNPROFESSIONAL: 'ไม่เป็นมืออาชีพ',
    LATE_ARRIVAL: 'มาสาย',
    WRONG_ROUTE: 'ไม่ตามเส้นทาง',
    UNSAFE_FEELING: 'รู้สึกไม่ปลอดภัย',
    HARASSMENT: 'ถูกคุกคาม',
    INTOXICATED: 'สงสัยว่าเมา',
    OVERCHARGING: 'เรียกเก็บเงินเกิน',
    REFUSED_PAYMENT_METHOD: 'ไม่รับวิธีชำระเงิน',
    NO_SHOW: 'ไม่มารับ',
    OTHER: 'อื่นๆ'
};

const CATEGORY_LABELS = {
    DRIVING_BEHAVIOR: 'พฤติกรรมการขับขี่',
    VEHICLE_CONDITION: 'สภาพรถ',
    SERVICE_QUALITY: 'คุณภาพบริการ',
    SAFETY_CONCERN: 'ความปลอดภัย',
    PAYMENT_ISSUE: 'ปัญหาการเงิน',
    OTHER: 'อื่นๆ'
};

// ==================== Passenger Functions ====================

/**
 * สร้าง report คนขับ
 */
const createReport = async (reporterId, data, connectionInfo = {}) => {
    // ตรวจสอบว่า driver มีอยู่จริง
    const driver = await prisma.user.findUnique({
        where: { id: data.driverId },
        select: { id: true, role: true, firstName: true, email: true }
    });

    if (!driver) {
        throw new Error('Driver not found');
    }

    if (driver.role !== 'DRIVER') {
        throw new Error('User is not a driver');
    }

    // ตรวจสอบว่าไม่ report ตัวเอง
    if (reporterId === data.driverId) {
        throw new Error('Cannot report yourself');
    }

    // ตรวจสอบ booking (ถ้ามี)
    if (data.bookingId) {
        const booking = await prisma.booking.findUnique({
            where: { id: data.bookingId },
            include: { route: true }
        });

        if (!booking || booking.passengerId !== reporterId) {
            throw new Error('Invalid booking');
        }

        if (booking.route.driverId !== data.driverId) {
            throw new Error('Booking does not match driver');
        }
    }

    // Determine severity based on report type
    const severity = determineSeverity(data.type);

    // สร้าง report
    const report = await prisma.driverReport.create({
        data: {
            reporterId,
            driverId: data.driverId,
            bookingId: data.bookingId || null,
            category: data.category,
            type: data.type,
            severity,
            description: data.description,
            attachments: data.attachments || null
        },
        include: {
            driver: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    profilePicture: true
                }
            },
            booking: {
                include: {
                    route: {
                        select: {
                            startLocation: true,
                            endLocation: true,
                            departureTime: true
                        }
                    }
                }
            }
        }
    });

    // Log activity
    const reporter = await prisma.user.findUnique({
        where: { id: reporterId },
        select: { email: true }
    });

    await logActivity({
        userId: reporterId,
        userEmail: reporter?.email,
        activityType: 'REPORT_SUBMIT',
        description: `Passenger reported driver: ${data.type}`,
        metadata: {
            reportId: report.id,
            driverId: data.driverId,
            category: data.category,
            type: data.type
        },
        connectionInfo
    });

    // Notify admins
    await notifyAdmins(
        'SYSTEM',
        'New Driver Report',
        `A passenger has reported a driver for ${TYPE_LABELS[data.type] || data.type}`,
        `/admin/reports/${report.id}`,
        { reportId: report.id, severity }
    );

    return report;
};

/**
 * ดึง reports ที่ผู้โดยสารส่งไป
 */
const getMyReports = async (reporterId, filters = {}) => {
    const { status, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = { reporterId };
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
        prisma.driverReport.findMany({
            where,
            include: {
                driver: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true
                    }
                },
                booking: {
                    include: {
                        route: {
                            select: {
                                startLocation: true,
                                endLocation: true,
                                departureTime: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.driverReport.count({ where })
    ]);

    return {
        reports,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

// ==================== Driver Functions ====================

/**
 * คนขับ: ดูรายงานที่ถูกรายงาน
 * - แสดงเฉพาะรายงานที่ดำเนินการแล้ว (RESOLVED/DISMISSED) เพื่อป้องกันการคุกคาม
 * - ไม่แสดงข้อมูลผู้รายงาน (เพื่อความเป็นส่วนตัว)
 */
const getReportsAgainstMe = async (driverId, filters = {}) => {
    const { status, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    // แสดงเฉพาะรายงานที่ดำเนินการแล้ว หรือตาม status ที่ระบุ
    const where = { 
        driverId,
        status: status || { in: ['RESOLVED', 'DISMISSED', 'REVIEWING', 'PENDING'] }
    };

    const [reports, total] = await Promise.all([
        prisma.driverReport.findMany({
            where,
            select: {
                id: true,
                category: true,
                type: true,
                severity: true,
                description: true,
                status: true,
                resolution: true,
                createdAt: true,
                resolvedAt: true,
                // ไม่รวมข้อมูลผู้รายงานเพื่อความเป็นส่วนตัว
                booking: {
                    select: {
                        id: true,
                        route: {
                            select: {
                                startLocation: true,
                                endLocation: true,
                                departureTime: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.driverReport.count({ where })
    ]);

    // เพิ่ม label ภาษาไทย
    const reportsWithLabels = reports.map(report => ({
        ...report,
        categoryLabel: CATEGORY_LABELS[report.category] || report.category,
        typeLabel: TYPE_LABELS[report.type] || report.type
    }));

    return {
        reports: reportsWithLabels,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * คนขับ: สถิติรายงานของตัวเอง
 */
const getMyReportStats = async (driverId) => {
    const stats = await prisma.driverReport.groupBy({
        by: ['status'],
        where: { driverId },
        _count: { status: true }
    });

    const bySeverity = await prisma.driverReport.groupBy({
        by: ['severity'],
        where: { driverId },
        _count: { severity: true }
    });

    return {
        byStatus: stats.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
        }, {}),
        bySeverity: bySeverity.reduce((acc, item) => {
            acc[item.severity] = item._count.severity;
            return acc;
        }, {}),
        total: stats.reduce((sum, item) => sum + item._count.status, 0)
    };
};

// ==================== Admin Functions ====================

/**
 * Admin: ดึง reports ทั้งหมด
 */
const getAllReports = async (filters = {}) => {
    const { status, category, severity, search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (severity) where.severity = severity;
    if (search) {
        where.OR = [
            { driver: { username: { contains: search, mode: 'insensitive' } } },
            { driver: { firstName: { contains: search, mode: 'insensitive' } } },
            { reporter: { username: { contains: search, mode: 'insensitive' } } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }

    const [reports, total] = await Promise.all([
        prisma.driverReport.findMany({
            where,
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true
                    }
                },
                driver: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        phoneNumber: true,
                        email: true
                    }
                },
                booking: {
                    include: {
                        route: {
                            select: {
                                startLocation: true,
                                endLocation: true,
                                departureTime: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { severity: 'desc' },
                { createdAt: 'desc' }
            ],
            skip,
            take: limit
        }),
        prisma.driverReport.count({ where })
    ]);

    return {
        reports,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Admin: ดึง report by ID
 */
const getReportById = async (id) => {
    const report = await prisma.driverReport.findUnique({
        where: { id },
        include: {
            reporter: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    profilePicture: true,
                    phoneNumber: true,
                    email: true
                }
            },
            driver: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    profilePicture: true,
                    phoneNumber: true,
                    email: true,
                    createdAt: true,
                    reportsReceived: {
                        select: { id: true, status: true, type: true }
                    }
                }
            },
            booking: {
                include: {
                    route: {
                        select: {
                            startLocation: true,
                            endLocation: true,
                            departureTime: true,
                            pricePerSeat: true
                        }
                    }
                }
            }
        }
    });

    if (!report) {
        throw new Error('Report not found');
    }

    return report;
};

/**
 * Admin: เริ่มตรวจสอบ report
 */
const startReview = async (id, adminId) => {
    const report = await prisma.driverReport.findUnique({ where: { id } });

    if (!report) {
        throw new Error('Report not found');
    }

    if (report.status !== 'PENDING') {
        throw new Error('Report is not in PENDING status');
    }

    return prisma.driverReport.update({
        where: { id },
        data: {
            status: 'REVIEWING',
            reviewedById: adminId,
            reviewedAt: new Date()
        },
        include: {
            driver: { select: { id: true, firstName: true } },
            reporter: { select: { id: true, firstName: true } }
        }
    });
};

/**
 * Admin: ปิด report (resolved หรือ dismissed)
 */
const resolveReport = async (id, adminId, data) => {
    const report = await prisma.driverReport.findUnique({
        where: { id },
        include: { driver: true, reporter: true }
    });

    if (!report) {
        throw new Error('Report not found');
    }

    if (!['PENDING', 'REVIEWING'].includes(report.status)) {
        throw new Error('Report cannot be resolved');
    }

    const updated = await prisma.driverReport.update({
        where: { id },
        data: {
            status: data.status, // RESOLVED or DISMISSED
            adminNotes: data.adminNotes,
            resolution: data.resolution,
            reviewedById: adminId,
            resolvedAt: new Date()
        },
        include: {
            driver: { select: { id: true, firstName: true, email: true } },
            reporter: { select: { id: true, firstName: true } }
        }
    });

    // Notify reporter about resolution
    await createNotification(
        report.reporterId,
        'SYSTEM',
        'Report Update',
        data.status === 'RESOLVED'
            ? 'Your report has been reviewed and action has been taken. Thank you for helping us improve.'
            : 'Your report has been reviewed. Thank you for your feedback.',
        `/profile/my-reports/${id}`,
        { reportId: id, status: data.status }
    );

    return updated;
};

/**
 * Admin: ดึง statistics
 */
const getReportStats = async () => {
    const [
        totalPending,
        totalReviewing,
        totalResolved,
        totalDismissed,
        byCategory,
        bySeverity,
        recentReports
    ] = await Promise.all([
        prisma.driverReport.count({ where: { status: 'PENDING' } }),
        prisma.driverReport.count({ where: { status: 'REVIEWING' } }),
        prisma.driverReport.count({ where: { status: 'RESOLVED' } }),
        prisma.driverReport.count({ where: { status: 'DISMISSED' } }),
        prisma.driverReport.groupBy({
            by: ['category'],
            _count: { category: true }
        }),
        prisma.driverReport.groupBy({
            by: ['severity'],
            _count: { severity: true }
        }),
        prisma.driverReport.findMany({
            where: { status: { in: ['PENDING', 'REVIEWING'] } },
            include: {
                reporter: { select: { id: true, firstName: true } },
                driver: { select: { id: true, firstName: true } }
            },
            orderBy: [
                { severity: 'desc' },
                { createdAt: 'desc' }
            ],
            take: 5
        })
    ]);

    return {
        counts: {
            pending: totalPending,
            reviewing: totalReviewing,
            resolved: totalResolved,
            dismissed: totalDismissed,
            total: totalPending + totalReviewing + totalResolved + totalDismissed
        },
        byCategory: byCategory.reduce((acc, item) => {
            acc[item.category] = item._count.category;
            return acc;
        }, {}),
        bySeverity: bySeverity.reduce((acc, item) => {
            acc[item.severity] = item._count.severity;
            return acc;
        }, {}),
        recentReports
    };
};

/**
 * ดึง reports ของ driver คนใดคนหนึ่ง
 */
const getDriverReportHistory = async (driverId) => {
    const reports = await prisma.driverReport.findMany({
        where: { driverId },
        include: {
            reporter: {
                select: { id: true, firstName: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    const stats = await prisma.driverReport.groupBy({
        by: ['status'],
        where: { driverId },
        _count: { status: true }
    });

    return {
        reports,
        stats: stats.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
        }, {})
    };
};

// ==================== Helper Functions ====================

const determineSeverity = (type) => {
    const severityMap = {
        // Critical
        HARASSMENT: 'CRITICAL',
        INTOXICATED: 'CRITICAL',
        
        // High
        UNSAFE_FEELING: 'HIGH',
        RECKLESS_DRIVING: 'HIGH',
        SPEEDING: 'HIGH',
        
        // Medium
        PHONE_WHILE_DRIVING: 'MEDIUM',
        RUDE_BEHAVIOR: 'MEDIUM',
        OVERCHARGING: 'MEDIUM',
        WRONG_ROUTE: 'MEDIUM',
        NO_SHOW: 'MEDIUM',
        
        // Low
        DIRTY_VEHICLE: 'LOW',
        BAD_SMELL: 'LOW',
        LATE_ARRIVAL: 'LOW',
        UNPROFESSIONAL: 'LOW',
        VEHICLE_MALFUNCTION: 'LOW',
        REFUSED_PAYMENT_METHOD: 'LOW',
        OTHER: 'LOW'
    };
    
    return severityMap[type] || 'MEDIUM';
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
    createReport,
    getMyReports,
    getReportsAgainstMe,
    getMyReportStats,
    getAllReports,
    getReportById,
    startReview,
    resolveReport,
    getReportStats,
    getDriverReportHistory,
    REPORT_TYPES_BY_CATEGORY,
    TYPE_LABELS,
    CATEGORY_LABELS
};
