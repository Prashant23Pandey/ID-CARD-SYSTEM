const { validationResult } = require('express-validator');
const { Teacher } = require('../models/Teacher');
const teacherService = require('../services/teacher.service');
const { formatTeacherResponse, sanitizeTeacherInput } = require('../utils/teacher.utils');

const createTeacher = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const sanitizedData = sanitizeTeacherInput(req.body);
    const teacher = await teacherService.createTeacher(req.user.schoolId, sanitizedData, req.user._id);

    res.status(201).json({ success: true, data: formatTeacherResponse(teacher) });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server Error' });
  }
};

const getTeachers = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const result = await teacherService.getTeachers(req.user.schoolId, req.query);
    res.status(200).json({
      success: true,
      ...result,
      data: result.data.map(formatTeacherResponse),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ _id: req.params.id, schoolId: req.user.schoolId })
      .populate('classId', 'className sectionName');
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.status(200).json({ success: true, data: formatTeacherResponse(teacher) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const sanitizedData = sanitizeTeacherInput(req.body);
    sanitizedData.updatedBy = req.user._id;

    // Check unique employee/teacher code
    if (sanitizedData.employeeId || sanitizedData.teacherCode || sanitizedData.email) {
      const orQuery = [];
      if (sanitizedData.employeeId) orQuery.push({ employeeId: sanitizedData.employeeId });
      if (sanitizedData.teacherCode) orQuery.push({ teacherCode: sanitizedData.teacherCode });
      if (sanitizedData.email) orQuery.push({ email: sanitizedData.email });

      const existing = await Teacher.findOne({
        schoolId: req.user.schoolId,
        _id: { $ne: req.params.id },
        $or: orQuery
      }).setOptions({ includeDeleted: true });

      if (existing) return res.status(400).json({ success: false, message: 'Unique field constraint violated' });
    }

    const teacher = await Teacher.findOneAndUpdate(
      { _id: req.params.id, schoolId: req.user.schoolId },
      sanitizedData,
      { new: true, runValidators: true }
    ).populate('classId');

    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.status(200).json({ success: true, data: formatTeacherResponse(teacher) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ _id: req.params.id, schoolId: req.user.schoolId });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    await teacher.softDelete(req.user._id);
    res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No photo provided' });

    const teacher = await Teacher.findOne({ _id: req.params.id, schoolId: req.user.schoolId });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const photoUrl = await teacherService.processAndSaveImage(req.file, teacher._id, 'photo');
    teacher.photoUrl = photoUrl;
    teacher.updatedBy = req.user._id;
    await teacher.save();

    res.status(200).json({ success: true, message: 'Photo uploaded', data: { photoUrl } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const uploadSignature = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No signature provided' });

    const teacher = await Teacher.findOne({ _id: req.params.id, schoolId: req.user.schoolId });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const signatureUrl = await teacherService.processAndSaveImage(req.file, teacher._id, 'signature');
    teacher.signatureUrl = signatureUrl;
    teacher.updatedBy = req.user._id;
    await teacher.save();

    res.status(200).json({ success: true, message: 'Signature uploaded', data: { signatureUrl } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const assignClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { classId } = req.body;
    const teacher = await teacherService.assignClass(req.user.schoolId, req.params.id, classId, req.user._id);
    res.status(200).json({ success: true, data: formatTeacherResponse(teacher) });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server Error' });
  }
};

const removeClass = async (req, res) => {
  try {
    const teacher = await teacherService.removeClass(req.user.schoolId, req.params.id, req.user._id);
    res.status(200).json({ success: true, data: formatTeacherResponse(teacher) });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server Error' });
  }
};

const importTeachers = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No Excel file provided' });
    const result = await teacherService.processBulkImport(req.user.schoolId, req.file.buffer, req.user._id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server Error' });
  }
};

const exportTeachers = async (req, res) => {
  try {
    const buffer = await teacherService.exportExcel(req.user.schoolId, req.query);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="teachers_export.xlsx"',
      'Content-Length': buffer.length
    });
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    await teacherService.resetPassword(req.user.schoolId, req.params.id, req.body.newPassword);
    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server Error' });
  }
};

module.exports = {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  uploadPhoto,
  uploadSignature,
  assignClass,
  removeClass,
  importTeachers,
  exportTeachers,
  resetPassword,
};
