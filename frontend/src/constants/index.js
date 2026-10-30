export const ROLES = {
  SUPERADMIN: 'SUPERADMIN',
  SCHOOLADMIN: 'SCHOOLADMIN',
  TEACHER: 'TEACHER',
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  SUPERADMIN_DASHBOARD: '/superadmin/dashboard',
  SCHOOLADMIN_DASHBOARD: '/schooladmin/dashboard',
  TEACHER_DASHBOARD: '/teacher/dashboard',

  PROFILE: '/profile',

  // School Management Routes
  SCHOOLS: '/superadmin/schools',
  SCHOOL_CREATE: '/superadmin/schools/create',
  SCHOOL_DETAILS: '/superadmin/schools/:id',
  SCHOOL_EDIT: '/superadmin/schools/:id/edit',
  SCHOOL_SETTINGS: '/superadmin/schools/:id/settings',
  SCHOOL_ASSIGN_ADMIN: '/superadmin/schools/:id/assign-admin',

  // SchoolAdmin own school
  MY_SCHOOL: '/schooladmin/my-school',
  MY_SCHOOL_EDIT: '/schooladmin/my-school/edit',

  // Student Management Routes
  STUDENTS: '/students',
  STUDENT_CREATE: '/students/create',
  STUDENT_DETAILS: '/students/:id',
  STUDENT_EDIT: '/students/:id/edit',
  STUDENT_PROFILE: '/students/:id/profile',
  STUDENT_IMPORT: '/students/bulk-import',
  STUDENT_EXPORT: '/students/bulk-export',

  // Teacher Management Routes
  TEACHERS: '/teachers',
  TEACHER_CREATE: '/teachers/create',
  TEACHER_DETAILS: '/teachers/:id',
  TEACHER_EDIT: '/teachers/:id/edit',
  TEACHER_PROFILE: '/teachers/:id/profile',

  // Session Management Routes
  SESSIONS: '/sessions',
  SESSION_CREATE: '/sessions/create',
  SESSION_DETAILS: '/sessions/:id',
  SESSION_EDIT: '/sessions/:id/edit',

  // Class Management Routes
  CLASSES: '/classes',
  CLASS_CREATE: '/classes/create',
  CLASS_DETAILS: '/classes/:id',
  CLASS_EDIT: '/classes/:id/edit',

  // Section Management Routes
  SECTIONS: '/sections',
  SECTION_CREATE: '/sections/create',
  SECTION_EDIT: '/sections/:id/edit',

  // Promotion Routes
  PROMOTION_CENTER: '/promotions',
  PROMOTION_HISTORY: '/promotions/history',

  // Dashboard
  CLASS_DASHBOARD: '/class-dashboard',
  TEMPLATE_LIST: '/templates',
  TEMPLATE_DESIGNER_CREATE: '/templates/designer',
  TEMPLATE_DESIGNER_EDIT: '/templates/:id/designer',
  TEMPLATE_DETAILS: '/templates/:id/details',
  TEMPLATE_VERSIONS: '/templates/:id/versions',
  TEMPLATE_PREVIEW: '/templates/:id/preview',
};

export const TOAST_DURATIONS = {
  SHORT: 3000,
  NORMAL: 5000,
  LONG: 8000,
};

export const SCHOOL_TYPES = [
  { label: 'Public', value: 'Public' },
  { label: 'Private', value: 'Private' },
  { label: 'Government', value: 'Government' },
  { label: 'Semi-Government', value: 'Semi-Government' },
  { label: 'International', value: 'International' },
];

export const BOARD_TYPES = [
  { label: 'CBSE', value: 'CBSE' },
  { label: 'ICSE', value: 'ICSE' },
  { label: 'State Board', value: 'State Board' },
  { label: 'IB', value: 'IB' },
  { label: 'Cambridge', value: 'Cambridge' },
];

export const STATUS_OPTIONS = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Suspended', value: 'Suspended' },
];

export const SUBSCRIPTION_PLANS = [
  { label: 'Free', value: 'Free' },
  { label: 'Basic', value: 'Basic' },
  { label: 'Standard', value: 'Standard' },
  { label: 'Premium', value: 'Premium' },
  { label: 'Enterprise', value: 'Enterprise' },
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export const GENDER_OPTIONS = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
];

export const BLOOD_GROUP_OPTIONS = [
  { label: 'A+', value: 'A+' },
  { label: 'A-', value: 'A-' },
  { label: 'B+', value: 'B+' },
  { label: 'B-', value: 'B-' },
  { label: 'AB+', value: 'AB+' },
  { label: 'AB-', value: 'AB-' },
  { label: 'O+', value: 'O+' },
  { label: 'O-', value: 'O-' },
];

export const TEACHER_DESIGNATION_OPTIONS = [
  { label: 'Principal', value: 'Principal' },
  { label: 'Vice Principal', value: 'Vice Principal' },
  { label: 'Coordinator', value: 'Coordinator' },
  { label: 'Senior Teacher', value: 'Senior Teacher' },
  { label: 'Teacher', value: 'Teacher' },
  { label: 'Assistant Teacher', value: 'Assistant Teacher' },
];

export const TEACHER_STATUS_OPTIONS = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Suspended', value: 'Suspended' },
  { label: 'Resigned', value: 'Resigned' },
  { label: 'Retired', value: 'Retired' },
];
