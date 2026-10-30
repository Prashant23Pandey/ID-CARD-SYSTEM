const classService = require('../services/classService');

exports.createClass = async (req, res, next) => {
  try {
    const newClass = await classService.createClass(req.user.schoolId, req.body, req.user._id);
    res.status(201).json({ success: true, data: newClass });
  } catch (error) {
    next(error);
  }
};

exports.getClasses = async (req, res, next) => {
  try {
    const { sessionId, ...filters } = req.query;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId query parameter is required' });
    }
    const classes = await classService.getClasses(req.user.schoolId, sessionId, filters);
    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    next(error);
  }
};

exports.getClassById = async (req, res, next) => {
  try {
    const classData = await classService.getClassById(req.params.id, req.user.schoolId);
    res.status(200).json({ success: true, data: classData });
  } catch (error) {
    next(error);
  }
};

exports.updateClass = async (req, res, next) => {
  try {
    const classData = await classService.updateClass(req.params.id, req.user.schoolId, req.body, req.user._id);
    res.status(200).json({ success: true, data: classData });
  } catch (error) {
    next(error);
  }
};

exports.deleteClass = async (req, res, next) => {
  try {
    const classData = await classService.deleteClass(req.params.id, req.user.schoolId, req.user._id);
    res.status(200).json({ success: true, data: classData, message: 'Class deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.assignTeacher = async (req, res, next) => {
  try {
    const { teacherId } = req.body;
    const classData = await classService.assignTeacher(req.params.id, req.user.schoolId, teacherId, req.user._id);
    res.status(200).json({ success: true, data: classData, message: 'Teacher assigned successfully' });
  } catch (error) {
    next(error);
  }
};

exports.removeTeacher = async (req, res, next) => {
  try {
    const classData = await classService.removeTeacher(req.params.id, req.user.schoolId, req.user._id);
    res.status(200).json({ success: true, data: classData, message: 'Teacher removed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getClassStudents = async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId query parameter is required' });
    }
    const students = await classService.getClassStudents(req.params.id, req.user.schoolId, sessionId);
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};

exports.getClassStatistics = async (req, res, next) => {
  try {
    const stats = await classService.getClassStatistics(req.params.id, req.user.schoolId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
