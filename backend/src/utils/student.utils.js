const bwipjs = require('bwip-js');
const QRCode = require('qrcode');

/**
 * Generate a Base64 Barcode URI for a given text.
 * @param {string} text - The text to encode (usually Admission Number)
 * @returns {Promise<string>} Base64 Data URI
 */
const generateBarcode = async (text) => {
  if (!text) return null;
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: 'code128',       // Barcode type
        text: text,            // Text to encode
        scale: 3,              // 3x scaling factor
        height: 10,            // Bar height, in millimeters
        includetext: false,    // Do not show human-readable text
        textxalign: 'center',  // Always good to set this
      },
      function (err, png) {
        if (err) {
          console.error('Barcode generation error:', err);
          return resolve(null); // Fallback gracefully instead of breaking
        } else {
          const base64Str = png.toString('base64');
          resolve(`data:image/png;base64,${base64Str}`);
        }
      }
    );
  });
};

/**
 * Generate a Base64 QR Code URI for a given object.
 * @param {Object} data - Data payload
 * @returns {Promise<string>} Base64 Data URI
 */
const generateQRCode = async (data) => {
  if (!data) return null;
  try {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
    const dataUri = await QRCode.toDataURL(jsonString, {
      margin: 1,
      width: 150,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    return dataUri;
  } catch (error) {
    console.error('QR Code generation error:', error);
    return null;
  }
};

/**
 * Format Student data for API response, stripping internal references if needed.
 */
const formatStudentResponse = (student) => {
  if (!student) return null;
  
  const obj = student.toObject ? student.toObject() : student;
  
  // Format specific fields if needed
  if (obj.dateOfBirth) {
    obj.dateOfBirth = obj.dateOfBirth.toISOString().split('T')[0];
  }
  if (obj.joiningDate) {
    obj.joiningDate = obj.joiningDate.toISOString().split('T')[0];
  }

  return obj;
};

/**
 * Clean up object properties (trim strings, convert empty to null)
 */
const sanitizeStudentInput = (data) => {
  const cleanData = { ...data };
  Object.keys(cleanData).forEach(key => {
    if (typeof cleanData[key] === 'string') {
      cleanData[key] = cleanData[key].trim();
      if (cleanData[key] === '') {
        cleanData[key] = null; // Convert empty strings to null for consistency
      }
    }
  });
  return cleanData;
};

module.exports = {
  generateBarcode,
  generateQRCode,
  formatStudentResponse,
  sanitizeStudentInput
};
