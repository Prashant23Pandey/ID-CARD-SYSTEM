import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, FormControlLabel, RadioGroup, Radio, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { useExportTeachersMutation } from '../../features/teacher/teacherApi';
import { selectTeacherListState } from '../../features/teacher/teacherSlice';
import { Download as DownloadIcon } from '@mui/icons-material';

const TeacherExportDialog = ({ open, onClose }) => {
  const [exportType, setExportType] = useState('all');
  const [exportTeachers, { isLoading }] = useExportTeachersMutation();
  const listState = useSelector(selectTeacherListState);

  const handleExport = async () => {
    try {
      const params = exportType === 'filtered' ? {
        search: listState.search,
        status: listState.status,
        designation: listState.designation,
        department: listState.department,
      } : {};

      const blob = await exportTeachers(params).unwrap();
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `teachers_export_${exportType}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      onClose();
    } catch (err) {
      alert('Failed to export teachers');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Teachers</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom sx={{ mt: 2 }}>
          Choose what data you want to export to Excel:
        </Typography>
        <RadioGroup value={exportType} onChange={(e) => setExportType(e.target.value)} sx={{ mt: 2 }}>
          <FormControlLabel value="all" control={<Radio />} label="Export All Teachers" />
          <FormControlLabel value="filtered" control={<Radio />} label="Export based on current Filters & Search" />
        </RadioGroup>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
          onClick={handleExport}
          disabled={isLoading}
        >
          Download Excel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeacherExportDialog;
