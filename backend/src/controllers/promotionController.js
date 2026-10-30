const { validationResult } = require('express-validator');
const promotionService = require('../services/promotion.service');

/**
 * @desc    Promote a single student
 * @route   POST /api/v1/promotions/student
 * @access  Private (SCHOOLADMIN, TEACHER)
 */
const promoteStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const result = await promotionService.promoteStudent(schoolId, req.body, req.user._id);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Promote Student Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Bulk promote students
 * @route   POST /api/v1/promotions/bulk-students
 * @access  Private (SCHOOLADMIN)
 */
const bulkPromoteStudents = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const result = await promotionService.bulkPromoteStudents(schoolId, req.body, req.user._id);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Bulk Promote Students Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Promote entire class
 * @route   POST /api/v1/promotions/class
 * @access  Private (SCHOOLADMIN)
 */
const promoteClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const result = await promotionService.promoteClass(schoolId, req.body, req.user._id);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Promote Class Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Promote entire school
 * @route   POST /api/v1/promotions/school
 * @access  Private (SCHOOLADMIN)
 */
const promoteSchool = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const result = await promotionService.promoteSchool(schoolId, req.body, req.user._id);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Promote School Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Get promotion history
 * @route   GET /api/v1/promotions/history
 * @access  Private
 */
const getPromotionHistory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const result = await promotionService.getPromotionHistory(schoolId, req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get Promotion History Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get student promotion history
 * @route   GET /api/v1/promotions/student/:studentId/history
 * @access  Private
 */
const getStudentPromotionHistory = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const result = await promotionService.getStudentPromotionHistory(
      req.params.studentId,
      schoolId,
      req.query
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get Student Promotion History Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Get promotion preview
 * @route   GET /api/v1/promotions/preview
 * @access  Private
 */
const getPromotionPreview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const result = await promotionService.getPromotionPreview(schoolId, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get Promotion Preview Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Get promotion report
 * @route   GET /api/v1/promotions/report
 * @access  Private
 */
const getPromotionReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const result = await promotionService.getPromotionReport(schoolId, req.query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get Promotion Report Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Rollback single promotion
 * @route   POST /api/v1/promotions/:id/rollback
 * @access  Private (SCHOOLADMIN)
 */
const rollbackPromotion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const result = await promotionService.rollbackPromotion(
      req.params.id,
      schoolId,
      req.user._id,
      req.body.reason
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Rollback Promotion Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

/**
 * @desc    Rollback batch promotion
 * @route   POST /api/v1/promotions/batch/rollback
 * @access  Private (SCHOOLADMIN)
 */
const rollbackBatchPromotion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const schoolId = req.user.schoolId;
    const result = await promotionService.rollbackBatchPromotion(
      req.body.batchPromotionId,
      schoolId,
      req.user._id,
      req.body.reason
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Rollback Batch Promotion Error:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

module.exports = {
  promoteStudent,
  bulkPromoteStudents,
  promoteClass,
  promoteSchool,
  getPromotionHistory,
  getStudentPromotionHistory,
  getPromotionPreview,
  getPromotionReport,
  rollbackPromotion,
  rollbackBatchPromotion,
};
