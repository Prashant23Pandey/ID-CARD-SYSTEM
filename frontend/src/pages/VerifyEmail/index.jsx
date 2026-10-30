import { useEffect, useState } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';

import { useVerifyEmailQuery } from '../../features/auth/authApi';
import { ROUTES } from '../../constants';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const { data, error, isLoading } = useVerifyEmailQuery(token, {
    skip: !token, // Don't run query if no token is present
  });

  if (!token) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Missing verification token. Please check the link in your email.
        </Alert>
        <Button component={RouterLink} to={ROUTES.LOGIN} variant="contained">
          Back to Login
        </Button>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Verifying your email...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <ErrorOutline color="error" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h5" color="error" gutterBottom>
          Verification Failed
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {error?.data?.message || error?.data?.error?.message || 'The verification link is invalid or has expired.'}
        </Typography>
        <Button component={RouterLink} to={ROUTES.LOGIN} variant="contained">
          Back to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', textAlign: 'center' }}>
      <CheckCircleOutline color="success" sx={{ fontSize: 64, mb: 2 }} />
      <Typography variant="h5" color="success.main" gutterBottom>
        Email Verified!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Your account has been successfully activated. You can now log in.
      </Typography>
      <Button component={RouterLink} to={ROUTES.LOGIN} variant="contained" size="large">
        Go to Login
      </Button>
    </Box>
  );
};

export default VerifyEmail;
