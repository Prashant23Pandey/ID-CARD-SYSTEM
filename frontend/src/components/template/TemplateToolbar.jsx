import { Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';

const TemplateToolbar = ({ activeSide, onSideChange }) => (
  <Stack direction="row" justifyContent="space-between">
    <ToggleButtonGroup value={activeSide} exclusive onChange={(_, value) => value && onSideChange(value)} size="small">
      <ToggleButton value="front">Front Side</ToggleButton>
      <ToggleButton value="back">Back Side</ToggleButton>
    </ToggleButtonGroup>
  </Stack>
);

export default TemplateToolbar;
