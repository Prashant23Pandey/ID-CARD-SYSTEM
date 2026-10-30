const XLSX = require('exceljs');
const { Student } = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Session = require('../models/Session');
const ExportHistory = require('../models/imports/ExportHistory');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');

class ExportService {
  static async buildExportQuery(schoolId, filters = {}) {
    const query = { schoolId, deletedAt: null };

    if (filters.classId) {
      query.classId = filters.classId;
    }

    if (filters.sessionId) {
      query.sessionId = filters.sessionId;
    }

    if (filters.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { admissionNumber: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.status && filters.status !== 'ALL') {
      query.isActive = filters.status === 'ACTIVE';
    }

    return query;
  }

  static async exportStudentsToExcel(schoolId, userId, filters = {}) {
    const startTime = Date.now();

    try {
      const query = this.buildExportQuery(schoolId, filters);
      const students = await Student.find(query)
        .populate('classId', 'className')
        .populate('sectionId', 'sectionName')
        .populate('sessionId', 'sessionName')
        .lean();

      const workbook = new XLSX.Workbook();
      const worksheet = workbook.addWorksheet('Students');

      // Add headers
      const headers = [
        'Admission Number',
        'Roll Number',
        'Student Name',
        'Gender',
        'Date of Birth',
        'Father Name',
        'Mother Name',
        'Mobile',
        'Email',
        'Aadhaar Number',
        'Address',
        'Class',
        'Section',
        'Session',
        'Blood Group',
      ];

      worksheet.addRow(headers);

      // Style header row
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };

      // Add data rows
      for (const student of students) {
        worksheet.addRow([
          student.admissionNumber,
          student.rollNumber,
          `${student.firstName} ${student.lastName}`,
          student.gender,
          student.dob ? student.dob.toISOString().split('T')[0] : '',
          student.fatherName,
          student.motherName,
          student.mobile,
          student.email,
          student.aadhaarNumber,
          student.address,
          student.classId?.className || '',
          student.sectionId?.sectionName || '',
          student.sessionId?.sessionName || '',
          student.bloodGroup,
        ]);
      }

      // Adjust column widths
      worksheet.columns = [
        { width: 15 },
        { width: 12 },
        { width: 20 },
        { width: 10 },
        { width: 15 },
        { width: 18 },
        { width: 18 },
        { width: 12 },
        { width: 20 },
        { width: 15 },
        { width: 25 },
        { width: 12 },
        { width: 12 },
        { width: 15 },
        { width: 12 },
      ];

      const fileName = `students_export_${Date.now()}.xlsx`;
      const filePath = path.join(process.env.UPLOAD_DIR || './uploads', fileName);
      await workbook.xlsx.writeFile(filePath);

      const fileSize = fs.statSync(filePath).size;
      const processingTime = Date.now() - startTime;

      const exportHistory = await ExportHistory.create({
        schoolId,
        exportedBy: userId,
        module: 'STUDENT',
        format: 'xlsx',
        status: 'COMPLETED',
        totalRecords: students.length,
        exportedRecords: students.length,
        fileName,
        fileUrl: `/uploads/${fileName}`,
        filePath,
        fileSize,
        processingTimeMs: processingTime,
        recordsPerSecond: (students.length / (processingTime / 1000)).toFixed(2),
        completedAt: new Date(),
        filters,
      });

      return {
        success: true,
        fileName,
        fileUrl: `/uploads/${fileName}`,
        totalRecords: students.length,
        exportId: exportHistory._id,
      };
    } catch (error) {
      logger.error('Student export error:', error);
      throw error;
    }
  }

  static async exportStudentsToCSV(schoolId, userId, filters = {}) {
    try {
      const query = this.buildExportQuery(schoolId, filters);
      const students = await Student.find(query)
        .populate('classId', 'className')
        .populate('sectionId', 'sectionName')
        .lean();

      const headers = [
        'Admission Number',
        'Roll Number',
        'Student Name',
        'Gender',
        'Date of Birth',
        'Father Name',
        'Mother Name',
        'Mobile',
        'Email',
        'Aadhaar Number',
        'Address',
        'Class',
        'Section',
        'Blood Group',
      ];

      const rows = students.map((student) => [
        student.admissionNumber,
        student.rollNumber,
        `${student.firstName} ${student.lastName}`,
        student.gender,
        student.dob ? student.dob.toISOString().split('T')[0] : '',
        student.fatherName,
        student.motherName,
        student.mobile,
        student.email,
        student.aadhaarNumber,
        student.address,
        student.classId?.className || '',
        student.sectionId?.sectionName || '',
        student.bloodGroup,
      ]);

      const csv = [headers, ...rows]
        .map((row) =>
          row
            .map((cell) => {
              if (typeof cell === 'string' && cell.includes(',')) {
                return `"${cell}"`;
              }
              return cell || '';
            })
            .join(',')
        )
        .join('\n');

      const fileName = `students_export_${Date.now()}.csv`;
      const filePath = path.join(process.env.UPLOAD_DIR || './uploads', fileName);
      fs.writeFileSync(filePath, csv);

      const fileSize = fs.statSync(filePath).size;

      await ExportHistory.create({
        schoolId,
        exportedBy: userId,
        module: 'STUDENT',
        format: 'csv',
        status: 'COMPLETED',
        totalRecords: students.length,
        exportedRecords: students.length,
        fileName,
        fileUrl: `/uploads/${fileName}`,
        filePath,
        fileSize,
        completedAt: new Date(),
        filters,
      });

      return {
        success: true,
        fileName,
        fileUrl: `/uploads/${fileName}`,
        totalRecords: students.length,
      };
    } catch (error) {
      logger.error('Student CSV export error:', error);
      throw error;
    }
  }

  static async exportTeachersToExcel(schoolId, userId, filters = {}) {
    try {
      const query = { schoolId, deletedAt: null };

      if (filters.departmentId) {
        query.department = filters.departmentId;
      }

      if (filters.search) {
        query.$or = [
          { firstName: { $regex: filters.search, $options: 'i' } },
          { lastName: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
          { teacherCode: { $regex: filters.search, $options: 'i' } },
        ];
      }

      const teachers = await Teacher.find(query)
        .populate('assignedClasses', 'className')
        .lean();

      const workbook = new XLSX.Workbook();
      const worksheet = workbook.addWorksheet('Teachers');

      const headers = [
        'Teacher Code',
        'Employee ID',
        'Name',
        'Gender',
        'Date of Birth',
        'Qualification',
        'Experience',
        'Email',
        'Mobile',
        'Aadhaar',
        'PAN',
        'Department',
        'Designation',
        'Joining Date',
        'Assigned Classes',
      ];

      worksheet.addRow(headers);
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF70AD47' },
      };

      for (const teacher of teachers) {
        const classNames = teacher.assignedClasses
          ?.map((c) => c.className)
          .join(', ') || '';

        worksheet.addRow([
          teacher.teacherCode,
          teacher.employeeId,
          `${teacher.firstName} ${teacher.lastName}`,
          teacher.gender,
          teacher.dob ? teacher.dob.toISOString().split('T')[0] : '',
          teacher.qualification,
          teacher.experience,
          teacher.email,
          teacher.mobile,
          teacher.aadhaarNumber,
          teacher.panNumber,
          teacher.department,
          teacher.designation,
          teacher.joiningDate ? teacher.joiningDate.toISOString().split('T')[0] : '',
          classNames,
        ]);
      }

      worksheet.columns = [
        { width: 15 },
        { width: 15 },
        { width: 20 },
        { width: 10 },
        { width: 15 },
        { width: 15 },
        { width: 12 },
        { width: 20 },
        { width: 12 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 25 },
      ];

      const fileName = `teachers_export_${Date.now()}.xlsx`;
      const filePath = path.join(process.env.UPLOAD_DIR || './uploads', fileName);
      await workbook.xlsx.writeFile(filePath);

      const fileSize = fs.statSync(filePath).size;

      await ExportHistory.create({
        schoolId,
        exportedBy: userId,
        module: 'TEACHER',
        format: 'xlsx',
        status: 'COMPLETED',
        totalRecords: teachers.length,
        exportedRecords: teachers.length,
        fileName,
        fileUrl: `/uploads/${fileName}`,
        filePath,
        fileSize,
        completedAt: new Date(),
        filters,
      });

      return {
        success: true,
        fileName,
        fileUrl: `/uploads/${fileName}`,
        totalRecords: teachers.length,
      };
    } catch (error) {
      logger.error('Teacher export error:', error);
      throw error;
    }
  }

  static async exportClassesToExcel(schoolId, userId, filters = {}) {
    try {
      const classes = await Class.find({ schoolId, deletedAt: null })
        .populate('sections', 'sectionName')
        .lean();

      const workbook = new XLSX.Workbook();
      const worksheet = workbook.addWorksheet('Classes');

      worksheet.addRow(['Class Name', 'Sections', 'Created At']);

      for (const cls of classes) {
        const sections = cls.sections?.map((s) => s.sectionName).join(', ') || '';
        worksheet.addRow([
          cls.className,
          sections,
          cls.createdAt ? cls.createdAt.toISOString().split('T')[0] : '',
        ]);
      }

      const fileName = `classes_export_${Date.now()}.xlsx`;
      const filePath = path.join(process.env.UPLOAD_DIR || './uploads', fileName);
      await workbook.xlsx.writeFile(filePath);

      return {
        success: true,
        fileName,
        fileUrl: `/uploads/${fileName}`,
        totalRecords: classes.length,
      };
    } catch (error) {
      logger.error('Class export error:', error);
      throw error;
    }
  }

  static async exportSessionsToExcel(schoolId, userId, filters = {}) {
    try {
      const sessions = await Session.find({ schoolId, deletedAt: null }).lean();

      const workbook = new XLSX.Workbook();
      const worksheet = workbook.addWorksheet('Sessions');

      worksheet.addRow([
        'Session Name',
        'Session Code',
        'Academic Year',
        'Start Date',
        'End Date',
        'Status',
        'Is Active',
      ]);

      for (const session of sessions) {
        worksheet.addRow([
          session.sessionName,
          session.sessionCode,
          session.academicYear,
          session.startDate ? session.startDate.toISOString().split('T')[0] : '',
          session.endDate ? session.endDate.toISOString().split('T')[0] : '',
          session.status,
          session.isActive ? 'Yes' : 'No',
        ]);
      }

      const fileName = `sessions_export_${Date.now()}.xlsx`;
      const filePath = path.join(process.env.UPLOAD_DIR || './uploads', fileName);
      await workbook.xlsx.writeFile(filePath);

      return {
        success: true,
        fileName,
        fileUrl: `/uploads/${fileName}`,
        totalRecords: sessions.length,
      };
    } catch (error) {
      logger.error('Session export error:', error);
      throw error;
    }
  }

  static async getExportHistory(schoolId, filters = {}) {
    const query = { schoolId, deletedAt: null };

    if (filters.module) {
      query.module = filters.module;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 100);
    const skip = (page - 1) * limit;

    const total = await ExportHistory.countDocuments(query);
    const exports = await ExportHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('exportedBy', 'email name')
      .lean();

    return {
      data: exports,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

module.exports = ExportService;
