const QRCode = require('qrcode');
const bwipjs = require('bwip-js');

const DYNAMIC_FIELDS = {
  studentName: 'Student Name',
  admissionNumber: 'Admission Number',
  rollNumber: 'Roll Number',
  class: 'Class',
  section: 'Section',
  session: 'Session',
  dateOfBirth: 'Date Of Birth',
  bloodGroup: 'Blood Group',
  fatherName: 'Father Name',
  motherName: 'Mother Name',
  address: 'Address',
  mobileNumber: 'Mobile Number',
  studentPhoto: 'Student Photo',
  schoolName: 'School Name',
  schoolLogo: 'School Logo',
  teacherName: 'Teacher Name',
  teacherCode: 'Teacher Code',
  employeeId: 'Employee ID',
  designation: 'Designation',
  department: 'Department',
  issueDate: 'Issue Date',
  expiryDate: 'Expiry Date',
  qrCode: 'QR Code',
  barcode: 'Barcode',
};

const PLACEHOLDER_REGEX = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

const replacePlaceholders = (value, data) => {
  if (typeof value !== 'string') return value;
  return value.replace(PLACEHOLDER_REGEX, (_, key) => (data[key] != null ? String(data[key]) : ''));
};

const walkBind = (node, data) => {
  if (Array.isArray(node)) return node.map((item) => walkBind(item, data));
  if (!node || typeof node !== 'object') return replacePlaceholders(node, data);

  const result = {};
  Object.keys(node).forEach((key) => {
    result[key] = walkBind(node[key], data);
  });
  return result;
};

const generateQrDataUrl = async (payload, options = {}) => {
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return QRCode.toDataURL(text, {
    margin: options.margin ?? 1,
    color: {
      dark: options.dark ?? '#000000',
      light: options.light ?? '#FFFFFF',
    },
    width: options.width ?? 180,
  });
};

const generateBarcodeDataUrl = async (text, options = {}) => {
  const format = options.format || 'CODE128';
  const png = await bwipjs.toBuffer({
    bcid: format.toLowerCase(),
    text: String(text),
    scale: options.scale || 3,
    height: options.height || 10,
    includetext: options.includeText ?? true,
    textxalign: 'center',
    backgroundcolor: 'FFFFFF',
  });
  return `data:image/png;base64,${png.toString('base64')}`;
};

module.exports = {
  DYNAMIC_FIELDS,
  replacePlaceholders,
  walkBind,
  generateQrDataUrl,
  generateBarcodeDataUrl,
};
