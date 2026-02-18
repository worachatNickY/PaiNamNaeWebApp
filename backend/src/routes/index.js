const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const vehicleRoutes = require('./vehicle.routes');
const routeRoutes   = require('./route.routes');
const driverVerifRoutes = require('./driverVerification.routes');
const bookingRoutes = require('./booking.routes');
const notificationRoutes = require('./notification.routes')
const mapRoutes = require('./maps.routes')
const accountRoutes = require('./account.routes'); // PBI #16
const activityLogRoutes = require('./activityLog.routes'); // Activity Log (Admin)
const emergencyRoutes = require('./emergency.routes'); // PBI #8: Emergency SOS
const driverReportRoutes = require('./driverReport.routes'); // PBI #13: Driver Reports

const router = express.Router();

// Health Check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/routes', routeRoutes);
router.use('/driver-verifications', driverVerifRoutes);
router.use('/bookings', bookingRoutes);
router.use('/notifications', notificationRoutes);
router.use('/maps', mapRoutes);
router.use('/account', accountRoutes); // PBI #16: Account Deletion
router.use('/activity-logs', activityLogRoutes); // Activity Log (Admin)
router.use('/emergency', emergencyRoutes); // PBI #8: Emergency SOS
router.use('/reports', driverReportRoutes); // PBI #13: Driver Reports

module.exports = router;