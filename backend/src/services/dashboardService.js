const ClassModel = require('../models/Class');
const Section = require('../models/Section');
const StudentClassMapping = require('../models/StudentClassMapping');
const Session = require('../models/Session');
const PromotionHistory = require('../models/PromotionHistory');

class DashboardService {
  async getDashboardStatistics(schoolId, sessionId) {
    const totalClasses = await ClassModel.countDocuments({ schoolId, sessionId, deletedAt: null });
    const totalSections = await Section.countDocuments({ schoolId, sessionId, deletedAt: null });
    const totalStudents = await StudentClassMapping.countDocuments({ schoolId, sessionId, status: 'ACTIVE', deletedAt: null });
    
    const classes = await ClassModel.find({ schoolId, sessionId, deletedAt: null });
    let totalCapacity = 0;
    let totalTeachers = 0;
    
    classes.forEach(c => {
      totalCapacity += c.capacity || 0;
      if (c.classTeacherId) totalTeachers++;
    });

    const occupancyPercentage = totalCapacity ? (totalStudents / totalCapacity) * 100 : 0;

    const promotionStats = await PromotionHistory.aggregate([
      { $match: { schoolId, previousSessionId: sessionId, isRolledBack: false } },
      { $group: { _id: '$promotionStatus', count: { $sum: 1 } } }
    ]);

    return {
      totalClasses,
      totalSections,
      totalStudents,
      totalTeachers,
      totalCapacity,
      occupancyPercentage: occupancyPercentage.toFixed(2),
      promotionStats,
    };
  }
}

module.exports = new DashboardService();
