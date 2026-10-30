import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Box, Grid, TextField, MenuItem, Button, Paper, Typography, Divider, CircularProgress } from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GENDER_OPTIONS, TEACHER_STATUS_OPTIONS, TEACHER_DESIGNATION_OPTIONS, BLOOD_GROUP_OPTIONS, INDIAN_STATES } from '../../constants';
import TeacherPhotoUploader from './TeacherPhotoUploader';
import TeacherSignatureUploader from './TeacherSignatureUploader';

const schema = yup.object({
  employeeId: yup.string().required('Employee ID is required').max(50),
  teacherCode: yup.string().required('Teacher Code is required').max(50),
  fullName: yup.string().required('Full Name is required').max(100),
  gender: yup.string().required('Gender is required'),
  dateOfBirth: yup.date().required('Date of Birth is required').max(new Date(), 'DOB cannot be in the future'),
  bloodGroup: yup.string().nullable(),
  email: yup.string().email('Invalid email format').required('Email is required'),
  mobile: yup.string().matches(/^[0-9+\-\s()]{10,15}$/, 'Invalid mobile').required('Mobile is required'),
  alternateMobile: yup.string().matches(/^[0-9+\-\s()]{10,15}$/, { message: 'Invalid mobile', excludeEmptyString: true }).nullable(),
  aadhaarNumber: yup.string().matches(/^[0-9]{12}$/, { message: 'Aadhaar must be 12 digits', excludeEmptyString: true }).nullable(),
  panNumber: yup.string().matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, { message: 'Invalid PAN format', excludeEmptyString: true }).nullable(),
  qualification: yup.string().max(100).nullable(),
  specialization: yup.string().max(100).nullable(),
  experienceYears: yup.number().min(0).nullable().transform((value) => (isNaN(value) ? 0 : value)),
  department: yup.string().max(100).nullable(),
  designation: yup.string().nullable(),
  joiningDate: yup.date().nullable(),
  addressLine1: yup.string().max(200).nullable(),
  addressLine2: yup.string().max(200).nullable(),
  city: yup.string().max(100).nullable(),
  district: yup.string().max(100).nullable(),
  state: yup.string().nullable(),
  postalCode: yup.string().max(20).nullable(),
  status: yup.string().required('Status is required'),
});

const TeacherForm = ({ initialData, onSubmit, isSubmitting, isEditMode = false, onCancel }) => {
  const navigate = useNavigate();
  const [photoFile, setPhotoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      employeeId: '', teacherCode: '', fullName: '', gender: '', dateOfBirth: '', bloodGroup: '',
      email: '', mobile: '', alternateMobile: '', aadhaarNumber: '', panNumber: '',
      qualification: '', specialization: '', experienceYears: 0, department: '', designation: 'Teacher',
      joiningDate: '', addressLine1: '', addressLine2: '', city: '', district: '', state: '', postalCode: '', status: 'Active'
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '',
        joiningDate: initialData.joiningDate ? initialData.joiningDate.split('T')[0] : '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data, photoFile, signatureFile);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Grid container spacing={3}>
        {/* Left Column: Form Fields */}
        <Grid item xs={12} md={8}>
          
          <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
            <Typography variant="h6" gutterBottom color="primary">Basic Information</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller name="employeeId" control={control} render={({ field }) => (
                  <TextField {...field} label="Employee ID *" fullWidth error={!!errors.employeeId} helperText={errors.employeeId?.message} disabled={isEditMode} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="teacherCode" control={control} render={({ field }) => (
                  <TextField {...field} label="Teacher Code *" fullWidth error={!!errors.teacherCode} helperText={errors.teacherCode?.message} disabled={isEditMode} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="fullName" control={control} render={({ field }) => (
                  <TextField {...field} label="Full Name *" fullWidth error={!!errors.fullName} helperText={errors.fullName?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="gender" control={control} render={({ field }) => (
                  <TextField {...field} select label="Gender *" fullWidth error={!!errors.gender} helperText={errors.gender?.message}>
                    {GENDER_OPTIONS.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="dateOfBirth" control={control} render={({ field }) => (
                  <TextField {...field} type="date" label="Date of Birth *" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.dateOfBirth} helperText={errors.dateOfBirth?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="bloodGroup" control={control} render={({ field }) => (
                  <TextField {...field} select label="Blood Group" fullWidth error={!!errors.bloodGroup} helperText={errors.bloodGroup?.message}>
                    <MenuItem value="">None</MenuItem>
                    {BLOOD_GROUP_OPTIONS.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
                  </TextField>
                )} />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
            <Typography variant="h6" gutterBottom color="primary">Professional Information</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller name="designation" control={control} render={({ field }) => (
                  <TextField {...field} select label="Designation" fullWidth error={!!errors.designation} helperText={errors.designation?.message}>
                    {TEACHER_DESIGNATION_OPTIONS.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="department" control={control} render={({ field }) => (
                  <TextField {...field} label="Department" fullWidth error={!!errors.department} helperText={errors.department?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="qualification" control={control} render={({ field }) => (
                  <TextField {...field} label="Highest Qualification" fullWidth error={!!errors.qualification} helperText={errors.qualification?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="specialization" control={control} render={({ field }) => (
                  <TextField {...field} label="Specialization" fullWidth error={!!errors.specialization} helperText={errors.specialization?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="experienceYears" control={control} render={({ field }) => (
                  <TextField {...field} type="number" label="Experience (Years)" fullWidth error={!!errors.experienceYears} helperText={errors.experienceYears?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="joiningDate" control={control} render={({ field }) => (
                  <TextField {...field} type="date" label="Date of Joining" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.joiningDate} helperText={errors.joiningDate?.message} />
                )} />
              </Grid>
               <Grid item xs={12} sm={6}>
                <Controller name="status" control={control} render={({ field }) => (
                  <TextField {...field} select label="Status *" fullWidth error={!!errors.status} helperText={errors.status?.message}>
                    {TEACHER_STATUS_OPTIONS.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
                  </TextField>
                )} />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
            <Typography variant="h6" gutterBottom color="primary">Contact & Identity</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller name="email" control={control} render={({ field }) => (
                  <TextField {...field} label="Email Address *" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} disabled={isEditMode} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="mobile" control={control} render={({ field }) => (
                  <TextField {...field} label="Mobile Number *" fullWidth error={!!errors.mobile} helperText={errors.mobile?.message} />
                )} />
              </Grid>
               <Grid item xs={12} sm={6}>
                <Controller name="alternateMobile" control={control} render={({ field }) => (
                  <TextField {...field} label="Alternate Mobile" fullWidth error={!!errors.alternateMobile} helperText={errors.alternateMobile?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="aadhaarNumber" control={control} render={({ field }) => (
                  <TextField {...field} label="Aadhaar Number" fullWidth error={!!errors.aadhaarNumber} helperText={errors.aadhaarNumber?.message} />
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="panNumber" control={control} render={({ field }) => (
                  <TextField {...field} label="PAN Number" fullWidth error={!!errors.panNumber} helperText={errors.panNumber?.message} />
                )} />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
            <Typography variant="h6" gutterBottom color="primary">Address Information</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller name="addressLine1" control={control} render={({ field }) => <TextField {...field} label="Address Line 1" fullWidth />} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="city" control={control} render={({ field }) => <TextField {...field} label="City" fullWidth />} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="state" control={control} render={({ field }) => (
                  <TextField {...field} select label="State" fullWidth>
                    <MenuItem value="">None</MenuItem>
                    {INDIAN_STATES.map((state) => (<MenuItem key={state} value={state}>{state}</MenuItem>))}
                  </TextField>
                )} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller name="postalCode" control={control} render={({ field }) => <TextField {...field} label="Postal Code" fullWidth />} />
              </Grid>
            </Grid>
          </Paper>

        </Grid>

        {/* Right Column: Files & Actions */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {!isEditMode && (
              <>
                <TeacherPhotoUploader onPhotoUpdate={(file) => setPhotoFile(file)} />
                <TeacherSignatureUploader onSignatureUpdate={(file) => setSignatureFile(file)} />
              </>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant="outlined" color="secondary" fullWidth onClick={onCancel || (() => navigate(-1))} startIcon={<ArrowBackIcon />} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}>
                {isEditMode ? 'Update' : 'Create'} Teacher
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherForm;
