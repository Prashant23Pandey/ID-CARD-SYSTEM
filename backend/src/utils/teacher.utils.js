const bwipjs = require('bwip-js');
const QRCode = require('qrcode');

/**
 * Generate a Base64 string for a barcode
 * @param {string} text - The text to encode (e.g., Teacher Code)
 * @returns {Promise<string>} - Base64 Data URI
 */
const generateTeacherBarcode = async (text) => {
  try {
    return await new Promise((resolve, reject) => {
      bwipjs.toBuffer(
        {
          bcid: 'code128',
          text: String(text),
          scale: 3,
          height: 10,
          includetext: true,
          textxalign: 'center',
        },
        (err, png) => {
          if (err) return reject(err);
          resolve(`data:image/png;base64,${png.toString('base64')}`);
        }
      );
    });
  } catch (error) {
    console.error('Barcode generation failed', error);
    return null;
  }
};

/**
 * Generate a Base64 string for a QR Code
 * @param {object} payload - The object to encode (e.g., ID, Code, School)
 * @returns {Promise<string>} - Base64 Data URI
 */
const generateTeacherQRCode = async (payload) => {
  try {
    const stringPayload = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return await QRCode.toDataURL(stringPayload, {
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  } catch (error) {
    console.error('QR Code generation failed', error);
    return null;
  }
};

/**
 * Format Teacher response object (remove sensitive fields)
 */
const formatTeacherResponse = (teacher) => {
  const t = teacher.toObject ? teacher.toObject() : teacher;
  delete t.passwordHash;
  delete t.__v;
  return t;
};

/**
 * Sanitize incoming teacher input for creation/updates
 */
const sanitizeTeacherInput = (data) => {
  const sanitized = { ...data };
  // Remove fields that shouldn't be bulk-updated directly by user
  delete sanitized._id;
  delete sanitized.id;
  delete sanitized.schoolId; // Handled by controller/token
  delete sanitized.passwordHash; // Handled separately
  delete sanitized.createdAt;
  delete sanitized.updatedAt;
  delete sanitized.deletedAt;
  delete sanitized.qrCode;
  delete sanitized.barcode;
  delete sanitized.createdBy;
  delete sanitized.updatedBy;
  return sanitized;
};

module.exports = {
  generateTeacherBarcode,
  generateTeacherQRCode,
  formatTeacherResponse,
  sanitizeTeacherInput,
};
