const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole, requireSchoolAccess } = require('../middlewares/role.middleware');
const {
  sessionAccessMiddleware,
  sessionNotArchivedMiddleware,
  enforceOneActiveSessionMiddleware,
  promotionCompletedMiddleware,
} = require('../middlewares/sessionAccess.middleware');
const {
  validateCreateSession,
  validateUpdateSession,
  validateActivateSession,
  validateArchiveSession,
  validateDeleteSession,
  validateGetSessions,
  validateGetSessionById,
  validateNoOverlapSessions,
  validateUniqueSessionCode,
  validateNotArchivedSession,
  validateNotActiveSession,
} = require('../validators/session.validator');

// All session routes require authentication and school isolation
router.use(requireAuth);
router.use(requireSchoolAccess);

// Define allowed roles for session management
const sessionAdminRoles = ['SUPERADMIN', 'SCHOOLADMIN'];
const sessionViewRoles = ['SUPERADMIN', 'SCHOOLADMIN', 'TEACHER'];

/**
 * Session CRUD Routes
 */

// Create session
router.post(
  '/',
  requireRole(...sessionAdminRoles),
  validateCreateSession,
  validateNoOverlapSessions,
  validateUniqueSessionCode,
  sessionController.createSession
);

// Get all sessions
router.get(
  '/',
  requireRole(...sessionViewRoles),
  validateGetSessions,
  sessionController.getSessions
);

// Get session dashboard
router.get(
  '/dashboard/overview',
  requireRole(...sessionViewRoles),
  sessionController.getSessionDashboard
);

// Get session by ID
router.get(
  '/:id',
  requireRole(...sessionViewRoles),
  validateGetSessionById,
  sessionAccessMiddleware,
  sessionController.getSessionById
);

// Get session statistics
router.get(
  '/:id/statistics',
  requireRole(...sessionViewRoles),
  validateGetSessionById,
  sessionAccessMiddleware,
  sessionController.getSessionStatistics
);

// Update session
router.put(
  '/:id',
  requireRole(...sessionAdminRoles),
  validateUpdateSession,
  validateNotArchivedSession,
  validateNoOverlapSessions,
  sessionAccessMiddleware,
  sessionNotArchivedMiddleware,
  sessionController.updateSession
);

// Delete session (soft delete)
router.delete(
  '/:id',
  requireRole(...sessionAdminRoles),
  validateDeleteSession,
  validateNotActiveSession,
  sessionAccessMiddleware,
  sessionController.deleteSession
);

/**
 * Session Activation/Deactivation Routes
 */

// Activate session
router.patch(
  '/:id/activate',
  requireRole(...sessionAdminRoles),
  validateActivateSession,
  sessionAccessMiddleware,
  enforceOneActiveSessionMiddleware,
  sessionController.activateSession
);

// Deactivate session
router.patch(
  '/:id/deactivate',
  requireRole(...sessionAdminRoles),
  validateActivateSession,
  sessionAccessMiddleware,
  sessionController.deactivateSession
);

/**
 * Session Archive Routes
 */

// Archive session
router.patch(
  '/:id/archive',
  requireRole(...sessionAdminRoles),
  validateArchiveSession,
  sessionAccessMiddleware,
  promotionCompletedMiddleware,
  sessionController.archiveSession
);

/**
 * Promotion Status Routes
 */

// Mark promotion as completed
router.patch(
  '/:id/mark-promotion-completed',
  requireRole(...sessionAdminRoles),
  validateActivateSession,
  sessionAccessMiddleware,
  sessionNotArchivedMiddleware,
  sessionController.markPromotionCompleted
);

// Reset promotion status
router.patch(
  '/:id/reset-promotion',
  requireRole(...sessionAdminRoles),
  validateActivateSession,
  sessionAccessMiddleware,
  sessionNotArchivedMiddleware,
  sessionController.resetPromotionStatus
);

module.exports = router;
