const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole, requireSchoolAccess } = require('../middlewares/role.middleware');
const { validateCreateSection, validateUpdateSection } = require('../validators/sectionValidator');

router.use(requireAuth);
router.use(requireSchoolAccess);

const adminRoles = ['SUPERADMIN', 'SCHOOLADMIN'];

router.route('/')
  .post(requireRole(...adminRoles), validateCreateSection, sectionController.createSection)
  .get(requireRole(...adminRoles, 'TEACHER'), sectionController.getSections);

router.route('/:id')
  .get(requireRole(...adminRoles, 'TEACHER'), sectionController.getSectionById)
  .put(requireRole(...adminRoles), validateUpdateSection, sectionController.updateSection)
  .delete(requireRole(...adminRoles), sectionController.deleteSection);

module.exports = router;
