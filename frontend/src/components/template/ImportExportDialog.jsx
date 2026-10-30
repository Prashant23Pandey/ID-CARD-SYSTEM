import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { useState } from 'react';

const ImportExportDialog = ({ open, onClose, onImport, onExport }) => {
  const [payload, setPayload] = useState('');
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Import / Export Template</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            multiline
            minRows={12}
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder="Paste template JSON for import"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onExport()}>Export Current</Button>
        <Button onClick={() => onImport(payload)} variant="contained">Import</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportExportDialog;
