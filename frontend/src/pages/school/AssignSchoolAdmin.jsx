import { useState } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
} from '@mui/material';
import { NavigateNext as NavigateNextIcon, Delete as DeleteIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import {
  useGetSchoolByIdQuery,
  useAssignAdminMutation,
  useRemoveAdminMutation,
} from '../../../features/school/schoolApi';

const AssignSchoolAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userIdInput, setUserIdInput] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { data: schoolRes, isLoading: isFetching } = useGetSchoolByIdQuery(id);
  const [assignAdmin, { isLoading: isAssigning }] = useAssignAdminMutation();
  const [removeAdmin, { isLoading: isRemoving }] = useRemoveAdminMutation();

  const school = schoolRes?.data;

  const handleAssign = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!userIdInput) return;

    try {
      await assignAdmin({ id, userId: userIdInput }).unwrap();
      setSuccessMsg('Admin assigned successfully');
      setUserIdInput('');
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to assign admin. Check if User ID is correct and has SCHOOLADMIN role.');
    }
  };

  const handleRemove = async (userId) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await removeAdmin({ id, userId }).unwrap();
      setSuccessMsg('Admin removed successfully');
    } catch (err) {
      setErrorMsg(err.data?.message || 'Failed to remove admin.');
    }
  };

  if (isFetching) return <CircularProgress />;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
          Manage Admins
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
          <Typography color="text.primary">Admins</Typography>
        </Breadcrumbs>
      </Box>

      {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}

      <Paper sx={{ p: 3, mb: 4, maxWidth: 600 }} variant="outlined">
        <Typography variant="h6" gutterBottom>Assign New Admin</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Enter the User ID of a registered user with the SCHOOLADMIN role to assign them to this school.
        </Typography>
        
        <Box component="form" onSubmit={handleAssign} sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="User ID"
            value={userIdInput}
            onChange={(e) => setUserIdInput(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isAssigning || !userIdInput}
            startIcon={<PersonAddIcon />}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Assign
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 600 }} variant="outlined">
        <Typography variant="h6" gutterBottom>Current Admins</Typography>
        <List>
          {school?.admins && school.admins.length > 0 ? (
            school.admins.map((admin, index) => (
              <Box key={admin._id}>
                <ListItem>
                  <ListItemText
                    primary={admin.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {admin.email}
                        </Typography>
                        {" — ID: " + admin._id}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      color="error" 
                      onClick={() => handleRemove(admin._id)}
                      disabled={isRemoving}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < school.admins.length - 1 && <Divider />}
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No admins currently assigned.
            </Typography>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default AssignSchoolAdmin;
