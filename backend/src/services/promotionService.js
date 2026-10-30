const StudentClassMapping = require('../models/StudentClassMapping');
const PromotionHistory = require('../models/PromotionHistory');
const Session = require('../models/Session');
const ClassModel = require('../models/Class');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

class PromotionService {
  async promoteStudent(promotionData, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const {
        schoolId, previousSessionId, nextSessionId, studentId,
        previousClassId, previousSectionId, nextClassId, nextSectionId,
        promotionStatus, remarks
      } = promotionData;

      // Deactivate current mapping
      await StudentClassMapping.updateOne(
        { schoolId, sessionId: previousSessionId, studentId, classId: previousClassId, status: 'ACTIVE' },
        { status: promotionStatus === 'PROMOTED' ? 'PROMOTED' : 'DETAINED' },
        { session }
      );

      // Create new mapping for next session
      const newMapping = new StudentClassMapping({
        schoolId,
        sessionId: nextSessionId,
        studentId,
        classId: nextClassId,
        sectionId: nextSectionId,
        assignedBy: userId,
        status: 'ACTIVE'
      });
      await newMapping.save({ session });

      // Create promotion history
      const history = new PromotionHistory({
        ...promotionData,
        promotedBy: userId,
        batchPromotionId: uuidv4() // Single promotion still gets a batch ID for consistency
      });
      await history.save({ session });

      await session.commitTransaction();
      return history;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async promoteBatch(schoolId, previousSessionId, nextSessionId, students, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const batchId = uuidv4();
      const histories = [];

      for (const student of students) {
        // Deactivate current mapping
        await StudentClassMapping.updateOne(
          { schoolId, sessionId: previousSessionId, studentId: student.studentId, classId: student.previousClassId, status: 'ACTIVE' },
          { status: student.promotionStatus === 'PROMOTED' ? 'PROMOTED' : 'DETAINED' },
          { session }
        );

        // Create new mapping
        const newMapping = new StudentClassMapping({
          schoolId,
          sessionId: nextSessionId,
          studentId: student.studentId,
          classId: student.nextClassId,
          sectionId: student.nextSectionId || null,
          assignedBy: userId,
          status: 'ACTIVE'
        });
        await newMapping.save({ session });

        // Record history
        const history = new PromotionHistory({
          schoolId,
          previousSessionId,
          nextSessionId,
          studentId: student.studentId,
          previousClassId: student.previousClassId,
          previousSectionId: student.previousSectionId || null,
          nextClassId: student.nextClassId,
          nextSectionId: student.nextSectionId || null,
          promotionStatus: student.promotionStatus,
          remarks: student.remarks || '',
          promotedBy: userId,
          batchPromotionId: batchId
        });
        histories.push(history);
      }

      await PromotionHistory.insertMany(histories, { session });
      await session.commitTransaction();
      return { batchId, count: histories.length };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async rollbackPromotion(schoolId, batchPromotionId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const histories = await PromotionHistory.find({ schoolId, batchPromotionId, isRolledBack: false });
      
      if (!histories.length) {
        throw new Error('No active promotions found for this batch ID');
      }

      for (const history of histories) {
        // Remove the mapping in the next session
        await StudentClassMapping.deleteOne({
          schoolId,
          sessionId: history.nextSessionId,
          studentId: history.studentId,
          classId: history.nextClassId
        }, { session });

        // Restore the mapping in the previous session
        await StudentClassMapping.updateOne(
          { schoolId, sessionId: history.previousSessionId, studentId: history.studentId, classId: history.previousClassId },
          { status: 'ACTIVE' },
          { session }
        );

        history.isRolledBack = true;
        await history.save({ session });
      }

      await session.commitTransaction();
      return { message: 'Rollback successful', count: histories.length };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getPromotionHistory(schoolId, filters) {
    const query = { schoolId, ...filters };
    return await PromotionHistory.find(query).populate('studentId', 'name email rollNumber').sort({ createdAt: -1 });
  }
}

module.exports = new PromotionService();
