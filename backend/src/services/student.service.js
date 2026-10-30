const { Student, StudentCounter } = require('../models/Student');
const { generateBarcode, generateQRCode } = require('../utils/student.utils');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class StudentService {
  /**
   * Build MongoDB query based on filter parameters
   */
  buildQuery(schoolId, queryParams) {
    const {
      search,
      classId,
      sectionId,
      sessionId,
      gender,
      status,
      bloodGroup,
    } = queryParams;

    let query = { schoolId };

    if (search) {
      query.$text = { $search: search };
    }

    if (classId) query.classId = classId;
    if (sectionId) query.sectionId = sectionId;
    if (sessionId) query.sessionId = sessionId;
    if (gender) query.gender = gender;
    if (status) query.status = status;
    if (bloodGroup) query.bloodGroup = bloodGroup;

    return query;
  }

  /**
   * Get paginated students list
   */
  async getStudents(schoolId, queryParams) {
    const { page = 1, limit = 10, sortBy = 'studentName', sortOrder = 'asc' } = queryParams;
    const skip = (page - 1) * limit;

    const query = this.buildQuery(schoolId, queryParams);

    const sortConfig = {};
    if (sortBy) {
      sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const [students, total] = await Promise.all([
      Student.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('classId', 'className')
        .populate('sectionId', 'sectionName')
        .populate('sessionId', 'sessionName'),
      Student.countDocuments(query),
    ]);

    return {
      data: students,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Create a single student with QR and Barcode auto-generation
   */
  async createStudent(schoolId, studentData, userId) {
    // Ensure Admission Number is unique per school
    const existing = await Student.findOne({ 
      schoolId, 
      admissionNumber: studentData.admissionNumber 
    }).setOptions({ includeDeleted: true });

    if (existing) {
      throw { status: 400, message: 'Admission Number already exists in this school' };
    }

    const newStudent = new Student({
      ...studentData,
      schoolId,
      createdBy: userId,
      updatedBy: userId,
    });

    // Generate codes
    newStudent.barcode = await generateBarcode(newStudent.admissionNumber);
    newStudent.qrCode = await generateQRCode({
      id: newStudent._id,
      adm: newStudent.admissionNumber,
      sch: schoolId
    });

    await newStudent.save();
    return newStudent;
  }

  /**
   * Handle Photo Upload and compression
   */
  async processAndSavePhoto(file, studentId) {
    if (!file) return null;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'students');
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `student_${studentId}_${Date.now()}.webp`;
    const filepath = path.join(uploadsDir, filename);

    await sharp(file.buffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(filepath);

    return `/uploads/students/${filename}`;
  }

  /**
   * Parse XLSX for Bulk Import
   */
  async processBulkImport(schoolId, sessionId, fileBuffer, userId) {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet);

    if (!rawData || rawData.length === 0) {
      throw { status: 400, message: 'Excel file is empty or invalid' };
    }

    const successRecords = [];
    const errorRecords = [];
    const BATCH_SIZE = 50;

    for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
      const batch = rawData.slice(i, i + BATCH_SIZE);
      const operations = [];

      for (const row of batch) {
        try {
          if (!row['Admission Number'] || !row['Student Name']) {
            throw new Error('Missing required fields: Admission Number or Student Name');
          }

          // Map Excel columns to Schema (Very basic mapping for example)
          const doc = {
            schoolId,
            sessionId,
            admissionNumber: String(row['Admission Number']).trim(),
            studentName: row['Student Name'],
            gender: row['Gender'] || 'Other',
            dateOfBirth: row['DOB'] ? new Date(row['DOB']) : new Date(), // Proper parsing needed in reality
            bloodGroup: row['Blood Group'],
            fatherName: row['Father Name'],
            motherName: row['Mother Name'],
            studentMobile: row['Mobile'],
            createdBy: userId,
            updatedBy: userId,
          };

          // Generate Codes
          doc.barcode = await generateBarcode(doc.admissionNumber);
          doc.qrCode = await generateQRCode({
            adm: doc.admissionNumber,
            sch: schoolId
          });

          // Using Upsert (Create or Update based on Admission Number)
          operations.push({
            updateOne: {
              filter: { schoolId, admissionNumber: doc.admissionNumber },
              update: { $set: doc },
              upsert: true
            }
          });
          
          successRecords.push(row['Admission Number']);
        } catch (err) {
          errorRecords.push({ row, error: err.message });
        }
      }

      if (operations.length > 0) {
        await Student.bulkWrite(operations, { ordered: false });
      }
    }

    return {
      totalProcessed: rawData.length,
      successCount: successRecords.length,
      errorCount: errorRecords.length,
      errors: errorRecords
    };
  }

  /**
   * Export students to Excel Buffer
   */
  async exportStudentsExcel(schoolId, queryParams) {
    // Remove pagination to get all matching
    const exportQuery = { ...queryParams };
    delete exportQuery.page;
    delete exportQuery.limit;

    const query = this.buildQuery(schoolId, exportQuery);
    const students = await Student.find(query)
      .populate('classId', 'className')
      .populate('sectionId', 'sectionName')
      .lean();

    const dataForExcel = students.map(s => ({
      'Admission Number': s.admissionNumber,
      'Roll Number': s.rollNumber,
      'Student Name': s.studentName,
      'Class': s.classId?.className || '',
      'Section': s.sectionId?.sectionName || '',
      'Gender': s.gender,
      'DOB': s.dateOfBirth ? s.dateOfBirth.toISOString().split('T')[0] : '',
      'Blood Group': s.bloodGroup,
      'Father Name': s.fatherName,
      'Mother Name': s.motherName,
      'Mobile': s.studentMobile || s.fatherMobile,
      'Email': s.email,
      'Status': s.status,
    }));

    const ws = xlsx.utils.json_to_sheet(dataForExcel);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Students');
    
    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Promote students to new Session/Class
   */
  async promoteStudents(schoolId, { studentIds, newSessionId, newClassId, newSectionId }, userId) {
    if (!studentIds || !studentIds.length) {
      throw { status: 400, message: 'No students selected for promotion' };
    }

    const updatePayload = {
      sessionId: newSessionId,
      updatedBy: userId,
    };
    if (newClassId) updatePayload.classId = newClassId;
    if (newSectionId) updatePayload.sectionId = newSectionId;

    const result = await Student.updateMany(
      { _id: { $in: studentIds }, schoolId },
      { $set: updatePayload }
    );

    return result;
  }
}

module.exports = new StudentService();
