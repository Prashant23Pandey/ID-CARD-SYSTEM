import { Box, MenuItem, Stack, TextField, Typography } from '@mui/material';

const PropertiesPanel = ({ selectedObject, onChange }) => {
  if (!selectedObject) {
    return <Typography variant="body2">Select an element to edit properties.</Typography>;
  }

  const apply = (key, parser = (v) => v) => (event) => onChange(key, parser(event.target.value));

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Properties</Typography>
      <Stack spacing={1}>
        {selectedObject.type === 'textbox' && (
          <>
            <TextField size="small" label="Text" defaultValue={selectedObject.text} onBlur={apply('text')} />
            <TextField size="small" label="Font Size" type="number" defaultValue={selectedObject.fontSize || 16} onBlur={apply('fontSize', Number)} />
            <TextField size="small" label="Font Weight" defaultValue={selectedObject.fontWeight || 'normal'} onBlur={apply('fontWeight')} />
            <TextField size="small" label="Color" defaultValue={selectedObject.fill || '#000000'} onBlur={apply('fill')} />
            <TextField select size="small" label="Align" defaultValue={selectedObject.textAlign || 'left'} onChange={apply('textAlign')}>
              <MenuItem value="left">Left</MenuItem>
              <MenuItem value="center">Center</MenuItem>
              <MenuItem value="right">Right</MenuItem>
            </TextField>
          </>
        )}
        <TextField size="small" label="Opacity" type="number" defaultValue={selectedObject.opacity || 1} onBlur={apply('opacity', Number)} />
        <TextField size="small" label="Rotation" type="number" defaultValue={selectedObject.angle || 0} onBlur={apply('angle', Number)} />
        <TextField size="small" label="Width" type="number" defaultValue={Math.round(selectedObject.getScaledWidth?.() || selectedObject.width || 0)} onBlur={apply('width', Number)} />
        <TextField size="small" label="Height" type="number" defaultValue={Math.round(selectedObject.getScaledHeight?.() || selectedObject.height || 0)} onBlur={apply('height', Number)} />
      </Stack>
    </Box>
  );
};

export default PropertiesPanel;
