const express = require('express');
const schoolController = require('../controllers/school.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole, requireSchoolAccess } = require('../middlewares/role.middleware');
const validateRequest = require('../middlewares/validation.middleware');
const {
  createSchoolValidator,
  updateSchoolValidator,
  schoolIdValidator,
  updateStatusValidator,
  assignAdminValidator,
  searchValidator,
} = require('../validators/school.validator');
const { uploadLogo } = require('../services/school.service');
const { ROLES } = require('../models/User');

const router = express.Router();

// All school routes require authentication
router.use(requireAuth);

// ─── Utility Routes ─────────────────────────────────────────
// GET filter options (for dropdowns)
router.get(
  '/filter-options',
  requireRole(ROLES.SUPERADMIN, ROLES.SCHOOLADMIN),
  schoolController.getFilterOptions
);

// GET school statistics (dashboard)
router.get(
  '/statistics',
  requireRole(ROLES.SUPERADMIN),
  schoolController.getStatistics
);

// ─── SUPERADMIN Only Routes ─────────────────────────────────
// POST create school
router.post(
  '/',
  requireRole(ROLES.SUPERADMIN),
  uploadLogo.single('logo'),
  createSchoolValidator,
  validateRequest,
  schoolController.createSchool
);

// DELETE school (soft delete)
router.delete(
  '/:id',
  requireRole(ROLES.SUPERADMIN),
  schoolIdValidator,
  validateRequest,
  schoolController.deleteSchool
);

// PATCH update school status
router.patch(
  '/:id/status',
  requireRole(ROLES.SUPERADMIN),
  updateStatusValidator,
  validateRequest,
  schoolController.updateStatus
);

// PATCH assign admin to school
router.patch(
  '/:id/assign-admin',
  requireRole(ROLES.SUPERADMIN),
  assignAdminValidator,
  validateRequest,
  schoolController.assignAdmin
);

// PATCH remove admin from school
router.patch(
  '/:id/remove-admin',
  requireRole(ROLES.SUPERADMIN),
  assignAdminValidator,
  validateRequest,
  schoolController.removeAdmin
);

// ─── Mixed Access Routes (Superadmin + Schooladmin) ─────────

// GET all schools (paginated, filtered, searched)
router.get(
  '/',
  requireRole(ROLES.SUPERADMIN, ROLES.SCHOOLADMIN),
  searchValidator,
  validateRequest,
  schoolController.getSchools
);

// GET single school by ID
router.get(
  '/:id',
  requireRole(ROLES.SUPERADMIN, ROLES.SCHOOLADMIN),
  schoolIdValidator,
  validateRequest,
  schoolController.getSchoolById
);

// PUT update school
router.put(
  '/:id',
  requireRole(ROLES.SUPERADMIN, ROLES.SCHOOLADMIN),
  uploadLogo.single('logo'),
  updateSchoolValidator,
  validateRequest,
  schoolController.updateSchool
);

// ─── Logo Routes ────────────────────────────────────────────

// POST upload logo
router.post(
  '/:id/logo',
  requireRole(ROLES.SUPERADMIN, ROLES.SCHOOLADMIN),
  schoolIdValidator,
  validateRequest,
  uploadLogo.single('logo'),
  schoolController.uploadLogo
);

// DELETE logo
router.delete(
  '/:id/logo',
  requireRole(ROLES.SUPERADMIN, ROLES.SCHOOLADMIN),
  schoolIdValidator,
  validateRequest,
  schoolController.deleteLogo
);

module.exports = router;
