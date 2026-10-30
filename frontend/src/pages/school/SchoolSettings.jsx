import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  Paper,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';
import { NavigateNext as NavigateNextIcon, Save as SaveIcon } from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { ROUTES, STATUS_OPTIONS } from '../../../constants';
import {
  useGetSchoolByIdQuery,
  useUpdateSchoolStatusMutation,
} from '../../../features/school/schoolApi';

const SchoolSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: schoolRes, isLoading: isFetching } = useGetSchoolByIdQuery(id);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateSchoolStatusMutation();
  
  const [status, setStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const school = schoolRes?.data;

  useEffect(() => {
    if (school) {
      setStatus(school.status);
    }
  }, [school]);

  const handleUpdateStatus = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (status === school?.status) return;

    try {
      await updateStatus({ id, status }).unwrap();
      setSuccessMsg('School status updated successfully. Users associated with this school have been updated accordingly.');
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to update status.');
    }
  };

  if (isFetching) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
          School Settings
        </Typography>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link component={RouterLink} color="inherit" to={ROUTES.SUPERADMIN_DASHBOARD}>
            Dashboard
          </Link>
          <Link component={RouterLink} color="inherit" to={ROUTES.SCHOOLS}>
            Schools
          </Link>
          <Link component={RouterLink} color="inherit" to={ROUTES.SCHOOL_DETAILS.replace(':id', id)}>
            {school?.schoolName || 'School'}
          </Link>
          <Typography color="text.primary">Settings</Typography>
        </Breadcrumbs>
      </Box>

      {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}

      <Paper sx={{ p: 3, maxWidth: 600 }} variant="outlined">
        <Typography variant="h6" gutterBottom>Status Management</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Changing a school to 'Suspended' will immediately suspend all teacher and school admin accounts associated with this school. Changing it back to 'Active' will restore their access.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            select
            fullWidth
            size="small"
            label="School Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={school?.status === 'Deleted'} // Cannot restore from deleted via status dropdown usually, need dedicated restore endpoint if supported
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            color={status === 'Suspended' ? 'warning' : 'primary'}
            disabled={isUpdating || status === school?.status || school?.status === 'Deleted'}
            onClick={handleUpdateStatus}
            startIcon={<SaveIcon />}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Update Status
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SchoolSettings;
