import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { SwapVert as PromoteIcon } from '@mui/icons-material';
import { usePromoteStudentsMutation } from '../../features/student/studentApi';
import { useSelector, useDispatch } from 'react-redux';
import { selectSelectedStudentIds, setSelectedStudentIds } from '../../features/student/studentSlice';

const PromotionDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const selectedStudentIds = useSelector(selectSelectedStudentIds);
  const [newSessionId, setNewSessionId] = useState('');
  const [newClassId, setNewClassId] = useState('');
  const [error, setError] = useState(null);

  const [promoteStudents, { isLoading }] = usePromoteStudentsMutation();

  const handlePromote = async () => {
    setError(null);
    if (!newSessionId) {
      setError('Target Session ID is required');
      return;
    }

    try {
      await promoteStudents({
        studentIds: selectedStudentIds,
        newSessionId,
        newClassId: newClassId || undefined,
      }).unwrap();
      
      // Clear selections on success
      dispatch(setSelectedStudentIds([]));
      onClose();
    } catch (err) {
      console.error('Promotion failed', err);
      setError(err.data?.message || 'Failed to promote students');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Promote Students</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Alert severity="info">
            You are promoting <strong>{selectedStudentIds.length}</strong> selected student(s).
          </Alert>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Target Session ID (Required)"
            fullWidth
            required
            value={newSessionId}
            onChange={(e) => setNewSessionId(e.target.value)}
            helperText="The MongoID of the academic session to promote into"
          />

          <TextField
            label="Target Class ID (Optional)"
            fullWidth
            value={newClassId}
            onChange={(e) => setNewClassId(e.target.value)}
            helperText="The MongoID of the new class. Leave blank to keep the same class."
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handlePromote}
          disabled={isLoading || selectedStudentIds.length === 0}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <PromoteIcon />}
        >
          Promote
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PromotionDialog;
