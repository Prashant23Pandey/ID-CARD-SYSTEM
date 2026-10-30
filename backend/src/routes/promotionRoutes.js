const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole, requireSchoolAccess } = require('../middlewares/role.middleware');
const {
  validatePromoteStudent,
  validateBulkPromoteStudents,
  validateBulkPromoteClass,
  validateBulkPromoteSchool,
  validateGetPromotionHistory,
  validateGetPromotionReport,
  validateRollbackPromotion,
  validateRollbackBatchPromotion,
  validateGetPromotionPreview,
} = require('../validators/promotion.validator');

// All promotion routes require authentication and school isolation
router.use(requireAuth);
router.use(requireSchoolAccess);

const adminRoles = ['SUPERADMIN', 'SCHOOLADMIN'];
const viewRoles = ['SUPERADMIN', 'SCHOOLADMIN', 'TEACHER'];

/**
 * Student Promotion Routes
 */

// Promote single student
router.post(
  '/student',
  requireRole(...adminRoles),
  validatePromoteStudent,
  promotionController.promoteStudent
);

// Bulk promote students
router.post(
  '/bulk-students',
  requireRole(...adminRoles),
  validateBulkPromoteStudents,
  promotionController.bulkPromoteStudents
);

/**
 * Class/School Promotion Routes
 */

// Promote entire class
router.post(
  '/class',
  requireRole(...adminRoles),
  validateBulkPromoteClass,
  promotionController.promoteClass
);

// Promote entire school
router.post(
  '/school',
  requireRole(...adminRoles),
  validateBulkPromoteSchool,
  promotionController.promoteSchool
);

/**
 * Promotion Preview Routes
 */

// Get promotion preview
router.get(
  '/preview',
  requireRole(...viewRoles),
  validateGetPromotionPreview,
  promotionController.getPromotionPreview
);

/**
 * Promotion History Routes
 */

// Get promotion history (with filters)
router.get(
  '/history',
  requireRole(...viewRoles),
  validateGetPromotionHistory,
  promotionController.getPromotionHistory
);

// Get student promotion history
router.get(
  '/student/:studentId/history',
  requireRole(...viewRoles),
  promotionController.getStudentPromotionHistory
);

/**
 * Promotion Report Routes
 */

// Get promotion report
router.get(
  '/report',
  requireRole(...viewRoles),
  validateGetPromotionReport,
  promotionController.getPromotionReport
);

/**
 * Promotion Rollback Routes
 */

// Rollback single promotion
router.post(
  '/:id/rollback',
  requireRole(...adminRoles),
  validateRollbackPromotion,
  promotionController.rollbackPromotion
);

// Rollback batch promotion
router.post(
  '/batch/rollback',
  requireRole(...adminRoles),
  validateRollbackBatchPromotion,
  promotionController.rollbackBatchPromotion
);

module.exports = router;
