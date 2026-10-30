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
  SCHOOL_TYPES,
  BOARD_TYPES,
  SUBSCRIPTION_PLANS,
  INDIAN_STATES,
} from '../../constants';
import LogoUploader from './LogoUploader';

// Validation Schema
const schema = yup.object({
  schoolName: yup.string().required('School Name is required').max(200),
  schoolShortName: yup.string().max(50, 'Cannot exceed 50 characters'),
  boardType: yup.string().required('Board Type is required'),
  schoolType: yup.string().required('School Type is required'),
  registrationNumber: yup.string().max(50),
  principalName: yup.string().max(100),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup
    .string()
    .matches(/^[0-9+\-\s()]{10,15}$/, 'Invalid phone number')
    .required('Phone is required'),
  alternatePhone: yup
    .string()
    .matches(/^[0-9+\-\s()]{0,15}$/, 'Invalid phone number')
    .nullable(),
  website: yup.string().url('Invalid URL format').nullable(),
  addressLine1: yup.string().required('Address Line 1 is required').max(200),
  addressLine2: yup.string().max(200),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  postalCode: yup
    .string()
    .matches(/^[0-9]{5,10}$/, 'Invalid postal code')
    .required('Postal Code is required'),
  establishedYear: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(1800, 'Must be after 1800')
    .max(new Date().getFullYear(), 'Cannot be in the future')
    .nullable(),
  studentCapacity: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0)
    .nullable(),
  subscriptionPlan: yup.string().required('Subscription Plan is required'),
});

const SchoolForm = ({
  initialData,
  onSubmit,
  isSubmitting,
  isEditMode = false,
  onCancel,
}) => {
  const navigate = useNavigate();
  const [logoFile, setLogoFile] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      schoolName: '',
      schoolShortName: '',
      boardType: '',
      schoolType: '',
      registrationNumber: '',
      principalName: '',
      email: '',
      phone: '',
      alternatePhone: '',
      website: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      establishedYear: '',
      studentCapacity: '',
      subscriptionPlan: 'Free',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        establishedYear: initialData.establishedYear || '',
        studentCapacity: initialData.capacity?.studentCapacity || initialData.studentCapacity || '',
        addressLine1: initialData.address?.line1 || initialData.addressLine1 || '',
        addressLine2: initialData.address?.line2 || initialData.addressLine2 || '',
        city: initialData.address?.city || initialData.city || '',
        state: initialData.address?.state || initialData.state || '',
        postalCode: initialData.address?.postalCode || initialData.postalCode || '',
        subscriptionPlan: initialData.subscription?.plan || initialData.subscriptionPlan || 'Free',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data, logoFile);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Grid container spacing={3}>
        {/* Left Column: Form Fields */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
            <Typography variant="h6" gutterBottom color="primary">
              Basic Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <Controller
                  name="schoolName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="School Name *"
                      fullWidth
                      error={!!errors.schoolName}
                      helperText={errors.schoolName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Controller
                  name="schoolShortName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Short Name"
                      fullWidth
                      error={!!errors.schoolShortName}
                      helperText={errors.schoolShortName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="boardType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Board Type *"
                      fullWidth
                      error={!!errors.boardType}
                      helperText={errors.boardType?.message}
                    >
                      {BOARD_TYPES.map((option) => (
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
                  name="schoolType"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="School Type *"
                      fullWidth
                      error={!!errors.schoolType}
                      helperText={errors.schoolType?.message}
                    >
                      {SCHOOL_TYPES.map((option) => (
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
                  name="registrationNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Registration Number"
                      fullWidth
                      error={!!errors.registrationNumber}
                      helperText={errors.registrationNumber?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="establishedYear"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Established Year"
                      type="number"
                      fullWidth
                      error={!!errors.establishedYear}
                      helperText={errors.establishedYear?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
            <Typography variant="h6" gutterBottom color="primary">
              Contact Details
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email Address *"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Phone Number *"
                      fullWidth
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="alternatePhone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Alternate Phone"
                      fullWidth
                      error={!!errors.alternatePhone}
                      helperText={errors.alternatePhone?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="website"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Website URL"
                      fullWidth
                      error={!!errors.website}
                      helperText={errors.website?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="principalName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Principal Name"
                      fullWidth
                      error={!!errors.principalName}
                      helperText={errors.principalName?.message}
                    />
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
                <Controller
                  name="addressLine1"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Address Line 1 *"
                      fullWidth
                      error={!!errors.addressLine1}
                      helperText={errors.addressLine1?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="addressLine2"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Address Line 2"
                      fullWidth
                      error={!!errors.addressLine2}
                      helperText={errors.addressLine2?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="City *"
                      fullWidth
                      error={!!errors.city}
                      helperText={errors.city?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="State *"
                      fullWidth
                      error={!!errors.state}
                      helperText={errors.state?.message}
                    >
                      {INDIAN_STATES.map((state) => (
                        <MenuItem key={state} value={state}>
                          {state}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="postalCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Postal Code *"
                      fullWidth
                      error={!!errors.postalCode}
                      helperText={errors.postalCode?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right Column: Logo & Settings */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {!isEditMode && (
              <LogoUploader
                onLogoUpdate={(file) => setLogoFile(file)}
              />
            )}
            
            <Paper sx={{ p: 3 }} variant="outlined">
              <Typography variant="h6" gutterBottom color="primary">
                Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="subscriptionPlan"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Subscription Plan *"
                        fullWidth
                        error={!!errors.subscriptionPlan}
                        helperText={errors.subscriptionPlan?.message}
                        disabled={isEditMode} // Usually managed via a separate settings page
                      >
                        {SUBSCRIPTION_PLANS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="studentCapacity"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Student Capacity"
                        type="number"
                        fullWidth
                        error={!!errors.studentCapacity}
                        helperText={errors.studentCapacity?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>

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
                {isEditMode ? 'Update' : 'Create'} School
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SchoolForm;
