const express = require('express');
const userController = require('../controllers/user.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole, requireSchoolAccess } = require('../middlewares/role.middleware');
const validateRequest = require('../middlewares/validation.middleware');
const { userIdValidator, updateUserValidator, updateStatusValidator } = require('../validators/user.validator');
const { ROLES } = require('../models/User');

const router = express.Router();

// All user routes require authentication
router.use(requireAuth);

// Get all users (Schooladmin/Teacher see only their school, Superadmin sees all)
router.get('/', userController.getUsers);

// Get specific user by ID
router.get('/:id', userIdValidator, validateRequest, requireSchoolAccess, userController.getUserById);

// Update user details
router.put('/:id', updateUserValidator, validateRequest, requireSchoolAccess, userController.updateUser);

// Update user status (Requires SUPERADMIN or SCHOOLADMIN)
router.patch('/status', requireRole(ROLES.SUPERADMIN, ROLES.SCHOOLADMIN), updateStatusValidator, validateRequest, userController.updateStatus);

// Delete user (Requires SUPERADMIN)
router.delete('/:id', requireRole(ROLES.SUPERADMIN), userIdValidator, validateRequest, userController.deleteUser);

module.exports = router;
