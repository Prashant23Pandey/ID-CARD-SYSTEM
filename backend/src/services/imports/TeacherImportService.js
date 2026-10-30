const mongoose = require('mongoose');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const ImportHistory = require('../models/imports/ImportHistory');
const ExcelParser = require('../utils/ExcelParser');
const logger = require('../utils/logger');
const path = require('path');

class TeacherImportService {
  static async validateTeacherRecord(record, schoolId) {
    const errors = [];
    const warnings = [];

    // Required fields
    const requiredFields = ['teacherCode', 'name'];
    for (const field of requiredFields) {
      if (!record[field] || (typeof record[field] === 'string' && record[field].trim() === '')) {
        errors.push({
          field,
          type: 'REQUIRED_FIELD_MISSING',
          message: `${field} is required`,
          value: record[field],
        });
      }
    }

    // Email validation
    if (record.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(record.email)) {
        errors.push({
          field: 'email',
          type: 'INVALID_EMAIL',
          message: 'Invalid email format',
          value: record.email,
        });
      }
    }

    // Mobile validation
    if (record.mobile) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(String(record.mobile).trim())) {
        errors.push({
          field: 'mobile',
          type: 'INVALID_MOBILE',
          message: 'Mobile must be 10 digits',
          value: record.mobile,
        });
      }
    }

    // Aadhaar validation
    if (record.aadhaarNumber) {
      const aadhaarRegex = /^[0-9]{12}$/;
      if (!aadhaarRegex.test(String(record.aadhaarNumber).trim())) {
        errors.push({
          field: 'aadhaarNumber',
          type: 'INVALID_AADHAAR',
          message: 'Aadhaar must be 12 digits',
          value: record.aadhaarNumber,
        });
      }
    }

    // PAN validation
    if (record.panNumber) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(record.panNumber)) {
        errors.push({
          field: 'panNumber',
          type: 'INVALID_PAN',
          message: 'Invalid PAN format',
          value: record.panNumber,
        });
      }
    }

    // Gender validation
    if (record.gender && !['MALE', 'FEMALE', 'OTHER'].includes(record.gender.toUpperCase())) {
      errors.push({
        field: 'gender',
        type: 'INVALID_GENDER',
        message: 'Gender must be MALE, FEMALE, or OTHER',
        value: record.gender,
      });
    }

    // Experience validation
    if (record.experience) {
      const exp = parseInt(record.experience);
      if (isNaN(exp) || exp < 0 || exp > 70) {
        errors.push({
          field: 'experience',
          type: 'INVALID_EXPERIENCE',
          message: 'Experience must be between 0 and 70',
          value: record.experience,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static async checkDuplicates(record, schoolId) {
    const duplicates = [];

    // Check teacher code
    if (record.teacherCode) {
      const existing = await Teacher.findOne({
        schoolId,
        teacherCode: record.teacherCode,
        deletedAt: null,
      });
      if (existing) {
        duplicates.push({
          field: 'teacherCode',
          value: record.teacherCode,
          duplicateOf: existing._id.toString(),
        });
      }
    }

    // Check employee ID
    if (record.employeeId) {
      const existing = await Teacher.findOne({
        schoolId,
        employeeId: record.employeeId,
        deletedAt: null,
      });
      if (existing) {
        duplicates.push({
          field: 'employeeId',
          value: record.employeeId,
          duplicateOf: existing._id.toString(),
        });
      }
    }

    // Check email
    if (record.email) {
      const existing = await Teacher.findOne({
        schoolId,
        email: record.email,
        deletedAt: null,
      });
      if (existing) {
        duplicates.push({
          field: 'email',
          value: record.email,
          duplicateOf: existing._id.toString(),
        });
      }
    }

    // Check mobile
    if (record.mobile) {
      const existing = await Teacher.findOne({
        schoolId,
        mobile: record.mobile,
        deletedAt: null,
      });
      if (existing) {
        duplicates.push({
          field: 'mobile',
          value: record.mobile,
          duplicateOf: existing._id.toString(),
        });
      }
    }

    // Check Aadhaar
    if (record.aadhaarNumber) {
      const existing = await Teacher.findOne({
        schoolId,
        aadhaarNumber: record.aadhaarNumber,
        deletedAt: null,
      });
      if (existing) {
        duplicates.push({
          field: 'aadhaarNumber',
          value: record.aadhaarNumber,
          duplicateOf: existing._id.toString(),
        });
      }
    }

    return duplicates;
  }

  static async parseAndValidateImport(filePath, schoolId, userId) {
    const startTime = Date.now();
    const fileName = path.basename(filePath);
    const fileType = path.extname(fileName).slice(1).toLowerCase();

    try {
      const importHistory = await ImportHistory.create({
        schoolId,
        uploadedBy: userId,
        fileName,
        fileType,
        module: 'TEACHER',
        status: 'PROCESSING',
        filePath,
      });

      const parseResult = await ExcelParser.parseFile(filePath, fileType);
      if (!parseResult.success) {
        throw new Error(parseResult.error);
      }

      const records = parseResult.data;
      const validationErrors = [];
      const duplicateRecords = [];
      let validRecords = 0;

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const rowNumber = i + 2;

        const validation = await this.validateTeacherRecord(record, schoolId);

        if (!validation.isValid) {
          validationErrors.push(
            ...validation.errors.map((err) => ({
              rowNumber,
              fieldName: err.field,
              errorType: err.type,
              errorMessage: err.message,
              suggestedFix: err.suggestedFix || 'Check the value and try again',
              value: err.value,
            }))
          );
        } else {
          const duplicates = await this.checkDuplicates(record, schoolId);
          if (duplicates.length > 0) {
            duplicateRecords.push({
              rowNumber,
              duplicateOf: duplicates[0].duplicateOf,
              field: duplicates[0].field,
              value: duplicates[0].value,
            });
          } else {
            validRecords++;
          }
        }
      }

      importHistory.totalRecords = records.length;
      importHistory.successfulRecords = validRecords;
      importHistory.failedRecords = validationErrors.length;
      importHistory.skippedRecords = duplicateRecords.length;
      importHistory.validationErrors = validationErrors;
      importHistory.duplicateRecords = duplicateRecords;
      importHistory.status = 'COMPLETED';
      importHistory.completedAt = new Date();

      const processingTime = Date.now() - startTime;
      importHistory.importStats = {
        processingTimeMs: processingTime,
        averageTimePerRecord: (processingTime / records.length).toFixed(2),
        duplicatesDetected: duplicateRecords.length,
        validationErrorsCount: validationErrors.length,
        warningsCount: 0,
      };

      await importHistory.save();

      return {
        success: true,
        importId: importHistory._id,
        totalRecords: records.length,
        validRecords,
        errorRecords: validationErrors.length,
        skippedRecords: duplicateRecords.length,
        processingTime,
        importHistory: importHistory.toObject(),
      };
    } catch (error) {
      logger.error('Teacher import validation error:', error);
      throw error;
    }
  }

  static async importTeachers(
    importId,
    schoolId,
    userId,
    filePath,
    duplicateHandling = 'SKIP'
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const importHistory = await ImportHistory.findById(importId).session(session);
      if (!importHistory) {
        throw new Error('Import record not found');
      }

      importHistory.status = 'PROCESSING';
      await importHistory.save({ session });

      const parseResult = await ExcelParser.parseFile(filePath, importHistory.fileType);
      if (!parseResult.success) {
        throw new Error(parseResult.error);
      }

      const records = parseResult.data;
      const processedIds = [];
      let successCount = 0;

      for (let i = 0; i < records.length; i++) {
        const record = records[i];

        try {
          const validation = await this.validateTeacherRecord(record, schoolId);
          if (!validation.isValid) {
            continue;
          }

          // Get assigned classes
          const assignedClasses = [];
          if (record.classAssignment) {
            const classNames = Array.isArray(record.classAssignment)
              ? record.classAssignment
              : [record.classAssignment];
            for (const className of classNames) {
              const classRecord = await Class.findOne(
                {
                  schoolId,
                  className: className.trim(),
                  deletedAt: null,
                },
                {},
                { session }
              );
              if (classRecord) {
                assignedClasses.push(classRecord._id);
              }
            }
          }

          const teacherData = {
            schoolId,
            teacherCode: record.teacherCode,
            employeeId: record.employeeId || '',
            firstName: record.name ? record.name.split(' ')[0] : '',
            lastName: record.name ? record.name.split(' ').slice(1).join(' ') : '',
            gender: record.gender ? record.gender.toUpperCase() : 'OTHER',
            dob: record.dob ? new Date(record.dob) : null,
            qualification: record.qualification || '',
            experience: record.experience ? parseInt(record.experience) : 0,
            email: record.email || '',
            mobile: record.mobile || '',
            aadhaarNumber: record.aadhaarNumber || '',
            panNumber: record.panNumber || '',
            department: record.department || '',
            designation: record.designation || '',
            joiningDate: record.joiningDate ? new Date(record.joiningDate) : null,
            assignedClasses: assignedClasses,
            photoName: record.photoName || null,
            createdBy: userId,
          };

          const existingTeacher = await Teacher.findOne(
            {
              schoolId,
              teacherCode: record.teacherCode,
              deletedAt: null,
            },
            {},
            { session }
          );

          let teacher;
          if (existingTeacher) {
            if (duplicateHandling === 'UPDATE') {
              teacher = await Teacher.findByIdAndUpdate(
                existingTeacher._id,
                { ...teacherData, updatedBy: userId },
                { new: true, session }
              );
            } else if (duplicateHandling === 'REPLACE') {
              await Teacher.findByIdAndUpdate(
                existingTeacher._id,
                { deletedAt: new Date() },
                { session }
              );
              const created = await Teacher.create([teacherData], { session });
              teacher = created[0];
            } else {
              continue;
            }
          } else {
            const created = await Teacher.create([teacherData], { session });
            teacher = created[0];
          }

          processedIds.push(teacher._id);
          successCount++;
        } catch (err) {
          logger.error(`Error importing teacher at row ${i + 2}:`, err);
        }
      }

      importHistory.processedRecordIds = processedIds;
      importHistory.successfulRecords = successCount;
      importHistory.status = 'COMPLETED';
      importHistory.completedAt = new Date();
      await importHistory.save({ session });

      await session.commitTransaction();
      return {
        success: true,
        processedRecords: successCount,
        importId: importHistory._id,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Teacher import error:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async rollbackImport(importId, schoolId, userId, reason) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const importHistory = await ImportHistory.findById(importId).session(session);
      if (!importHistory || importHistory.schoolId.toString() !== schoolId.toString()) {
        throw new Error('Import record not found');
      }

      if (!importHistory.canRollback()) {
        throw new Error('This import cannot be rolled back');
      }

      await Teacher.updateMany(
        { _id: { $in: importHistory.processedRecordIds }, deletedAt: null },
        { deletedAt: new Date() },
        { session }
      );

      importHistory.status = 'ROLLED_BACK';
      importHistory.rollbackRequestedAt = new Date();
      importHistory.rollbackCompletedAt = new Date();
      importHistory.rollbackReason = reason;
      importHistory.rollbackRequestedBy = userId;
      await importHistory.save({ session });

      await session.commitTransaction();
      return {
        success: true,
        message: 'Import rolled back successfully',
        rollbackCount: importHistory.processedRecordIds.length,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Rollback error:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getImportHistory(schoolId, filters = {}) {
    const query = {
      schoolId,
      module: 'TEACHER',
      deletedAt: null,
    };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.fileName = { $regex: filters.search, $options: 'i' };
    }

    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 100);
    const skip = (page - 1) * limit;

    const total = await ImportHistory.countDocuments(query);
    const imports = await ImportHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'email name')
      .lean();

    return {
      data: imports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

module.exports = TeacherImportService;
