const Section = require('../models/Section');
const StudentClassMapping = require('../models/StudentClassMapping');

class SectionService {
  async createSection(schoolId, sectionData, userId) {
    const section = new Section({
      ...sectionData,
      schoolId,
      createdBy: userId,
    });
    return await section.save();
  }

  async getSections(schoolId, sessionId, classId) {
    const query = { schoolId, sessionId, classId, deletedAt: null };
    return await Section.find(query).sort({ sectionName: 1 });
  }

  async getSectionById(sectionId, schoolId) {
    const section = await Section.findOne({ _id: sectionId, schoolId, deletedAt: null });
    if (!section) {
      throw new Error('Section not found');
    }
    return section;
  }

  async updateSection(sectionId, schoolId, updateData, userId) {
    const section = await this.getSectionById(sectionId, schoolId);
    Object.assign(section, updateData);
    section.updatedBy = userId;
    return await section.save();
  }

  async deleteSection(sectionId, schoolId, userId) {
    const section = await this.getSectionById(sectionId, schoolId);
    section.deletedAt = new Date();
    section.updatedBy = userId;
    return await section.save();
  }

  async assignStudent(sectionId, classId, schoolId, sessionId, studentId, userId) {
     const section = await this.getSectionById(sectionId, schoolId);
     const mapping = await StudentClassMapping.findOne({
         schoolId,
         sessionId,
         classId,
         studentId,
         status: 'ACTIVE',
         deletedAt: null,
     });

     if (!mapping) {
         throw new Error('Student not found in this class for the active session');
     }

     mapping.sectionId = sectionId;
     mapping.assignedBy = userId;
     
     // Update counts
     section.currentStudentCount += 1;
     await section.save();
     
     return await mapping.save();
  }
}

module.exports = new SectionService();
