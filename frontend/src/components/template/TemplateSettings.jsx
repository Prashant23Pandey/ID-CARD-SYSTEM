import { MenuItem, Stack, TextField } from '@mui/material';
import { ORIENTATIONS, TEMPLATE_TYPES } from '../../features/template/templateConstants';

const TemplateSettings = ({ settings, onChange }) => (
  <Stack spacing={1}>
    <TextField size="small" label="Template Type" select value={settings.templateType} onChange={(e) => onChange('templateType', e.target.value)}>
      {TEMPLATE_TYPES.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
    </TextField>
    <TextField size="small" label="Orientation" select value={settings.orientation} onChange={(e) => onChange('orientation', e.target.value)}>
      {ORIENTATIONS.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
    </TextField>
    <TextField size="small" label="Canvas Width" type="number" value={settings.canvasWidth} onChange={(e) => onChange('canvasWidth', Number(e.target.value))} />
    <TextField size="small" label="Canvas Height" type="number" value={settings.canvasHeight} onChange={(e) => onChange('canvasHeight', Number(e.target.value))} />
  </Stack>
);

export default TemplateSettings;
