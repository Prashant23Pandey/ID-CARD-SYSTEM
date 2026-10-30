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
  FileUpload as ImportIcon,
  FileDownload as ExportIcon,
  SwapVert as PromoteIcon,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from '../../../constants';
import {
  useGetStudentsQuery,
  useDeleteStudentMutation,
} from '../../../features/student/studentApi';
import { selectStudentListState, selectSelectedStudentIds } from '../../../features/student/studentSlice';

import StudentFilter from '../../../components/student/StudentFilter';
import StudentTable from '../../../components/student/StudentTable';
import ImportWizard from '../../../components/student/ImportWizard';
import ExportDialog from '../../../components/student/ExportDialog';
import PromotionDialog from '../../../components/student/PromotionDialog';

const StudentList = () => {
  const navigate = useNavigate();
  const listState = useSelector(selectStudentListState);
  const selectedIds = useSelector(selectSelectedStudentIds);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);

  const { data, isLoading, isError, error } = useGetStudentsQuery(listState, {
    refetchOnMountOrArgChange: true,
  });
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (studentToDelete) {
      try {
        await deleteStudent(studentToDelete._id || studentToDelete.id).unwrap();
        setDeleteDialogOpen(false);
        setStudentToDelete(null);
      } catch (err) {
        console.error('Failed to delete student', err);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
            Students
          </Typography>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Link component={RouterLink} color="inherit" to={ROUTES.SCHOOLADMIN_DASHBOARD}>
              Dashboard
            </Link>
            <Typography color="text.primary">Students</Typography>
          </Breadcrumbs>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {selectedIds.length > 0 && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PromoteIcon />}
              onClick={() => setPromoteOpen(true)}
              sx={{ boxShadow: 2 }}
            >
              Promote Selected ({selectedIds.length})
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => setExportOpen(true)}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<ImportIcon />}
            onClick={() => setImportOpen(true)}
          >
            Import
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate(ROUTES.STUDENT_CREATE)}
            sx={{ boxShadow: 2 }}
          >
            Add Student
          </Button>
        </Box>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error?.data?.message || 'Failed to fetch students. Please try again later.'}
        </Alert>
      )}

      <StudentFilter />

      <StudentTable
        data={data?.data}
        totalCount={data?.total}
        isLoading={isLoading}
        onDeleteClick={handleDeleteClick}
      />

      <ImportWizard open={importOpen} onClose={() => setImportOpen(false)} />
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
      <PromotionDialog open={promoteOpen} onClose={() => setPromoteOpen(false)} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle color="error">Delete Student?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{studentToDelete?.studentName}</strong> ({studentToDelete?.admissionNumber})? 
            This action will soft-delete the student record.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentList;
