import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, TextField, Typography, InputAdornment, IconButton, Alert, CircularProgress, Link } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { resetPasswordSchema } from '../../utils/validationSchemas';
import { useResetPasswordMutation } from '../../features/auth/authApi';
import { ROUTES } from '../../constants';

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const onSubmit = async (data) => {
    if (!token) return;

    try {
      setError('');
      setMessage('');
      await resetPassword({ token, newPassword: data.password }).unwrap();
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate(ROUTES.LOGIN), 3000);
    } catch (err) {
      setError(err?.data?.message || err?.data?.error?.message || 'Password reset failed. Token may be expired.');
    }
  };

  if (!token) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button component={RouterLink} to={ROUTES.LOGIN} variant="contained">
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
        Enter your new password below.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}

      <TextField
        fullWidth
        label="New Password"
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

      <TextField
        fullWidth
        label="Confirm New Password"
        type={showPassword ? 'text' : 'password'}
        margin="normal"
        {...register('confirmPassword')}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading || !!message}
        sx={{ mt: 3, mb: 2 }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
      </Button>
    </Box>
  );
};

export default ResetPassword;
