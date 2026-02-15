const asyncHandler = require('express-async-handler');
const driverReportService = require('../services/driverReport.service');
const { getConnectionInfo } = require('../services/activityLog.service');

// ==================== Passenger Endpoints ====================

/**
 * @desc    Create driver report
 * @route   POST /api/reports
 * @access  Private (Passenger only)
 */
const createReport = asyncHandler(async (req, res) => {
    const connectionInfo = getConnectionInfo(req);
    const report = await driverReportService.createReport(
        req.user.sub,
        req.body,
        connectionInfo
    );

    res.status(201).json({
        success: true,
        message: 'Report submitted successfully. Thank you for your feedback.',
        data: report
    });
});

/**
 * @desc    Get my reports (as passenger)
 * @route   GET /api/reports/my-reports
 * @access  Private
 */
const getMyReports = asyncHandler(async (req, res) => {
    const { status, page, limit } = req.query;
    const result = await driverReportService.getMyReports(req.user.sub, {
        status,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
    });

    res.json({
        success: true,
        data: result.reports,
        pagination: result.pagination
    });
});

/**
 * @desc    Get report types and categories
 * @route   GET /api/reports/types
 * @access  Public
 */
const getReportTypes = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        data: {
            categories: driverReportService.CATEGORY_LABELS,
            types: driverReportService.TYPE_LABELS,
            typesByCategory: driverReportService.REPORT_TYPES_BY_CATEGORY
        }
    });
});

// ==================== Driver Endpoints ====================

/**
 * @desc    Get reports against me (as driver)
 * @route   GET /api/reports/against-me
 * @access  Private (Driver only)
 */
const getReportsAgainstMe = asyncHandler(async (req, res) => {
    const { status, page, limit } = req.query;
    const result = await driverReportService.getReportsAgainstMe(req.user.sub, {
        status,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
    });

    res.json({
        success: true,
        data: result.reports,
        pagination: result.pagination
    });
});

/**
 * @desc    Get my report statistics (as driver)
 * @route   GET /api/reports/my-stats
 * @access  Private (Driver only)
 */
const getMyReportStats = asyncHandler(async (req, res) => {
    const stats = await driverReportService.getMyReportStats(req.user.sub);

    res.json({
        success: true,
        data: stats
    });
});

// ==================== Admin Endpoints ====================

/**
 * @desc    Get all reports (Admin)
 * @route   GET /api/reports/admin/all
 * @access  Private (Admin only)
 */
const getAllReports = asyncHandler(async (req, res) => {
    const { status, category, severity, search, page, limit } = req.query;
    const result = await driverReportService.getAllReports({
        status,
        category,
        severity,
        search,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
    });

    res.json({
        success: true,
        data: result.reports,
        pagination: result.pagination
    });
});

/**
 * @desc    Get report by ID (Admin)
 * @route   GET /api/reports/admin/:id
 * @access  Private (Admin only)
 */
const getReportById = asyncHandler(async (req, res) => {
    const report = await driverReportService.getReportById(req.params.id);

    res.json({
        success: true,
        data: report
    });
});

/**
 * @desc    Start reviewing report (Admin)
 * @route   PATCH /api/reports/:id/review
 * @access  Private (Admin only)
 */
const startReview = asyncHandler(async (req, res) => {
    const report = await driverReportService.startReview(
        req.params.id,
        req.user.sub
    );

    res.json({
        success: true,
        message: 'Report marked as reviewing',
        data: report
    });
});

/**
 * @desc    Resolve report (Admin)
 * @route   PATCH /api/reports/:id/resolve
 * @access  Private (Admin only)
 */
const resolveReport = asyncHandler(async (req, res) => {
    const report = await driverReportService.resolveReport(
        req.params.id,
        req.user.sub,
        req.body
    );

    res.json({
        success: true,
        message: `Report ${req.body.status === 'RESOLVED' ? 'resolved' : 'dismissed'}`,
        data: report
    });
});

/**
 * @desc    Get report statistics (Admin)
 * @route   GET /api/reports/admin/stats
 * @access  Private (Admin only)
 */
const getReportStats = asyncHandler(async (req, res) => {
    const stats = await driverReportService.getReportStats();

    res.json({
        success: true,
        data: stats
    });
});

/**
 * @desc    Get driver's report history (Admin)
 * @route   GET /api/reports/admin/driver/:driverId
 * @access  Private (Admin only)
 */
const getDriverHistory = asyncHandler(async (req, res) => {
    const history = await driverReportService.getDriverReportHistory(req.params.driverId);

    res.json({
        success: true,
        data: history
    });
});

module.exports = {
    createReport,
    getMyReports,
    getReportTypes,
    getReportsAgainstMe,
    getMyReportStats,
    getAllReports,
    getReportById,
    startReview,
    resolveReport,
    getReportStats,
    getDriverHistory
};
