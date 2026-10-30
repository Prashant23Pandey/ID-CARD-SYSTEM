const dashboardService = require('../services/dashboardService');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'sessionId query parameter is required' });
    }
    const stats = await dashboardService.getDashboardStatistics(req.user.schoolId, sessionId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
