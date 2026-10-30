const ClassModel = require('../models/Class');
const StudentClassMapping = require('../models/StudentClassMapping');

class ClassService {
  async createClass(schoolId, classData, userId) {
    const newClass = new ClassModel({
      ...classData,
      schoolId,
      createdBy: userId,
    });
    return await newClass.save();
  }

  async getClasses(schoolId, sessionId, filters = {}) {
    const query = { schoolId, sessionId, deletedAt: null, ...filters };
    return await ClassModel.find(query).sort({ classNumericValue: 1 }).populate('classTeacherId', 'name email');
  }

  async getClassById(classId, schoolId) {
    const classData = await ClassModel.findOne({ _id: classId, schoolId, deletedAt: null }).populate('classTeacherId', 'name email');
    if (!classData) {
      throw new Error('Class not found');
    }
    return classData;
  }

  async updateClass(classId, schoolId, updateData, userId) {
    const classData = await this.getClassById(classId, schoolId);
    Object.assign(classData, updateData);
    classData.updatedBy = userId;
    return await classData.save();
  }

  async deleteClass(classId, schoolId, userId) {
    const classData = await this.getClassById(classId, schoolId);
    classData.deletedAt = new Date();
    classData.updatedBy = userId;
    return await classData.save();
  }

  async assignTeacher(classId, schoolId, teacherId, userId) {
    // Validation: One Class -> One Teacher, One Teacher -> One Class
    const existingAssignment = await ClassModel.findOne({
      schoolId,
      classTeacherId: teacherId,
      _id: { $ne: classId },
      deletedAt: null,
    });

    if (existingAssignment) {
      throw new Error('Teacher is already assigned to another class');
    }

    const classData = await this.getClassById(classId, schoolId);
    classData.classTeacherId = teacherId;
    classData.updatedBy = userId;
    return await classData.save();
  }

  async removeTeacher(classId, schoolId, userId) {
    const classData = await this.getClassById(classId, schoolId);
    classData.classTeacherId = null;
    classData.updatedBy = userId;
    return await classData.save();
  }

  async getClassStudents(classId, schoolId, sessionId) {
    return await StudentClassMapping.find({
      schoolId,
      sessionId,
      classId,
      status: 'ACTIVE',
      deletedAt: null,
    }).populate('studentId', 'name email rollNumber');
  }

  async getClassStatistics(classId, schoolId) {
    const classData = await this.getClassById(classId, schoolId);
    const activeStudents = await StudentClassMapping.countDocuments({
      classId,
      schoolId,
      status: 'ACTIVE',
      deletedAt: null,
    });
    
    return {
      capacity: classData.capacity,
      currentCount: activeStudents,
      occupancyPercentage: classData.capacity ? (activeStudents / classData.capacity) * 100 : 0,
      hasTeacher: !!classData.classTeacherId,
    };
  }
}

module.exports = new ClassService();
