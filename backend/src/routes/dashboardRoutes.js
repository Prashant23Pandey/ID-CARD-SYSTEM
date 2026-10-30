const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole, requireSchoolAccess } = require('../middlewares/role.middleware');

router.use(requireAuth);
router.use(requireSchoolAccess);

const allowedRoles = ['SUPERADMIN', 'SCHOOLADMIN', 'TEACHER'];

router.get('/stats', requireRole(...allowedRoles), dashboardController.getDashboardStats);

module.exports = router;
