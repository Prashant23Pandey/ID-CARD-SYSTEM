import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  MenuItem,
  FormControlLabel,
  Checkbox,
  LinearProgress,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { registerSchema } from '../../utils/validationSchemas';
import { useRegisterMutation } from '../../features/auth/authApi';
import { ROUTES, ROLES } from '../../constants';

// Basic password strength checker for visual feedback
const checkStrength = (pass) => {
  let score = 0;
  if (!pass) return 0;
  if (pass.length >= 8) score += 25;
  if (/[A-Z]/.test(pass)) score += 25;
  if (/[a-z]/.test(pass)) score += 25;
  if (/[0-9!@#$%^&*]/.test(pass)) score += 25;
  return score;
};

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      mobile: '',
      role: ROLES.SCHOOLADMIN,
      schoolId: '', // Note: Should ideally be populated from a backend list of schools if SCHOOLADMIN
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const selectedRole = watch('role');
  const passwordValue = watch('password');
  const passStrength = checkStrength(passwordValue);

  const onSubmit = async (data) => {
    try {
      setApiError('');
      setSuccessMsg('');
      
      const payload = { ...data };
      delete payload.terms;
      delete payload.confirmPassword;
      
      await registerUser(payload).unwrap();
      
      setSuccessMsg('Registration successful! Please check your email to verify your account.');
      setTimeout(() => navigate(ROUTES.LOGIN), 4000);
    } catch (err) {
      setApiError(err?.data?.message || err?.data?.error?.message || 'Registration failed.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
      {apiError && <Alert severity="error" sx={{ mb: 3 }}>{apiError}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Full Name"
          margin="normal"
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField
          fullWidth
          label="Username"
          margin="normal"
          {...register('username')}
          error={!!errors.username}
          helperText={errors.username?.message}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Email Address"
          margin="normal"
          type="email"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          fullWidth
          label="Mobile Number"
          margin="normal"
          {...register('mobile')}
          error={!!errors.mobile}
          helperText={errors.mobile?.message}
        />
      </Box>

      <TextField
        select
        fullWidth
        label="Role"
        margin="normal"
        {...register('role')}
        error={!!errors.role}
        helperText={errors.role?.message}
        defaultValue={ROLES.SCHOOLADMIN}
      >
        <MenuItem value={ROLES.SCHOOLADMIN}>School Administrator</MenuItem>
        <MenuItem value={ROLES.TEACHER}>Teacher</MenuItem>
      </TextField>

      {(selectedRole === ROLES.SCHOOLADMIN || selectedRole === ROLES.TEACHER) && (
        <TextField
          fullWidth
          label="School ID (Temporary Text Input)"
          margin="normal"
          {...register('schoolId')}
          error={!!errors.schoolId}
          helperText={errors.schoolId?.message || "Enter school ID reference"}
        />
      )}

      <TextField
        fullWidth
        label="Password"
        type={showPassword ? 'text' : 'password'}
        margin="normal"
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      {passwordValue && (
        <Box sx={{ mt: 1, mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={passStrength} 
            color={passStrength < 50 ? "error" : passStrength < 100 ? "warning" : "success"}
          />
          <Typography variant="caption" color="text.secondary">
            Password Strength: {passStrength < 50 ? "Weak" : passStrength < 100 ? "Medium" : "Strong"}
          </Typography>
        </Box>
      )}

      <TextField
        fullWidth
        label="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        margin="normal"
        {...register('confirmPassword')}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
      />

      <FormControlLabel
        control={<Checkbox {...register('terms')} color="primary" />}
        label={<Typography variant="body2">I accept the Terms and Conditions</Typography>}
        sx={{ mt: 1, mb: 2 }}
      />
      {errors.terms && <Typography color="error" variant="caption" display="block" sx={{ mb: 2 }}>{errors.terms.message}</Typography>}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ mb: 2, mt: 1 }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
      </Button>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2">
          Already have an account?{' '}
          <Link component={RouterLink} to={ROUTES.LOGIN} underline="hover" fontWeight="bold">
            Log in here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
