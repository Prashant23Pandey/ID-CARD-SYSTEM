const { SCHOOL_TYPES, BOARD_TYPES, STATUS, SUBSCRIPTION_PLANS } = require('../models/School');

/**
 * Format school data for API response.
 * Strips internal fields and adds computed properties.
 */
const formatSchoolResponse = (school) => {
  if (!school) return null;

  const obj = school.toObject ? school.toObject() : school;

  return {
    id: obj._id || obj.id,
    schoolCode: obj.schoolCode,
    schoolName: obj.schoolName,
    schoolShortName: obj.schoolShortName,
    boardType: obj.boardType,
    schoolType: obj.schoolType,
    registrationNumber: obj.registrationNumber,
    principalName: obj.principalName,
    email: obj.email,
    phone: obj.phone,
    alternatePhone: obj.alternatePhone,
    website: obj.website,
    address: {
      line1: obj.addressLine1,
      line2: obj.addressLine2,
      city: obj.city,
      district: obj.district,
      state: obj.state,
      country: obj.country,
      postalCode: obj.postalCode,
      full: obj.fullAddress,
    },
    logoUrl: obj.logoUrl,
    bannerUrl: obj.bannerUrl,
    establishedYear: obj.establishedYear,
    capacity: {
      studentCapacity: obj.studentCapacity,
      currentStudentCount: obj.currentStudentCount,
      currentTeacherCount: obj.currentTeacherCount,
      utilization: obj.capacityUtilization,
    },
    subscription: {
      plan: obj.subscriptionPlan,
      startDate: obj.subscriptionStartDate,
      endDate: obj.subscriptionEndDate,
      isActive: obj.isSubscriptionActive,
    },
    status: obj.status,
    timezone: obj.timezone,
    language: obj.language,
    createdBy: obj.createdBy,
    updatedBy: obj.updatedBy,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
};

/**
 * Get enum options for form dropdowns.
 */
const getSchoolEnumOptions = () => ({
  schoolTypes: SCHOOL_TYPES.map((type) => ({ label: type, value: type })),
  boardTypes: BOARD_TYPES.map((type) => ({ label: type, value: type })),
  statusOptions: STATUS.filter((s) => s !== 'Deleted').map((status) => ({ label: status, value: status })),
  subscriptionPlans: SUBSCRIPTION_PLANS.map((plan) => ({ label: plan, value: plan })),
});

/**
 * Sanitize update data to remove protected fields.
 */
const sanitizeUpdateData = (data, role) => {
  const protectedFields = ['_id', 'schoolCode', 'createdBy', 'createdAt', 'deletedAt', '__v'];
  const adminOnlyFields = ['subscriptionPlan', 'subscriptionStartDate', 'subscriptionEndDate', 'status'];

  const sanitized = { ...data };

  protectedFields.forEach((field) => delete sanitized[field]);

  if (role !== 'SUPERADMIN') {
    adminOnlyFields.forEach((field) => delete sanitized[field]);
  }

  return sanitized;
};

/**
 * Build CSV export data from schools array.
 */
const buildSchoolCsvData = (schools) => {
  const headers = [
    'School Code', 'School Name', 'Board Type', 'School Type', 'Email',
    'Phone', 'City', 'State', 'Status', 'Subscription Plan',
    'Student Count', 'Teacher Count', 'Created At'
  ];

  const rows = schools.map((school) => [
    school.schoolCode,
    school.schoolName,
    school.boardType,
    school.schoolType,
    school.email,
    school.phone,
    school.city,
    school.state,
    school.status,
    school.subscriptionPlan,
    school.currentStudentCount,
    school.currentTeacherCount,
    new Date(school.createdAt).toLocaleDateString(),
  ]);

  return { headers, rows };
};

module.exports = {
  formatSchoolResponse,
  getSchoolEnumOptions,
  sanitizeUpdateData,
  buildSchoolCsvData,
};
