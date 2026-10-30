const { validationResult } = require('express-validator');
const sessionService = require('../services/session.service');

/**
 * @desc    Create a new session
 * @route   POST /api/v1/sessions
 * @access  Private (SCHOOLADMIN)
 */
const createSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const session = await sessionService.createSession(schoolId, req.body, req.user._id);

    res.status(201).json({
      success: true,
      data: session,
      message: 'Session created successfully',
    });
  } catch (error) {
    console.error('Create Session Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Get all sessions
 * @route   GET /api/v1/sessions
 * @access  Private
 */
const getSessions = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const result = await sessionService.getSessions(schoolId, req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get Sessions Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get session by ID
 * @route   GET /api/v1/sessions/:id
 * @access  Private
 */
const getSessionById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const session = await sessionService.getSessionById(req.params.id, schoolId);

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Get Session Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Update session
 * @route   PUT /api/v1/sessions/:id
 * @access  Private (SCHOOLADMIN)
 */
const updateSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const session = await sessionService.updateSession(
      req.params.id,
      schoolId,
      req.body,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: session,
      message: 'Session updated successfully',
    });
  } catch (error) {
    console.error('Update Session Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Delete session (soft delete)
 * @route   DELETE /api/v1/sessions/:id
 * @access  Private (SCHOOLADMIN)
 */
const deleteSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    await sessionService.deleteSession(req.params.id, schoolId, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('Delete Session Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Activate session
 * @route   PATCH /api/v1/sessions/:id/activate
 * @access  Private (SCHOOLADMIN)
 */
const activateSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const session = await sessionService.activateSession(req.params.id, schoolId, req.user._id);

    res.status(200).json({
      success: true,
      data: session,
      message: 'Session activated successfully',
    });
  } catch (error) {
    console.error('Activate Session Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Deactivate session
 * @route   PATCH /api/v1/sessions/:id/deactivate
 * @access  Private (SCHOOLADMIN)
 */
const deactivateSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const session = await sessionService.deactivateSession(req.params.id, schoolId, req.user._id);

    res.status(200).json({
      success: true,
      data: session,
      message: 'Session deactivated successfully',
    });
  } catch (error) {
    console.error('Deactivate Session Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Archive session
 * @route   PATCH /api/v1/sessions/:id/archive
 * @access  Private (SCHOOLADMIN)
 */
const archiveSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const session = await sessionService.archiveSession(req.params.id, schoolId, req.user._id);

    res.status(200).json({
      success: true,
      data: session,
      message: 'Session archived successfully',
    });
  } catch (error) {
    console.error('Archive Session Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Get session statistics
 * @route   GET /api/v1/sessions/:id/statistics
 * @access  Private
 */
const getSessionStatistics = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const statistics = await sessionService.getSessionStatistics(req.params.id, schoolId);

    res.status(200).json({
      success: true,
      data: statistics,
    });
  } catch (error) {
    console.error('Get Session Statistics Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Get session dashboard
 * @route   GET /api/v1/sessions/dashboard
 * @access  Private
 */
const getSessionDashboard = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const dashboard = await sessionService.getSessionDashboard(schoolId);

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error('Get Session Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Mark promotion as completed
 * @route   PATCH /api/v1/sessions/:id/mark-promotion-completed
 * @access  Private (SCHOOLADMIN)
 */
const markPromotionCompleted = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const session = await sessionService.markPromotionCompleted(
      req.params.id,
      schoolId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: session,
      message: 'Promotion marked as completed',
    });
  } catch (error) {
    console.error('Mark Promotion Completed Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Reset promotion status
 * @route   PATCH /api/v1/sessions/:id/reset-promotion
 * @access  Private (SCHOOLADMIN)
 */
const resetPromotionStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const session = await sessionService.resetPromotionStatus(
      req.params.id,
      schoolId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      data: session,
      message: 'Promotion status reset successfully',
    });
  } catch (error) {
    console.error('Reset Promotion Status Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
  activateSession,
  deactivateSession,
  archiveSession,
  getSessionStatistics,
  getSessionDashboard,
  markPromotionCompleted,
  resetPromotionStatus,
};
