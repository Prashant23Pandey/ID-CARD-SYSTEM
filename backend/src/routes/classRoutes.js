const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole, requireSchoolAccess } = require('../middlewares/role.middleware');
const { validateCreateClass, validateUpdateClass, validateAssignTeacher } = require('../validators/classValidator');

router.use(requireAuth);
router.use(requireSchoolAccess);

const adminRoles = ['SUPERADMIN', 'SCHOOLADMIN'];

router.route('/')
  .post(requireRole(...adminRoles), validateCreateClass, classController.createClass)
  .get(requireRole(...adminRoles, 'TEACHER'), classController.getClasses);

router.route('/:id')
  .get(requireRole(...adminRoles, 'TEACHER'), classController.getClassById)
  .put(requireRole(...adminRoles), validateUpdateClass, classController.updateClass)
  .delete(requireRole(...adminRoles), classController.deleteClass);

router.patch('/:id/assign-teacher', requireRole(...adminRoles), validateAssignTeacher, classController.assignTeacher);
router.patch('/:id/remove-teacher', requireRole(...adminRoles), classController.removeTeacher);

router.get('/:id/students', requireRole(...adminRoles, 'TEACHER'), classController.getClassStudents);
router.get('/:id/statistics', requireRole(...adminRoles, 'TEACHER'), classController.getClassStatistics);

module.exports = router;
