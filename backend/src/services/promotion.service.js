const PromotionHistory = require('../models/PromotionHistory');
const { Student } = require('../models/Student');
const Session = require('../models/Session');
const Class = require('../models/Class');
const Section = require('../models/Section');
const StudentClassMapping = require('../models/StudentClassMapping');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

class PromotionService {
  /**
   * Promote a single student
   */
  async promoteStudent(schoolId, promotionData, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        studentId,
        fromSessionId,
        toSessionId,
        fromClassId,
        toClassId,
        fromSectionId,
        toSectionId,
        promotionStatus,
        remarks,
        performanceMetrics,
      } = promotionData;

      // Check if student exists
      const student = await Student.findOne({
        _id: studentId,
        schoolId,
        deletedAt: null,
      }).session(session);

      if (!student) {
        throw { status: 404, message: 'Student not found' };
      }

      // Check if sessions exist
      const [fromSession, toSession] = await Promise.all([
        Session.findOne({ _id: fromSessionId, schoolId, deletedAt: null }).session(session),
        Session.findOne({ _id: toSessionId, schoolId, deletedAt: null }).session(session),
      ]);

      if (!fromSession || !toSession) {
        throw { status: 404, message: 'One or both sessions not found' };
      }

      // Check if classes exist
      const [fromClass, toClass] = await Promise.all([
        Class.findOne({ _id: fromClassId, schoolId, deletedAt: null }).session(session),
        Class.findOne({ _id: toClassId, schoolId, deletedAt: null }).session(session),
      ]);

      if (!fromClass || !toClass) {
        throw { status: 404, message: 'One or both classes not found' };
      }

      // Create promotion history record
      const promotionHistory = new PromotionHistory({
        schoolId,
        previousSessionId: fromSessionId,
        nextSessionId: toSessionId,
        studentId,
        previousClassId: fromClassId,
        previousSectionId: fromSectionId,
        nextClassId: toClassId,
        nextSectionId: toSectionId,
        promotionStatus,
        remarks: remarks || '',
        promotedBy: userId,
        performanceMetrics: performanceMetrics || {},
      });

      await promotionHistory.save({ session });

      // Update student's current session and class
      student.sessionId = toSessionId;
      student.classId = toClassId;
      if (toSectionId) {
        student.sectionId = toSectionId;
      }
      student.updatedBy = userId;
      await student.save({ session });

      // Update or create StudentClassMapping
      await StudentClassMapping.findOneAndUpdate(
        {
          studentId,
          schoolId,
        },
        {
          studentId,
          schoolId,
          classId: toClassId,
          sectionId: toSectionId || null,
          sessionId: toSessionId,
          status: promotionStatus === 'GRADUATED' ? 'ALUMNI' : 'ACTIVE',
          updatedBy: userId,
        },
        { upsert: true, session }
      );

      await session.commitTransaction();

      return {
        success: true,
        promotionHistoryId: promotionHistory._id,
        message: `Student promoted from ${fromClass.className} to ${toClass.className}`,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Bulk promote multiple students
   */
  async bulkPromoteStudents(schoolId, bulkPromotionData, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { fromSessionId, toSessionId, promotions } = bulkPromotionData;
      const batchPromotionId = uuidv4();
      const results = {
        successful: 0,
        failed: 0,
        errors: [],
        promotionHistoryIds: [],
      };

      // Check if sessions exist
      const [fromSession, toSession] = await Promise.all([
        Session.findOne({ _id: fromSessionId, schoolId, deletedAt: null }).session(session),
        Session.findOne({ _id: toSessionId, schoolId, deletedAt: null }).session(session),
      ]);

      if (!fromSession || !toSession) {
        throw { status: 404, message: 'One or both sessions not found' };
      }

      for (const promo of promotions) {
        try {
          const student = await Student.findOne({
            _id: promo.studentId,
            schoolId,
            deletedAt: null,
          }).session(session);

          if (!student) {
            results.failed++;
            results.errors.push({
              studentId: promo.studentId,
              error: 'Student not found',
            });
            continue;
          }

          const promotionHistory = new PromotionHistory({
            schoolId,
            previousSessionId: fromSessionId,
            nextSessionId: toSessionId,
            studentId: promo.studentId,
            previousClassId: promo.fromClassId,
            previousSectionId: promo.fromSectionId,
            nextClassId: promo.toClassId,
            nextSectionId: promo.toSectionId,
            promotionStatus: promo.promotionStatus,
            remarks: promo.remarks || '',
            promotedBy: userId,
            batchPromotionId,
            performanceMetrics: promo.performanceMetrics || {},
          });

          await promotionHistory.save({ session });

          student.sessionId = toSessionId;
          student.classId = promo.toClassId;
          if (promo.toSectionId) {
            student.sectionId = promo.toSectionId;
          }
          student.updatedBy = userId;
          await student.save({ session });

          await StudentClassMapping.findOneAndUpdate(
            { studentId: promo.studentId, schoolId },
            {
              studentId: promo.studentId,
              schoolId,
              classId: promo.toClassId,
              sectionId: promo.toSectionId || null,
              sessionId: toSessionId,
              status: promo.promotionStatus === 'GRADUATED' ? 'ALUMNI' : 'ACTIVE',
              updatedBy: userId,
            },
            { upsert: true, session }
          );

          results.successful++;
          results.promotionHistoryIds.push(promotionHistory._id);
        } catch (error) {
          results.failed++;
          results.errors.push({
            studentId: promo.studentId,
            error: error.message,
          });
        }
      }

      // Update session promotion completion status
      const toSessionDoc = await Session.findById(toSessionId).session(session);
      toSessionDoc.promotionCompleted = true;
      toSessionDoc.promotionEndDate = new Date();
      await toSessionDoc.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        batchPromotionId,
        ...results,
        message: `Bulk promotion completed: ${results.successful} successful, ${results.failed} failed`,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Promote entire class
   */
  async promoteClass(schoolId, promotionData, userId) {
    const {
      fromSessionId,
      toSessionId,
      fromClassId,
      toClassId,
      fromSectionId,
      toSectionId,
    } = promotionData;

    // Get all students in the class/section
    const query = {
      schoolId,
      classId: fromClassId,
      sessionId: fromSessionId,
      deletedAt: null,
    };

    if (fromSectionId) {
      query.sectionId = fromSectionId;
    }

    const students = await Student.find(query).select('_id');
    const studentIds = students.map((s) => s._id);

    const bulkPromotions = studentIds.map((studentId) => ({
      studentId,
      fromClassId,
      toClassId,
      fromSectionId,
      toSectionId,
      promotionStatus: 'PROMOTED',
    }));

    return this.bulkPromoteStudents(
      schoolId,
      {
        fromSessionId,
        toSessionId,
        promotions: bulkPromotions,
      },
      userId
    );
  }

  /**
   * Promote entire school
   */
  async promoteSchool(schoolId, promotionData, userId) {
    const { fromSessionId, toSessionId, classPromotionMap } = promotionData;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const batchPromotionId = uuidv4();
      const results = {
        successful: 0,
        failed: 0,
        errors: [],
      };

      // Get all students in previous session
      const students = await Student.find({
        schoolId,
        sessionId: fromSessionId,
        deletedAt: null,
      })
        .select('_id classId sectionId')
        .session(session);

      for (const student of students) {
        try {
          // Find class mapping
          const classMapping = classPromotionMap.find(
            (m) => m.fromClassId.toString() === student.classId.toString()
          );

          if (!classMapping) {
            results.failed++;
            results.errors.push({
              studentId: student._id,
              error: 'No promotion mapping found for student class',
            });
            continue;
          }

          const promotionHistory = new PromotionHistory({
            schoolId,
            previousSessionId: fromSessionId,
            nextSessionId: toSessionId,
            studentId: student._id,
            previousClassId: student.classId,
            previousSectionId: student.sectionId,
            nextClassId: classMapping.toClassId,
            nextSectionId: student.sectionId,
            promotionStatus: 'PROMOTED',
            promotedBy: userId,
            batchPromotionId,
          });

          await promotionHistory.save({ session });

          await Student.findByIdAndUpdate(
            student._id,
            {
              sessionId: toSessionId,
              classId: classMapping.toClassId,
              updatedBy: userId,
            },
            { session }
          );

          await StudentClassMapping.findOneAndUpdate(
            { studentId: student._id, schoolId },
            {
              studentId: student._id,
              schoolId,
              classId: classMapping.toClassId,
              sectionId: student.sectionId,
              sessionId: toSessionId,
              status: 'ACTIVE',
              updatedBy: userId,
            },
            { upsert: true, session }
          );

          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            studentId: student._id,
            error: error.message,
          });
        }
      }

      await session.commitTransaction();

      return {
        success: true,
        batchPromotionId,
        ...results,
        message: `School-wide promotion completed: ${results.successful} successful, ${results.failed} failed`,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get promotion history for a student
   */
  async getStudentPromotionHistory(studentId, schoolId, queryParams) {
    const { page = 1, limit = 10, sortBy = 'promotionDate', sortOrder = 'desc' } = queryParams;
    const skip = (page - 1) * limit;

    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [history, total] = await Promise.all([
      PromotionHistory.find({
        studentId,
        schoolId,
      })
        .sort(sortConfig)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('previousSessionId', 'sessionName')
        .populate('nextSessionId', 'sessionName')
        .populate('previousClassId', 'className')
        .populate('nextClassId', 'className')
        .populate('previousSectionId', 'sectionName')
        .populate('nextSectionId', 'sectionName')
        .populate('promotedBy', 'firstName lastName'),
      PromotionHistory.countDocuments({
        studentId,
        schoolId,
      }),
    ]);

    return {
      data: history,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get promotion history with filters
   */
  async getPromotionHistory(schoolId, queryParams) {
    const {
      page = 1,
      limit = 10,
      studentId,
      sessionId,
      promotionStatus,
      sortBy = 'promotionDate',
      sortOrder = 'desc',
    } = queryParams;

    const skip = (page - 1) * limit;

    let query = { schoolId };

    if (studentId) {
      query.studentId = studentId;
    }

    if (sessionId) {
      query.$or = [
        { nextSessionId: sessionId },
        { previousSessionId: sessionId },
      ];
    }

    if (promotionStatus) {
      query.promotionStatus = promotionStatus;
    }

    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [history, total] = await Promise.all([
      PromotionHistory.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('studentId', 'firstName lastName admissionNumber')
        .populate('previousSessionId', 'sessionName')
        .populate('nextSessionId', 'sessionName')
        .populate('previousClassId', 'className')
        .populate('nextClassId', 'className')
        .populate('promotedBy', 'firstName lastName'),
      PromotionHistory.countDocuments(query),
    ]);

    return {
      data: history,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Rollback single promotion
   */
  async rollbackPromotion(promotionHistoryId, schoolId, userId, rollbackReason) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const promotion = await PromotionHistory.findOne({
        _id: promotionHistoryId,
        schoolId,
      }).session(session);

      if (!promotion) {
        throw { status: 404, message: 'Promotion history not found' };
      }

      if (promotion.isRolledBack) {
        throw { status: 409, message: 'This promotion has already been rolled back' };
      }

      // Revert student to previous class/session
      await Student.findByIdAndUpdate(
        promotion.studentId,
        {
          sessionId: promotion.previousSessionId,
          classId: promotion.previousClassId,
          sectionId: promotion.previousSectionId,
          updatedBy: userId,
        },
        { session }
      );

      // Update StudentClassMapping
      await StudentClassMapping.findOneAndUpdate(
        { studentId: promotion.studentId, schoolId },
        {
          classId: promotion.previousClassId,
          sectionId: promotion.previousSectionId,
          sessionId: promotion.previousSessionId,
          updatedBy: userId,
        },
        { session }
      );

      // Mark promotion as rolled back
      promotion.isRolledBack = true;
      promotion.rollbackDate = new Date();
      promotion.rollbackBy = userId;
      promotion.rollbackReason = rollbackReason;
      await promotion.save({ session });

      await session.commitTransaction();

      return {
        success: true,
        message: 'Promotion rolled back successfully',
        promotionHistoryId,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Rollback batch promotion
   */
  async rollbackBatchPromotion(batchPromotionId, schoolId, userId, rollbackReason) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const promotions = await PromotionHistory.find({
        batchPromotionId,
        schoolId,
        isRolledBack: false,
      }).session(session);

      if (promotions.length === 0) {
        throw { status: 404, message: 'No promotions found for this batch or all already rolled back' };
      }

      let rolled = 0;

      for (const promotion of promotions) {
        await Student.findByIdAndUpdate(
          promotion.studentId,
          {
            sessionId: promotion.previousSessionId,
            classId: promotion.previousClassId,
            sectionId: promotion.previousSectionId,
            updatedBy: userId,
          },
          { session }
        );

        await StudentClassMapping.findOneAndUpdate(
          { studentId: promotion.studentId, schoolId },
          {
            classId: promotion.previousClassId,
            sectionId: promotion.previousSectionId,
            sessionId: promotion.previousSessionId,
            updatedBy: userId,
          },
          { session }
        );

        promotion.isRolledBack = true;
        promotion.rollbackDate = new Date();
        promotion.rollbackBy = userId;
        promotion.rollbackReason = rollbackReason;
        await promotion.save({ session });
        rolled++;
      }

      await session.commitTransaction();

      return {
        success: true,
        message: `Batch promotion rolled back successfully for ${rolled} students`,
        batchPromotionId,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get promotion preview
   */
  async getPromotionPreview(schoolId, queryParams) {
    const { fromSessionId, toSessionId, classId, sectionId } = queryParams;

    const query = {
      schoolId,
      sessionId: fromSessionId,
      deletedAt: null,
    };

    if (classId) {
      query.classId = classId;
    }

    if (sectionId) {
      query.sectionId = sectionId;
    }

    const students = await Student.find(query)
      .select('_id firstName lastName admissionNumber classId sectionId')
      .populate('classId', 'className')
      .populate('sectionId', 'sectionName')
      .limit(100);

    return {
      sessionInfo: {
        fromSessionId,
        toSessionId,
      },
      previewCount: students.length,
      students,
    };
  }

  /**
   * Get promotion report
   */
  async getPromotionReport(schoolId, queryParams) {
    const { sessionId, classId, reportType = 'SUMMARY' } = queryParams;

    let matchStage = { schoolId: mongoose.Types.ObjectId(schoolId) };

    if (sessionId) {
      matchStage.nextSessionId = mongoose.Types.ObjectId(sessionId);
    }

    if (classId) {
      matchStage.nextClassId = mongoose.Types.ObjectId(classId);
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            promotionStatus: '$promotionStatus',
            nextClass: '$nextClassId',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.promotionStatus': 1 } },
    ];

    if (reportType === 'DETAILED') {
      pipeline.pop(); // Remove sort
      pipeline.push(
        {
          $lookup: {
            from: 'users',
            localField: 'studentId',
            foreignField: '_id',
            as: 'student',
          },
        },
        {
          $lookup: {
            from: 'classes',
            localField: 'nextClassId',
            foreignField: '_id',
            as: 'nextClass',
          },
        },
        {
          $project: {
            _id: 0,
            studentName: { $arrayElemAt: ['$student.firstName', 0] },
            promotionStatus: 1,
            nextClass: { $arrayElemAt: ['$nextClass.className', 0] },
            promotionDate: 1,
          },
        }
      );
    }

    const report = await PromotionHistory.aggregate(pipeline);

    return {
      reportType,
      sessionId,
      classId,
      data: report,
    };
  }
}

module.exports = new PromotionService();