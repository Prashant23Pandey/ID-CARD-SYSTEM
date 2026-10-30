const XLSX = require('xlsx');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

class ExcelParser {
  static parseExcelFile(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      return {
        success: true,
        data: rows,
        totalRecords: rows.length,
        sheetNames: workbook.SheetNames,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  static parseCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      const rows = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          rows.push(row);
        })
        .on('end', () => {
          resolve({
            success: true,
            data: rows,
            totalRecords: rows.length,
          });
        })
        .on('error', (error) => {
          reject({
            success: false,
            error: error.message,
          });
        });
    });
  }

  static async parseFile(filePath, fileType) {
    if (fileType === 'csv') {
      return this.parseCSVFile(filePath);
    }
    return this.parseExcelFile(filePath);
  }

  static generateExcelReport(data, columns = null) {
    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: columns || 1,
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    // Add styling
    worksheet['!cols'] = columns ? columns.map(() => ({ wch: 20 })) : [{ wch: 20 }];

    const fileName = `report_${Date.now()}.xlsx`;
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', fileName);
    XLSX.writeFile(workbook, filePath);

    return {
      fileName,
      filePath,
      url: `/uploads/${fileName}`,
    };
  }

  static generateCSVReport(data) {
    if (!data || data.length === 0) {
      return null;
    }

    const columns = Object.keys(data[0]);
    const csv = [
      columns.join(','),
      ...data.map((row) =>
        columns
          .map((col) => {
            const value = row[col];
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return value || '';
          })
          .join(',')
      ),
    ].join('\n');

    const fileName = `report_${Date.now()}.csv`;
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', fileName);
    fs.writeFileSync(filePath, csv);

    return {
      fileName,
      filePath,
      url: `/uploads/${fileName}`,
    };
  }

  static getColumnMapping(headers) {
    const studentMapping = {
      'Admission Number': 'admissionNumber',
      'Roll Number': 'rollNumber',
      'Student Name': 'studentName',
      Gender: 'gender',
      'DOB': 'dob',
      'Father Name': 'fatherName',
      'Mother Name': 'motherName',
      Mobile: 'mobile',
      Email: 'email',
      'Aadhaar Number': 'aadhaarNumber',
      Address: 'address',
      Class: 'className',
      Section: 'sectionName',
      Session: 'sessionName',
      'Blood Group': 'bloodGroup',
      'Photo Name': 'photoName',
    };

    const teacherMapping = {
      'Teacher Code': 'teacherCode',
      'Employee ID': 'employeeId',
      Name: 'name',
      Gender: 'gender',
      'DOB': 'dob',
      Qualification: 'qualification',
      Experience: 'experience',
      Email: 'email',
      Mobile: 'mobile',
      'Aadhaar': 'aadhaarNumber',
      'PAN': 'panNumber',
      Department: 'department',
      Designation: 'designation',
      'Joining Date': 'joiningDate',
      'Class Assignment': 'classAssignment',
      'Photo Name': 'photoName',
    };

    return {
      studentMapping,
      teacherMapping,
    };
  }

  static validateHeaders(headers, expectedType) {
    const { studentMapping, teacherMapping } = this.getColumnMapping({});

    const mapping =
      expectedType === 'STUDENT'
        ? Object.keys(studentMapping)
        : Object.keys(teacherMapping);

    const providedHeaders = Object.keys(headers[0] || {});
    const missingHeaders = mapping.filter((h) => !providedHeaders.includes(h));

    return {
      isValid: missingHeaders.length === 0,
      missingHeaders,
      providedHeaders,
    };
  }
}

module.exports = ExcelParser;
