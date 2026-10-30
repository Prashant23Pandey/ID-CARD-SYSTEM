import { Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText } from '@mui/material';

const VersionHistoryDialog = ({ open, onClose, versions, onRestore }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Version History</DialogTitle>
    <DialogContent>
      <List dense>
        {versions.map((version) => (
          <ListItem key={version._id} secondaryAction={<Button onClick={() => onRestore(version.version)}>Restore</Button>}>
            <ListItemText
              primary={`Version ${version.version}`}
              secondary={`${new Date(version.createdAt).toLocaleString()} - ${version.changeSummary}`}
            />
          </ListItem>
        ))}
      </List>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

export default VersionHistoryDialog;
