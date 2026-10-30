import { IconButton, List, ListItem, ListItemText, Stack, Switch, TextField } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const LayersPanel = ({ layers, activeObjectId, onSelect, onRename, onToggleVisibility, onDelete }) => (
  <List dense>
    {layers.map((layer) => (
      <ListItem
        key={layer.id}
        sx={{ bgcolor: activeObjectId === layer.id ? 'action.selected' : 'transparent', borderRadius: 1 }}
        secondaryAction={
          <Stack direction="row" spacing={0.5}>
            <Switch size="small" checked={layer.visible} onChange={() => onToggleVisibility(layer.id)} />
            <IconButton size="small" onClick={() => onDelete(layer.id)}>
              <DeleteOutlineIcon fontSize="inherit" />
            </IconButton>
          </Stack>
        }
      >
        <ListItemText
          primary={
            <TextField
              size="small"
              variant="standard"
              value={layer.name}
              onChange={(e) => onRename(layer.id, e.target.value)}
              onFocus={() => onSelect(layer.id)}
            />
          }
          secondary={layer.type}
          onClick={() => onSelect(layer.id)}
        />
      </ListItem>
    ))}
  </List>
);

export default LayersPanel;
