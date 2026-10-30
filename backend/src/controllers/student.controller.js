const { validationResult } = require('express-validator');
const { Student } = require('../models/Student');
const studentService = require('../services/student.service');
const { formatStudentResponse, sanitizeStudentInput } = require('../utils/student.utils');
const fs = require('fs').promises;

/**
 * @desc    Create a new student
 * @route   POST /api/v1/students
 * @access  Private (SchoolAdmin)
 */
const createStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { schoolId } = req.user;
    const sanitizedData = sanitizeStudentInput(req.body);

    const student = await studentService.createStudent(schoolId, sanitizedData, req.user._id);

    res.status(201).json({
      success: true,
      data: formatStudentResponse(student),
    });
  } catch (error) {
    console.error('Create Student Error:', error);
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'Server Error' 
    });
  }
};

/**
 * @desc    Get all students (with pagination, filter, search)
 * @route   GET /api/v1/students
 * @access  Private (SchoolAdmin, Teacher)
 */
const getStudents = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Teachers might have restrictions on which classes they see.
    // For now, assuming standard schoolId isolation. 
    // In a real app, teacher role might inject `req.query.classId = teacher.assignedClass` here.
    const schoolId = req.user.schoolId;

    const result = await studentService.getStudents(schoolId, req.query);

    res.status(200).json({
      success: true,
      ...result,
      data: result.data.map(formatStudentResponse),
    });
  } catch (error) {
    console.error('Get Students Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get single student by ID
 * @route   GET /api/v1/students/:id
 * @access  Private
 */
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findOne({ 
      _id: req.params.id,
      schoolId: req.user.schoolId 
    })
    .populate('classId', 'className')
    .populate('sectionId', 'sectionName')
    .populate('sessionId', 'sessionName');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      data: formatStudentResponse(student),
    });
  } catch (error) {
    console.error('Get Student Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Update student
 * @route   PUT /api/v1/students/:id
 * @access  Private (SchoolAdmin)
 */
const updateStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const sanitizedData = sanitizeStudentInput(req.body);
    sanitizedData.updatedBy = req.user._id;

    // Check admission number uniqueness if changing
    if (sanitizedData.admissionNumber) {
      const existing = await Student.findOne({
        schoolId: req.user.schoolId,
        admissionNumber: sanitizedData.admissionNumber,
        _id: { $ne: req.params.id }
      }).setOptions({ includeDeleted: true });

      if (existing) {
        return res.status(400).json({ success: false, message: 'Admission Number already in use' });
      }
    }

    const student = await Student.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user.schoolId },
      sanitizedData,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      data: formatStudentResponse(student),
    });
  } catch (error) {
    console.error('Update Student Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Delete student (Soft Delete)
 * @route   DELETE /api/v1/students/:id
 * @access  Private (SchoolAdmin)
 */
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id, schoolId: req.user.schoolId });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await student.softDelete(req.user._id);

    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete Student Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Upload student photo
 * @route   POST /api/v1/students/:id/photo
 * @access  Private (SchoolAdmin)
 */
const uploadStudentPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo provided' });
    }

    const student = await Student.findOne({ _id: req.params.id, schoolId: req.user.schoolId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const photoUrl = await studentService.processAndSavePhoto(req.file, student._id);
    student.photoUrl = photoUrl;
    student.updatedBy = req.user._id;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully',
      data: { photoUrl }
    });
  } catch (error) {
    console.error('Upload Photo Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Bulk import students via Excel
 * @route   POST /api/v1/students/import
 * @access  Private (SchoolAdmin)
 */
const importStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No Excel file provided' });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Target Session ID is required' });
    }

    const result = await studentService.processBulkImport(
      req.user.schoolId,
      sessionId,
      req.file.buffer,
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: 'Bulk import processed',
      data: result
    });
  } catch (error) {
    console.error('Import Students Error:', error);
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'Server Error' 
    });
  }
};

/**
 * @desc    Export students to Excel
 * @route   GET /api/v1/students/export
 * @access  Private (SchoolAdmin)
 */
const exportStudents = async (req, res) => {
  try {
    const buffer = await studentService.exportStudentsExcel(req.user.schoolId, req.query);
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="students_export.xlsx"',
      'Content-Length': buffer.length
    });
    
    res.send(buffer);
  } catch (error) {
    console.error('Export Students Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Promote students
 * @route   POST /api/v1/students/promote
 * @access  Private (SchoolAdmin)
 */
const promoteStudents = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const result = await studentService.promoteStudents(req.user.schoolId, req.body, req.user._id);

    res.status(200).json({
      success: true,
      message: `Successfully promoted ${result.modifiedCount} students`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Promote Students Error:', error);
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'Server Error' 
    });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  uploadStudentPhoto,
  importStudents,
  exportStudents,
  promoteStudents
};
