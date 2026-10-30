import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Paper,
  Typography,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  GENDER_OPTIONS,
  STATUS_OPTIONS,
  BLOOD_GROUP_OPTIONS,
  INDIAN_STATES,
} from '../../constants';
import PhotoUploader from './PhotoUploader';

// Basic Schema
const schema = yup.object({
  admissionNumber: yup.string().required('Admission Number is required').max(50),
  rollNumber: yup.string().max(50).nullable(),
  studentName: yup.string().required('Student Name is required').max(100),
  gender: yup.string().required('Gender is required'),
  dateOfBirth: yup.date().required('Date of Birth is required').max(new Date(), 'DOB cannot be in the future'),
  bloodGroup: yup.string().nullable(),
  religion: yup.string().max(50).nullable(),
  category: yup.string().max(50).nullable(),
  fatherName: yup.string().max(100).nullable(),
  motherName: yup.string().max(100).nullable(),
  guardianName: yup.string().max(100).nullable(),
  fatherMobile: yup.string().matches(/^[0-9+\-\s()]{10,15}$/, { message: 'Invalid mobile', excludeEmptyString: true }).nullable(),
  motherMobile: yup.string().matches(/^[0-9+\-\s()]{10,15}$/, { message: 'Invalid mobile', excludeEmptyString: true }).nullable(),
  studentMobile: yup.string().matches(/^[0-9+\-\s()]{10,15}$/, { message: 'Invalid mobile', excludeEmptyString: true }).nullable(),
  email: yup.string().email('Invalid email format').nullable(),
  aadhaarNumber: yup.string().matches(/^[0-9]{12}$/, { message: 'Aadhaar must be 12 digits', excludeEmptyString: true }).nullable(),
  addressLine1: yup.string().max(200).nullable(),
  addressLine2: yup.string().max(200).nullable(),
  city: yup.string().max(100).nullable(),
  district: yup.string().max(100).nullable(),
  state: yup.string().nullable(),
  postalCode: yup.string().max(20).nullable(),
  status: yup.string().required('Status is required'),
});

const StudentForm = ({
  initialData,
  onSubmit,
  isSubmitting,
  isEditMode = false,
  onCancel,
}) => {
  const navigate = useNavigate();
  const [photoFile, setPhotoFile] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      admissionNumber: '',
      rollNumber: '',
      studentName: '',
      gender: '',
      dateOfBirth: '',
      bloodGroup: '',
      religion: '',
      category: '',
      fatherName: '',
      motherName: '',
      guardianName: '',
      fatherMobile: '',
      motherMobile: '',
      studentMobile: '',
      email: '',
      aadhaarNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      district: '',
      state: '',
      postalCode: '',
      status: 'Active',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data, photoFile);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Grid container spacing={3}>
        {/* Left Column: Form Fields */}
        <Grid item xs={12} md={8}>
          
          <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
            <Typography variant="h6" gutterBottom color="primary">
              Academic Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="admissionNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Admission Number *"
                      fullWidth
                      error={!!errors.admissionNumber}
                      helperText={errors.admissionNumber?.message}
                      disabled={isEditMode} // Usually shouldn't change
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="rollNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Roll Number"
                      fullWidth
                      error={!!errors.rollNumber}
                      helperText={errors.rollNumber?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Status *"
                      fullWidth
                      error={!!errors.status}
                      helperText={errors.status?.message}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
            <Typography variant="h6" gutterBottom color="primary">
              Personal Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="studentName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Student Full Name *"
                      fullWidth
                      error={!!errors.studentName}
                      helperText={errors.studentName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Gender *"
                      fullWidth
                      error={!!errors.gender}
                      helperText={errors.gender?.message}
                    >
                      {GENDER_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Date of Birth *"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dateOfBirth}
                      helperText={errors.dateOfBirth?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="bloodGroup"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Blood Group"
                      fullWidth
                      error={!!errors.bloodGroup}
                      helperText={errors.bloodGroup?.message}
                    >
                      <MenuItem value="">None</MenuItem>
                      {BLOOD_GROUP_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="aadhaarNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Aadhaar Number"
                      fullWidth
                      error={!!errors.aadhaarNumber}
                      helperText={errors.aadhaarNumber?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
            <Typography variant="h6" gutterBottom color="primary">
              Parent & Contact Details
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="fatherName"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Father's Name" fullWidth error={!!errors.fatherName} helperText={errors.fatherName?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="fatherMobile"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Father's Mobile" fullWidth error={!!errors.fatherMobile} helperText={errors.fatherMobile?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="motherName"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Mother's Name" fullWidth error={!!errors.motherName} helperText={errors.motherName?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="motherMobile"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Mother's Mobile" fullWidth error={!!errors.motherMobile} helperText={errors.motherMobile?.message} />
                  )}
                />
              </Grid>
               <Grid item xs={12} sm={6}>
                <Controller
                  name="studentMobile"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Student Mobile" fullWidth error={!!errors.studentMobile} helperText={errors.studentMobile?.message} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Email Address" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
            <Typography variant="h6" gutterBottom color="primary">
              Address Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller name="addressLine1" control={control} render={({ field }) => <TextField {...field} label="Address Line 1" fullWidth />} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="city" control={control} render={({ field }) => <TextField {...field} label="City" fullWidth />} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="State" fullWidth>
                      <MenuItem value="">None</MenuItem>
                      {INDIAN_STATES.map((state) => (
                        <MenuItem key={state} value={state}>{state}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="postalCode" control={control} render={({ field }) => <TextField {...field} label="Postal Code" fullWidth />} />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right Column: Photo & Actions */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {!isEditMode && (
              <PhotoUploader
                onPhotoUpdate={(file) => setPhotoFile(file)}
              />
            )}
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={onCancel || (() => navigate(-1))}
                startIcon={<ArrowBackIcon />}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              >
                {isEditMode ? 'Update' : 'Create'} Student
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentForm;
