const asyncHandler = require('express-async-handler');
const emergencyService = require('../services/emergency.service');
const { getConnectionInfo } = require('../services/activityLog.service');

// ==================== Driver Endpoints ====================

/**
 * @desc    Create emergency request (SOS)
 * @route   POST /api/emergency
 * @access  Private (Driver only)
 */
const createEmergency = asyncHandler(async (req, res) => {
    const connectionInfo = getConnectionInfo(req);
    const emergency = await emergencyService.createEmergencyRequest(
        req.user.sub,
        req.body,
        connectionInfo
    );

    res.status(201).json({
        success: true,
        message: 'Emergency request created. Help is on the way.',
        data: emergency
    });
});

/**
 * @desc    Get driver's emergency history
 * @route   GET /api/emergency/my-emergencies
 * @access  Private (Driver only)
 */
const getMyEmergencies = asyncHandler(async (req, res) => {
    const { status, page, limit } = req.query;
    const result = await emergencyService.getDriverEmergencies(req.user.sub, {
        status,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
    });

    res.json({
        success: true,
        data: result.requests,
        pagination: result.pagination
    });
});

/**
 * @desc    Get emergency by ID
 * @route   GET /api/emergency/:id
 * @access  Private
 */
const getEmergencyById = asyncHandler(async (req, res) => {
    const isAdmin = req.user.role === 'ADMIN';
    const emergency = await emergencyService.getEmergencyById(
        req.params.id,
        req.user.sub,
        isAdmin
    );

    res.json({
        success: true,
        data: emergency
    });
});

/**
 * @desc    Cancel emergency request
 * @route   PATCH /api/emergency/:id/cancel
 * @access  Private (Driver only)
 */
const cancelEmergency = asyncHandler(async (req, res) => {
    const connectionInfo = getConnectionInfo(req);
    const emergency = await emergencyService.cancelEmergency(
        req.params.id,
        req.user.sub,
        req.body.reason,
        connectionInfo
    );

    res.json({
        success: true,
        message: 'Emergency request cancelled',
        data: emergency
    });
});

// ==================== Admin Endpoints ====================

/**
 * @desc    Get all emergencies (Admin)
 * @route   GET /api/emergency/admin/all
 * @access  Private (Admin only)
 */
const getAllEmergencies = asyncHandler(async (req, res) => {
    const { status, type, search, page, limit } = req.query;
    const result = await emergencyService.getAllEmergencies({
        status,
        type,
        search,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
    });

    res.json({
        success: true,
        data: result.requests,
        pagination: result.pagination
    });
});

/**
 * @desc    Respond to emergency (Admin)
 * @route   PATCH /api/emergency/:id/respond
 * @access  Private (Admin only)
 */
const respondToEmergency = asyncHandler(async (req, res) => {
    const emergency = await emergencyService.respondToEmergency(
        req.params.id,
        req.user.sub,
        req.body.adminNotes
    );

    res.json({
        success: true,
        message: 'Emergency acknowledged',
        data: emergency
    });
});

/**
 * @desc    Resolve emergency (Admin)
 * @route   PATCH /api/emergency/:id/resolve
 * @access  Private (Admin only)
 */
const resolveEmergency = asyncHandler(async (req, res) => {
    const emergency = await emergencyService.resolveEmergency(
        req.params.id,
        req.user.sub,
        req.body.adminNotes
    );

    res.json({
        success: true,
        message: 'Emergency resolved',
        data: emergency
    });
});

/**
 * @desc    Get emergency statistics (Admin)
 * @route   GET /api/emergency/admin/stats
 * @access  Private (Admin only)
 */
const getEmergencyStats = asyncHandler(async (req, res) => {
    const stats = await emergencyService.getEmergencyStats();

    res.json({
        success: true,
        data: stats
    });
});

// ==================== Emergency Contacts ====================

/**
 * @desc    Get user's emergency contacts
 * @route   GET /api/emergency/contacts
 * @access  Private
 */
const getContacts = asyncHandler(async (req, res) => {
    const contacts = await emergencyService.getEmergencyContacts(req.user.sub);

    res.json({
        success: true,
        data: contacts
    });
});

/**
 * @desc    Save emergency contact (create/update)
 * @route   POST /api/emergency/contacts
 * @access  Private
 */
const saveContact = asyncHandler(async (req, res) => {
    const contact = await emergencyService.saveEmergencyContact(req.user.sub, req.body);

    res.status(201).json({
        success: true,
        message: 'Emergency contact saved',
        data: contact
    });
});

/**
 * @desc    Delete emergency contact
 * @route   DELETE /api/emergency/contacts/:id
 * @access  Private
 */
const deleteContact = asyncHandler(async (req, res) => {
    await emergencyService.deleteEmergencyContact(req.params.id, req.user.sub);

    res.json({
        success: true,
        message: 'Emergency contact deleted'
    });
});

module.exports = {
    createEmergency,
    getMyEmergencies,
    getEmergencyById,
    cancelEmergency,
    getAllEmergencies,
    respondToEmergency,
    resolveEmergency,
    getEmergencyStats,
    getContacts,
    saveContact,
    deleteContact
};
