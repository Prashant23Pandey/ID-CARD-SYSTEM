import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGoogleLogin } from '@react-oauth/google';
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
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, Google as GoogleIcon } from '@mui/icons-material';

import { loginSchema } from '../../utils/validationSchemas';
import { useLoginMutation, useGoogleLoginMutation } from '../../features/auth/authApi';
import { setCredentials } from '../../features/auth/authSlice';
import { ROUTES } from '../../constants';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [login, { isLoading }] = useLoginMutation();
  const [googleLoginAPI, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const handleRedirect = (role) => {
    navigate(`/${role.toLowerCase()}/dashboard`, { replace: true });
  };

  const onSubmit = async (data) => {
    try {
      setAuthError('');
      const response = await login(data).unwrap();
      dispatch(setCredentials({ user: response.data.user, accessToken: response.data.accessToken }));
      handleRedirect(response.data.user.role);
    } catch (err) {
      setAuthError(err?.data?.message || err?.data?.error?.message || 'Login failed. Please try again.');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setAuthError('');
        const response = await googleLoginAPI({ access_token: tokenResponse.access_token }).unwrap();
        dispatch(setCredentials({ user: response.data.user, accessToken: response.data.accessToken }));
        handleRedirect(response.data.user.role);
      } catch (err) {
        setAuthError(err?.data?.message || 'Google Login failed.');
      }
    },
    onError: () => setAuthError('Google Login failed. Please try again.'),
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
      {authError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {authError}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Email or Username"
        margin="normal"
        {...register('identifier')}
        error={!!errors.identifier}
        helperText={errors.identifier?.message}
      />

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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 3 }}>
        <Link component={RouterLink} to={ROUTES.FORGOT_PASSWORD} variant="body2" underline="hover">
          Forgot password?
        </Link>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading || isGoogleLoading}
        sx={{ mb: 2 }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
      </Button>

      <Divider sx={{ my: 3 }}>OR</Divider>

      <Button
        fullWidth
        variant="outlined"
        size="large"
        onClick={() => googleLogin()}
        disabled={isLoading || isGoogleLoading}
        startIcon={<GoogleIcon />}
      >
        Continue with Google
      </Button>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2">
          Don't have an account?{' '}
          <Link component={RouterLink} to={ROUTES.REGISTER} underline="hover" fontWeight="bold">
            Register here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
