import { useState } from 'react';
import { Box, Typography, Button, Paper, Alert, Snackbar } from '@mui/material';
import { Add as AddIcon, Upload as UploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetTeachersQuery, useDeleteTeacherMutation } from '../../features/teacher/teacherApi';
import { selectTeacherListState, selectSelectedTeacherIds } from '../../features/teacher/teacherSlice';
import TeacherTable from '../../components/teacher/TeacherTable';
import TeacherFilter from '../../components/teacher/TeacherFilter';
import TeacherImportWizard from '../../components/teacher/ImportWizard';
import TeacherExportDialog from '../../components/teacher/ExportDialog';
import ClassAssignmentDialog from '../../components/teacher/ClassAssignmentDialog';
import { ROUTES } from '../../constants';

const TeacherList = () => {
  const navigate = useNavigate();
  const listState = useSelector(selectTeacherListState);
  const selectedIds = useSelector(selectSelectedTeacherIds);
  
  const { data, isLoading, error } = useGetTeachersQuery(listState);
  const [deleteTeacher] = useDeleteTeacherMutation();

  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState(null);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleDelete = async (teacher) => {
    if (window.confirm(`Are you sure you want to delete ${teacher.fullName}?`)) {
      try {
        await deleteTeacher(teacher._id || teacher.id).unwrap();
        setSnackbar({ open: true, message: 'Teacher deleted successfully', severity: 'success' });
      } catch (err) {
        setSnackbar({ open: true, message: err.data?.message || 'Failed to delete teacher', severity: 'error' });
      }
    }
  };

  const handleAssignClick = (teacher) => {
    setSelectedTeacherForAssign(teacher);
    setAssignmentOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="600" color="primary.main">
          Teacher Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<UploadIcon />} onClick={() => setImportOpen(true)}>Import</Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => setExportOpen(true)}>Export</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(ROUTES.TEACHER_CREATE)}>
            Add Teacher
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.data?.message || 'Failed to load teachers'}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }} elevation={0} variant="outlined">
        <TeacherFilter />
      </Paper>

      <Box sx={{ width: '100%' }}>
        <TeacherTable 
          data={data?.data} 
          totalCount={data?.total} 
          isLoading={isLoading} 
          onDeleteClick={handleDelete}
          onAssignClick={handleAssignClick}
        />
      </Box>

      <TeacherImportWizard open={importOpen} onClose={() => setImportOpen(false)} />
      <TeacherExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
      {selectedTeacherForAssign && (
        <ClassAssignmentDialog 
          open={assignmentOpen} 
          onClose={() => { setAssignmentOpen(false); setSelectedTeacherForAssign(null); }} 
          teacher={selectedTeacherForAssign} 
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherList;
