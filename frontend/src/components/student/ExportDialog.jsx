import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { useExportStudentsMutation } from '../../features/student/studentApi';
import { useSelector } from 'react-redux';
import { selectStudentListState } from '../../features/student/studentSlice';

const ExportDialog = ({ open, onClose }) => {
  const listState = useSelector(selectStudentListState);
  const [exportStudents, { isLoading }] = useExportStudentsMutation();

  const handleExport = async () => {
    try {
      const response = await exportStudents(listState).unwrap();
      
      // Create a blob URL and trigger download
      const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      onClose();
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to generate export file.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Students</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            You are about to export students based on your current filters.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current active filters will be applied to the export file. Pagination is ignored (all matching records will be exported).
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
        >
          Download Excel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
