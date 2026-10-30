const sectionService = require('../services/sectionService');

exports.createSection = async (req, res, next) => {
  try {
    const section = await sectionService.createSection(req.user.schoolId, req.body, req.user._id);
    res.status(201).json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};

exports.getSections = async (req, res, next) => {
  try {
    const { sessionId, classId } = req.query;
    if (!sessionId || !classId) {
      return res.status(400).json({ success: false, message: 'sessionId and classId query parameters are required' });
    }
    const sections = await sectionService.getSections(req.user.schoolId, sessionId, classId);
    res.status(200).json({ success: true, data: sections });
  } catch (error) {
    next(error);
  }
};

exports.getSectionById = async (req, res, next) => {
  try {
    const section = await sectionService.getSectionById(req.params.id, req.user.schoolId);
    res.status(200).json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};

exports.updateSection = async (req, res, next) => {
  try {
    const section = await sectionService.updateSection(req.params.id, req.user.schoolId, req.body, req.user._id);
    res.status(200).json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};

exports.deleteSection = async (req, res, next) => {
  try {
    const section = await sectionService.deleteSection(req.params.id, req.user.schoolId, req.user._id);
    res.status(200).json({ success: true, data: section, message: 'Section deleted successfully' });
  } catch (error) {
    next(error);
  }
};
