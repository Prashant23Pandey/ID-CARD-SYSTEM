import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  FormControl, InputLabel, Select, MenuItem, Typography, Box,
  CircularProgress, Alert,
} from '@mui/material';
import { useGetClassesQuery } from '../../features/class/classApi';

const TeacherAssignmentDialog = ({ open, onClose, teachers, onAssign, classData, isAssigning }) => {
  const [selectedTeacher, setSelectedTeacher] = useState('');

  const handleAssign = () => {
    if (selectedTeacher) {
      onAssign(selectedTeacher);
      setSelectedTeacher('');
    }
  };

  const handleClose = () => {
    setSelectedTeacher('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Assign Class Teacher
      </DialogTitle>
      <DialogContent>
        {classData && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Assigning teacher to:
            </Typography>
            <Typography fontWeight={600}>{classData.className} ({classData.classCode})</Typography>
          </Box>
        )}

        {classData?.classTeacherId && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Currently assigned to: <strong>{classData.classTeacherId.name || 'A teacher'}</strong>.
            This will replace the current assignment.
          </Alert>
        )}

        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel>Select Teacher</InputLabel>
          <Select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            label="Select Teacher"
          >
            {(teachers || []).map((teacher) => (
              <MenuItem key={teacher._id} value={teacher._id}>
                {teacher.fullName || teacher.name} — {teacher.employeeId || ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isAssigning}>Cancel</Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={!selectedTeacher || isAssigning}
          startIcon={isAssigning ? <CircularProgress size={18} /> : null}
        >
          {isAssigning ? 'Assigning...' : 'Assign Teacher'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeacherAssignmentDialog;
