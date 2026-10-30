import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, TextField, Typography, Link, Alert, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

import { forgotPasswordSchema } from '../../utils/validationSchemas';
import { useForgotPasswordMutation } from '../../features/auth/authApi';
import { ROUTES } from '../../constants';

const ForgotPassword = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      setMessage('');
      await forgotPassword(data).unwrap();
      setMessage('If an account matches that email, a password reset link has been sent.');
    } catch (err) {
      setError(err?.data?.message || err?.data?.error?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%', textAlign: 'center' }}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Enter your email address and we'll send you a link to reset your password.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}

      <TextField
        fullWidth
        label="Email Address"
        margin="normal"
        type="email"
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
        sx={{ mb: 3 }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ mb: 3 }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
      </Button>

      <Button
        component={RouterLink}
        to={ROUTES.LOGIN}
        startIcon={<ArrowBack />}
        fullWidth
        color="inherit"
      >
        Back to Login
      </Button>
    </Box>
  );
};

export default ForgotPassword;
