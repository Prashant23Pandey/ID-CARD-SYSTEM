import * as yup from 'yup';
import { ROLES } from '../constants';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const loginSchema = yup.object().shape({
  identifier: yup.string().required('Email or Username is required'),
  password: yup.string().required('Password is required'),
});

export const registerSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  username: yup.string().required('Username is required').min(4, 'Username must be at least 4 characters'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  mobile: yup.string().matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits').required('Mobile is required'),
  role: yup.string().oneOf(Object.values(ROLES), 'Invalid role').required('Role is required'),
  schoolId: yup.string().when('role', {
    is: (val) => val === ROLES.SCHOOLADMIN || val === ROLES.TEACHER,
    then: () => yup.string().required('School selection is required'),
    otherwise: () => yup.string().nullable(),
  }),
  password: yup
    .string()
    .required('Password is required')
    .matches(
      passwordRegex,
      'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
    ),
  confirmPassword: yup
    .string()
    .required('Confirm Password is required')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
  terms: yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
});

export const forgotPasswordSchema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
});

export const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required')
    .matches(
      passwordRegex,
      'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
    ),
  confirmPassword: yup
    .string()
    .required('Confirm Password is required')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

export const profileSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  mobile: yup.string().matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits').required('Mobile is required'),
});

export const changePasswordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .matches(
      passwordRegex,
      'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
    ),
  confirmNewPassword: yup
    .string()
    .required('Confirm new password is required')
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match'),
});

export const sessionSchema = yup.object().shape({
  sessionName: yup.string().required('Session Name is required').trim(),
  sessionCode: yup.string().required('Session Code is required').trim(),
  startDate: yup.date().required('Start Date is required').typeError('Invalid date'),
  endDate: yup
    .date()
    .required('End Date is required')
    .typeError('Invalid date')
    .min(yup.ref('startDate'), 'End Date must be after Start Date'),
  academicYear: yup.string().required('Academic Year is required').trim(),
  description: yup.string().max(500, 'Description cannot exceed 500 characters'),
});

export const classSchema = yup.object().shape({
  sessionId: yup.string().required('Session is required'),
  className: yup.string().required('Class Name is required').trim(),
  classCode: yup.string().required('Class Code is required').trim(),
  classNumericValue: yup
    .number()
    .required('Numeric Value is required')
    .min(0, 'Value must be 0 or greater')
    .typeError('Must be a number'),
  capacity: yup
    .number()
    .min(1, 'Capacity must be at least 1')
    .typeError('Must be a number')
    .default(50),
  description: yup.string().max(500, 'Description cannot exceed 500 characters'),
});

export const sectionSchema = yup.object().shape({
  sessionId: yup.string().required('Session is required'),
  classId: yup.string().required('Class is required'),
  sectionName: yup.string().required('Section Name is required').trim(),
  sectionCode: yup.string().required('Section Code is required').trim(),
  capacity: yup
    .number()
    .min(1, 'Capacity must be at least 1')
    .typeError('Must be a number')
    .default(40),
});

