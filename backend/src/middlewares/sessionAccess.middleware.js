const Session = require('../models/Session');

/**
 * Middleware to check if user has access to a session
 * Ensures school isolation
 */
const sessionAccessMiddleware = async (req, res, next) => {
  try {
    const sessionId = req.params.id || req.params.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required',
      });
    }

    const session = await Session.findOne({
      _id: sessionId,
      schoolId: req.user.schoolId,
      deletedAt: null,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or you do not have access',
      });
    }

    // Attach session to request for use in controller
    req.session = session;
    next();
  } catch (error) {
    console.error('Session Access Middleware Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * Middleware to check if session is not archived
 * Used for update/delete operations
 */
const sessionNotArchivedMiddleware = (req, res, next) => {
  if (req.session && req.session.isArchived) {
    return res.status(403).json({
      success: false,
      message: 'Cannot perform this action on an archived session',
    });
  }
  next();
};

/**
 * Middleware to check if session is active
 * Used for activation operations
 */
const sessionNotActiveMiddleware = (req, res, next) => {
  if (req.session && req.session.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Session is already active',
    });
  }
  next();
};

/**
 * Middleware to check if there's only one active session per school
 */
const enforceOneActiveSessionMiddleware = async (req, res, next) => {
  try {
    const schoolId = req.user.schoolId;

    const activeSession = await Session.findOne({
      schoolId,
      isActive: true,
      deletedAt: null,
      _id: { $ne: req.params?.id },
    });

    if (activeSession) {
      return res.status(409).json({
        success: false,
        message: `There is already an active session: ${activeSession.sessionName}`,
        activeSessionId: activeSession._id,
      });
    }

    next();
  } catch (error) {
    console.error('Enforce One Active Session Middleware Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * Middleware to check if promotion is completed before archiving
 */
const promotionCompletedMiddleware = (req, res, next) => {
  if (req.session && !req.session.promotionCompleted) {
    return res.status(409).json({
      success: false,
      message: 'Cannot archive session until promotion is completed',
    });
  }
  next();
};

module.exports = {
  sessionAccessMiddleware,
  sessionNotArchivedMiddleware,
  sessionNotActiveMiddleware,
  enforceOneActiveSessionMiddleware,
  promotionCompletedMiddleware,
};