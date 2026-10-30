import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Archive as ArchiveIcon, Power as PowerIcon } from '@mui/icons-material';
import {
  fetchSessionDashboard,
  fetchSessions,
  activateSession,
  selectDashboard,
  selectLoading,
  selectError,
  clearError,
} from '../features/sessionSlice';
import CreateSessionForm from '../components/sessions/CreateSessionForm';

const SessionDashboard = () => {
  const dispatch = useDispatch();
  const dashboard = useSelector(selectDashboard);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  useEffect(() => {
    dispatch(fetchSessionDashboard());
    dispatch(fetchSessions({ limit: 5 }));
  }, [dispatch]);

  const handleActivateSession = async (sessionId) => {
    await dispatch(activateSession(sessionId));
    dispatch(fetchSessionDashboard());
  };

  const handleCloseError = () => {
    dispatch(clearError());
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {error && (
        <Alert severity="error" onClose={handleCloseError} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Session Management Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Create Session
        </Button>
      </Box>

      {dashboard?.activeSession && (
        <Card sx={{ mb: 3, backgroundColor: '#e8f5e9' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Active Session
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              {dashboard.activeSession.name}
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Students
                </Typography>
                <Typography variant="h6">{dashboard.activeSession.studentCount}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Teachers
                </Typography>
                <Typography variant="h6">{dashboard.activeSession.teacherCount}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Classes
                </Typography>
                <Typography variant="h6">{dashboard.activeSession.classCount}</Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Promotion
                </Typography>
                <Chip
                  label={dashboard.activeSession.promotionCompleted ? 'Completed' : 'Pending'}
                  color={dashboard.activeSession.promotionCompleted ? 'success' : 'warning'}
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Sessions
              </Typography>
              <Typography variant="h4">
                {dashboard?.statistics?.totalSessions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Sessions
              </Typography>
              <Typography variant="h4">
                {dashboard?.statistics?.activeSessions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Planned Sessions
              </Typography>
              <Typography variant="h4">
                {dashboard?.statistics?.plannedSessions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Archived Sessions
              </Typography>
              <Typography variant="h4">
                {dashboard?.statistics?.archivedSessions || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Session Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Session</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <CreateSessionForm onSuccess={() => setOpenCreateDialog(false)} />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SessionDashboard;