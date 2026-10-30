import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '../../../constants';
import {
  useGetSchoolsQuery,
  useDeleteSchoolMutation,
} from '../../../features/school/schoolApi';
import { selectSchoolListState } from '../../../features/school/schoolSlice';
import SchoolFilter from '../../../components/school/SchoolFilter';
import SchoolTable from '../../../components/school/SchoolTable';

const SchoolList = () => {
  const navigate = useNavigate();
  const listState = useSelector(selectSchoolListState);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);

  const { data, isLoading, isError, error } = useGetSchoolsQuery(listState, {
    refetchOnMountOrArgChange: true,
  });
  const [deleteSchool, { isLoading: isDeleting }] = useDeleteSchoolMutation();

  const handleDeleteClick = (school) => {
    setSchoolToDelete(school);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (schoolToDelete) {
      try {
        await deleteSchool(schoolToDelete._id || schoolToDelete.id).unwrap();
        setDeleteDialogOpen(false);
        setSchoolToDelete(null);
        // Toast notification would go here in a full app
      } catch (err) {
        console.error('Failed to delete school', err);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
            School Management
          </Typography>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Link component={RouterLink} color="inherit" to={ROUTES.SUPERADMIN_DASHBOARD}>
              Dashboard
            </Link>
            <Typography color="text.primary">Schools</Typography>
          </Breadcrumbs>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate(ROUTES.SCHOOL_CREATE)}
          sx={{ boxShadow: 2 }}
        >
          Add New School
        </Button>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error?.data?.message || 'Failed to fetch schools. Please try again later.'}
        </Alert>
      )}

      <SchoolFilter />

      <SchoolTable
        data={data?.data}
        totalCount={data?.total}
        isLoading={isLoading}
        onDeleteClick={handleDeleteClick}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" color="error">
          Delete School?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete <strong>{schoolToDelete?.schoolName}</strong>? 
            This action will soft-delete the school and suspend all associated non-superadmin users. 
            This action cannot be undone through the UI.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            autoFocus
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchoolList;
