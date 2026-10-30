import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
} from '@mui/material';
import { fetchSessions, selectSessions, selectLoading } from '../features/sessionSlice';
import {
  promoteStudent,
  bulkPromoteStudents,
  promoteClass,
  promoteSchool,
  selectLoading: selectPromotionLoading,
  selectError: selectPromotionError,
} from '../features/promotionSlice';

const PromotionCenter = () => {
  const dispatch = useDispatch();
  const [currentTab, setCurrentTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const sessions = useSelector(selectSessions);
  const loading = useSelector(selectLoading);
  const promotionLoading = useSelector(selectPromotionLoading);
  const promotionError = useSelector(selectPromotionError);

  useEffect(() => {
    dispatch(fetchSessions({ limit: 100 }));
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const TabPanel = ({ children, value, index }) => {
    return (
      <div role="tabpanel" hidden={value !== index}>
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {promotionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {promotionError}
        </Alert>
      )}

      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Promotion Center
      </Typography>

      <Card>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Individual Student" />
          <Tab label="Bulk Students" />
          <Tab label="Entire Class" />
          <Tab label="Entire School" />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Promote Individual Student
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Select a student and promote them to the next class
          </Typography>
          <Button variant="contained">Start Promotion</Button>
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Bulk Promote Students
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Upload or select multiple students for batch promotion
          </Typography>
          <Button variant="contained">Upload Students</Button>
        </TabPanel>

        <TabPanel value={currentTab} index={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Promote Entire Class
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Select a class and promote all students to the next class level
          </Typography>
          <Button variant="contained">Select Class</Button>
        </TabPanel>

        <TabPanel value={currentTab} index={3}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Promote Entire School
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Promote all students across all classes in your school
          </Typography>
          <Button
            variant="contained"
            color="warning"
            onClick={() => setOpenDialog(true)}
            disabled={promotionLoading}
          >
            Start School-Wide Promotion
          </Button>

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>Confirm School-Wide Promotion</DialogTitle>
            <DialogContent>
              <Typography sx={{ my: 2 }}>
                This action will promote all students across all classes. This cannot be undone easily.
              </Typography>
              <Typography color="warning.main" sx={{ fontWeight: 'bold' }}>
                Are you sure you want to proceed?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
              <Button
                variant="contained"
                color="warning"
                onClick={() => {
                  setOpenDialog(false);
                }}
                disabled={promotionLoading}
              >
                {promotionLoading ? <CircularProgress size={24} /> : 'Confirm'}
              </Button>
            </DialogActions>
          </Dialog>
        </TabPanel>
      </Card>
    </Container>
  );
};

export default PromotionCenter;