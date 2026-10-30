const { Teacher } = require('../models/Teacher');
const { generateTeacherBarcode, generateTeacherQRCode } = require('../utils/teacher.utils');
const xlsx = require('xlsx');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class TeacherService {
  buildQuery(schoolId, queryParams) {
    const {
      search,
      status,
      designation,
      department,
    } = queryParams;

    let query = { schoolId };

    if (search) {
      query.$text = { $search: search };
    }
    if (status) query.status = status;
    if (designation) query.designation = designation;
    if (department) query.department = department;

    return query;
  }

  async getTeachers(schoolId, queryParams) {
    const { page = 1, limit = 10, sortBy = 'fullName', sortOrder = 'asc' } = queryParams;
    const skip = (page - 1) * limit;

    const query = this.buildQuery(schoolId, queryParams);
    const sortConfig = {};
    if (sortBy) sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [teachers, total] = await Promise.all([
      Teacher.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('classId', 'className sectionName'),
      Teacher.countDocuments(query),
    ]);

    return {
      data: teachers,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  async createTeacher(schoolId, data, userId) {
    // Unique Check
    const existing = await Teacher.findOne({
      schoolId,
      $or: [{ employeeId: data.employeeId }, { teacherCode: data.teacherCode }, { email: data.email }]
    }).setOptions({ includeDeleted: true });

    if (existing) {
      throw { status: 400, message: 'Employee ID, Teacher Code, or Email already exists.' };
    }

    // Auto-generate a temporary password if not provided
    const plainPassword = data.password || crypto.randomBytes(6).toString('hex');

    const newTeacher = new Teacher({
      ...data,
      schoolId,
      passwordHash: plainPassword, // Pre-save hook will hash this
      createdBy: userId,
      updatedBy: userId,
    });

    newTeacher.barcode = await generateTeacherBarcode(newTeacher.teacherCode);
    newTeacher.qrCode = await generateTeacherQRCode({
      id: newTeacher._id,
      code: newTeacher.teacherCode,
      sch: schoolId,
    });

    await newTeacher.save();

    // TODO in a real app: Send `plainPassword` to teacher via email service here.

    return newTeacher;
  }

  async assignClass(schoolId, teacherId, classId, userId) {
    // Ensure the class isn't already assigned to someone else in the same school
    const existingAssignment = await Teacher.findOne({ schoolId, classId, _id: { $ne: teacherId } });
    if (existingAssignment) {
      throw { status: 400, message: `Class is already assigned to ${existingAssignment.fullName}` };
    }

    const teacher = await Teacher.findOneAndUpdate(
      { _id: teacherId, schoolId },
      { classId, updatedBy: userId },
      { new: true, runValidators: true }
    ).populate('classId');

    if (!teacher) throw { status: 404, message: 'Teacher not found' };
    return teacher;
  }

  async removeClass(schoolId, teacherId, userId) {
    const teacher = await Teacher.findOneAndUpdate(
      { _id: teacherId, schoolId },
      { classId: null, updatedBy: userId },
      { new: true }
    );
    if (!teacher) throw { status: 404, message: 'Teacher not found' };
    return teacher;
  }

  async processAndSaveImage(file, teacherId, type = 'photo') {
    if (!file) return null;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'teachers', type);
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `teacher_${type}_${teacherId}_${Date.now()}.webp`;
    const filepath = path.join(uploadsDir, filename);

    // Photos get cropped to square, signatures retain aspect ratio but shrink
    const sharpInstance = sharp(file.buffer);
    if (type === 'photo') {
      sharpInstance.resize(400, 400, { fit: 'cover' });
    } else {
      sharpInstance.resize(600, 200, { fit: 'inside' }); // Signature
    }
    
    await sharpInstance.webp({ quality: 80 }).toFile(filepath);

    return `/uploads/teachers/${type}/${filename}`;
  }

  async processBulkImport(schoolId, fileBuffer, userId) {
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!rawData || rawData.length === 0) throw { status: 400, message: 'Excel file is empty' };

    const successRecords = [];
    const errorRecords = [];
    const BATCH_SIZE = 50;

    for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
      const batch = rawData.slice(i, i + BATCH_SIZE);
      const operations = [];

      for (const row of batch) {
        try {
          if (!row['Employee ID'] || !row['Full Name'] || !row['Email']) {
            throw new Error('Missing required fields (Employee ID, Full Name, Email)');
          }

          const doc = {
            schoolId,
            employeeId: String(row['Employee ID']).trim(),
            teacherCode: String(row['Teacher Code'] || row['Employee ID']).trim(),
            fullName: row['Full Name'],
            email: row['Email'],
            mobile: String(row['Mobile']),
            gender: row['Gender'] || 'Other',
            dateOfBirth: row['DOB'] ? new Date(row['DOB']) : new Date('1990-01-01'),
            department: row['Department'],
            designation: row['Designation'] || 'Teacher',
            createdBy: userId,
            updatedBy: userId,
          };

          doc.barcode = await generateTeacherBarcode(doc.teacherCode);
          doc.qrCode = await generateTeacherQRCode({ code: doc.teacherCode, sch: schoolId });

          operations.push({
            updateOne: {
              filter: { schoolId, employeeId: doc.employeeId },
              update: { $set: doc },
              upsert: true
            }
          });
          successRecords.push(row['Employee ID']);
        } catch (err) {
          errorRecords.push({ row, error: err.message });
        }
      }

      if (operations.length > 0) {
        await Teacher.bulkWrite(operations, { ordered: false });
      }
    }

    return {
      totalProcessed: rawData.length,
      successCount: successRecords.length,
      errorCount: errorRecords.length,
      errors: errorRecords
    };
  }

  async exportExcel(schoolId, queryParams) {
    const exportQuery = { ...queryParams };
    delete exportQuery.page;
    delete exportQuery.limit;

    const query = this.buildQuery(schoolId, exportQuery);
    const teachers = await Teacher.find(query).populate('classId', 'className').lean();

    const dataForExcel = teachers.map(t => ({
      'Employee ID': t.employeeId,
      'Teacher Code': t.teacherCode,
      'Full Name': t.fullName,
      'Email': t.email,
      'Mobile': t.mobile,
      'Gender': t.gender,
      'DOB': t.dateOfBirth ? t.dateOfBirth.toISOString().split('T')[0] : '',
      'Department': t.department,
      'Designation': t.designation,
      'Assigned Class': t.classId ? t.classId.className : 'None',
      'Status': t.status,
    }));

    const ws = xlsx.utils.json_to_sheet(dataForExcel);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Teachers');
    
    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async resetPassword(schoolId, teacherId, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    const teacher = await Teacher.findOneAndUpdate(
      { _id: teacherId, schoolId },
      { passwordHash },
      { new: true }
    );
    if (!teacher) throw { status: 404, message: 'Teacher not found' };
    return true;
  }
}

module.exports = new TeacherService();
