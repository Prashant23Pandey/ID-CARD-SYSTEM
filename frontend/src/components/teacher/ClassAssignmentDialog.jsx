import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, TextField, CircularProgress, Alert } from '@mui/material';
import { AssignmentInd as AssignIcon, RemoveCircleOutline as RemoveIcon } from '@mui/icons-material';
import { useAssignClassMutation, useRemoveClassMutation } from '../../features/teacher/teacherApi';

const ClassAssignmentDialog = ({ open, onClose, teacher }) => {
  const [classId, setClassId] = useState('');
  const [error, setError] = useState(null);

  const [assignClass, { isLoading: isAssigning }] = useAssignClassMutation();
  const [removeClass, { isLoading: isRemoving }] = useRemoveClassMutation();

  const handleAssign = async () => {
    setError(null);
    if (!classId) {
      setError('Target Class ID is required');
      return;
    }
    try {
      await assignClass({ id: teacher._id || teacher.id, classId }).unwrap();
      onClose();
    } catch (err) {
      setError(err.data?.message || 'Failed to assign class');
    }
  };

  const handleRemove = async () => {
    setError(null);
    try {
      await removeClass(teacher._id || teacher.id).unwrap();
      onClose();
    } catch (err) {
      setError(err.data?.message || 'Failed to remove class');
    }
  };

  const hasCurrentAssignment = !!teacher?.classId;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Class Teacher</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="body1">
            Manage class assignment for <strong>{teacher?.fullName}</strong> ({teacher?.employeeId}).
          </Typography>

          {hasCurrentAssignment && (
            <Alert severity="info" action={
              <Button color="error" size="small" onClick={handleRemove} disabled={isRemoving} startIcon={<RemoveIcon />}>
                Remove
              </Button>
            }>
              Currently assigned to: <strong>{teacher.classId.className} {teacher.classId.sectionName || ''}</strong>
            </Alert>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Target Class ID (Required)"
            fullWidth
            required
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            helperText="The MongoID of the class to assign this teacher to."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isAssigning || isRemoving}>Cancel</Button>
        <Button
          variant="contained" onClick={handleAssign} disabled={isAssigning || isRemoving || !classId}
          startIcon={isAssigning ? <CircularProgress size={20} color="inherit" /> : <AssignIcon />}
        >
          Assign Class
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClassAssignmentDialog;
