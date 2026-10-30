import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES, ROLES } from '../constants';
import { Box, Container, Paper, Typography } from '@mui/material';

const AuthLayout = () => {
  const { isAuthenticated, role } = useAuth();

  // Redirect authenticated users away from auth pages
  if (isAuthenticated) {
    if (role === ROLES.SUPERADMIN) return <Navigate to={ROUTES.SUPERADMIN_DASHBOARD} replace />;
    if (role === ROLES.SCHOOLADMIN) return <Navigate to={ROUTES.SCHOOLADMIN_DASHBOARD} replace />;
    if (role === ROLES.TEACHER) return <Navigate to={ROUTES.TEACHER_DASHBOARD} replace />;
    return <Navigate to="/" replace />; // Fallback
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        padding: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            padding: { xs: 3, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
              ID Card System
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Multischool Management Platform
            </Typography>
          </Box>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
