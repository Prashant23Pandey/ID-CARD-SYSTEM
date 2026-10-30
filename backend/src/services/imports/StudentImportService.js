const mongoose = require('mongoose');
const { Student } = require('../models/Student');
const { User } = require('../models/User');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Session = require('../models/Session');
const School = require('../models/School');
const ImportHistory = require('../models/imports/ImportHistory');
const ExcelParser = require('../utils/ExcelParser');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

class StudentImportService {
  static async validateStudentRecord(record, schoolId, importMapping) {
    const errors = [];
    const warnings = [];

    // Required fields validation
    const requiredFields = ['admissionNumber', 'studentName', 'className'];
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

    // Gender validation
    if (record.gender && !['MALE', 'FEMALE', 'OTHER'].includes(record.gender.toUpperCase())) {
      errors.push({
        field: 'gender',
        type: 'INVALID_GENDER',
        message: 'Gender must be MALE, FEMALE, or OTHER',
        value: record.gender,
      });
    }

    // Class and Section validation
    if (record.className) {
      const classRecord = await Class.findOne({
        schoolId,
        className: record.className,
        deletedAt: null,
      });
      if (!classRecord) {
        errors.push({
          field: 'className',
          type: 'CLASS_NOT_FOUND',
          message: `Class "${record.className}" not found`,
          suggestedFix: 'Ensure class exists in the school',
          value: record.className,
        });
      }
    }

    // Session validation
    if (record.sessionName) {
      const sessionRecord = await Session.findOne({
        schoolId,
        sessionName: record.sessionName,
        deletedAt: null,
      });
      if (!sessionRecord) {
        warnings.push({
          field: 'sessionName',
          type: 'SESSION_NOT_FOUND',
          message: `Session "${record.sessionName}" not found`,
        });
      }
    } else {
      warnings.push({
        field: 'sessionName',
        type: 'SESSION_NOT_PROVIDED',
        message: 'Session not provided, will use active session',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  static async checkDuplicates(record, schoolId, importId) {
    const duplicates = [];

    // Check admission number
    if (record.admissionNumber) {
      const existing = await Student.findOne({
        schoolId,
        admissionNumber: record.admissionNumber,
        deletedAt: null,
      });
      if (existing) {
        duplicates.push({
          field: 'admissionNumber',
          value: record.admissionNumber,
          duplicateOf: existing._id.toString(),
          type: 'ADMISSION_NUMBER_DUPLICATE',
        });
      }
    }

    // Check Aadhaar
    if (record.aadhaarNumber) {
      const existing = await Student.findOne({
        schoolId,
        aadhaarNumber: record.aadhaarNumber,
        deletedAt: null,
      });
      if (existing) {
        duplicates.push({
          field: 'aadhaarNumber',
          value: record.aadhaarNumber,
          duplicateOf: existing._id.toString(),
          type: 'AADHAAR_DUPLICATE',
        });
      }
    }

    // Check Email
    if (record.email) {
      const existing = await Student.findOne({
        schoolId,
        email: record.email,
        deletedAt: null,
      });
      if (existing) {
        duplicates.push({
          field: 'email',
          value: record.email,
          duplicateOf: existing._id.toString(),
          type: 'EMAIL_DUPLICATE',
        });
      }
    }

    // Check Mobile
    if (record.mobile) {
      const existing = await Student.findOne({
        schoolId,
        mobile: record.mobile,
        deletedAt: null,
      });
      if (existing) {
        duplicates.push({
          field: 'mobile',
          value: record.mobile,
          duplicateOf: existing._id.toString(),
          type: 'MOBILE_DUPLICATE',
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
      // Create import history record
      const importHistory = await ImportHistory.create({
        schoolId,
        uploadedBy: userId,
        fileName,
        fileType,
        module: 'STUDENT',
        status: 'PROCESSING',
        filePath,
      });

      // Parse file
      const parseResult = await ExcelParser.parseFile(filePath, fileType);
      if (!parseResult.success) {
        throw new Error(parseResult.error);
      }

      const records = parseResult.data;
      const validationErrors = [];
      const duplicateRecords = [];
      const warnings = [];
      let validRecords = 0;

      // Validate each record
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const rowNumber = i + 2; // Row 1 is header

        // Validate record
        const validation = await this.validateStudentRecord(record, schoolId, {});

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
          // Check duplicates
          const duplicates = await this.checkDuplicates(record, schoolId, importHistory._id);
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

        if (validation.warnings.length > 0) {
          warnings.push(
            ...validation.warnings.map((w) => ({
              rowNumber,
              message: w.message,
              type: w.type,
            }))
          );
        }
      }

      // Update import history
      importHistory.totalRecords = records.length;
      importHistory.successfulRecords = validRecords;
      importHistory.failedRecords = validationErrors.length;
      importHistory.skippedRecords = duplicateRecords.length;
      importHistory.validationErrors = validationErrors;
      importHistory.duplicateRecords = duplicateRecords;
      importHistory.warnings = warnings;
      importHistory.status = 'COMPLETED';
      importHistory.completedAt = new Date();

      const processingTime = Date.now() - startTime;
      importHistory.importStats = {
        processingTimeMs: processingTime,
        averageTimePerRecord: (processingTime / records.length).toFixed(2),
        duplicatesDetected: duplicateRecords.length,
        validationErrorsCount: validationErrors.length,
        warningsCount: warnings.length,
      };

      await importHistory.save();

      return {
        success: true,
        importId: importHistory._id,
        totalRecords: records.length,
        validRecords,
        errorRecords: validationErrors.length,
        skippedRecords: duplicateRecords.length,
        warnings: warnings.length,
        processingTime,
        importHistory: importHistory.toObject(),
      };
    } catch (error) {
      logger.error('Student import validation error:', error);
      throw error;
    }
  }

  static async importStudents(
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

      // Parse file
      const parseResult = await ExcelParser.parseFile(
        filePath,
        importHistory.fileType
      );
      if (!parseResult.success) {
        throw new Error(parseResult.error);
      }

      const records = parseResult.data;
      const processedIds = [];
      const errors = [];
      let successCount = 0;

      // Get active session
      const activeSession = await Session.findOne(
        { schoolId, isActive: true, deletedAt: null },
        {},
        { session }
      );

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const rowNumber = i + 2;

        try {
          // Validate record
          const validation = await this.validateStudentRecord(record, schoolId, {});
          if (!validation.isValid) {
            continue;
          }

          // Get class
          const classRecord = await Class.findOne(
            {
              schoolId,
              className: record.className,
              deletedAt: null,
            },
            {},
            { session }
          );
          if (!classRecord) {
            continue;
          }

          // Get section
          let sectionRecord = null;
          if (record.sectionName) {
            sectionRecord = await Section.findOne(
              {
                schoolId,
                classId: classRecord._id,
                sectionName: record.sectionName,
                deletedAt: null,
              },
              {},
              { session }
            );
          }

          // Create student
          const studentData = {
            schoolId,
            admissionNumber: record.admissionNumber,
            rollNumber: record.rollNumber || '',
            firstName: record.studentName ? record.studentName.split(' ')[0] : '',
            lastName: record.studentName ? record.studentName.split(' ').slice(1).join(' ') : '',
            gender: record.gender ? record.gender.toUpperCase() : 'OTHER',
            dob: record.dob ? new Date(record.dob) : null,
            fatherName: record.fatherName || '',
            motherName: record.motherName || '',
            mobile: record.mobile || '',
            email: record.email || '',
            aadhaarNumber: record.aadhaarNumber || '',
            address: record.address || '',
            bloodGroup: record.bloodGroup || '',
            classId: classRecord._id,
            sectionId: sectionRecord ? sectionRecord._id : null,
            sessionId: activeSession ? activeSession._id : null,
            photoName: record.photoName || null,
            createdBy: userId,
          };

          // Check for existing record
          const existingStudent = await Student.findOne(
            {
              schoolId,
              admissionNumber: record.admissionNumber,
              deletedAt: null,
            },
            {},
            { session }
          );

          let student;
          if (existingStudent) {
            if (duplicateHandling === 'UPDATE') {
              student = await Student.findByIdAndUpdate(
                existingStudent._id,
                { ...studentData, updatedBy: userId },
                { new: true, session }
              );
            } else if (duplicateHandling === 'REPLACE') {
              await Student.findByIdAndUpdate(
                existingStudent._id,
                { deletedAt: new Date() },
                { session }
              );
              student = await Student.create([studentData], { session });
              student = student[0];
            } else {
              continue; // SKIP
            }
          } else {
            const created = await Student.create([studentData], { session });
            student = created[0];
          }

          processedIds.push(student._id);
          successCount++;
        } catch (err) {
          errors.push({
            rowNumber,
            error: err.message,
          });
        }
      }

      // Update import history
      importHistory.processedRecordIds = processedIds;
      importHistory.successfulRecords = successCount;
      importHistory.failedRecords = errors.length;
      importHistory.status = 'COMPLETED';
      importHistory.completedAt = new Date();
      await importHistory.save({ session });

      await session.commitTransaction();
      return {
        success: true,
        processedRecords: successCount,
        failedRecords: errors.length,
        importId: importHistory._id,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Student import error:', error);
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

      // Delete imported students
      await Student.updateMany(
        { _id: { $in: importHistory.processedRecordIds }, deletedAt: null },
        { deletedAt: new Date() },
        { session }
      );

      // Update import history
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
      module: 'STUDENT',
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

module.exports = StudentImportService;
