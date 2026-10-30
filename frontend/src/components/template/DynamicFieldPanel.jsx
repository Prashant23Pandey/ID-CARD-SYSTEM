import { Box, Chip, Stack, Typography } from '@mui/material';
import { DYNAMIC_FIELDS } from '../../features/template/templateConstants';

const DynamicFieldPanel = ({ onInsertField }) => (
  <Box>
    <Typography variant="subtitle2" sx={{ mb: 1 }}>Dynamic Fields</Typography>
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
      {DYNAMIC_FIELDS.map((field) => (
        <Chip key={field} label={`{{${field}}}`} size="small" onClick={() => onInsertField(`{{${field}}}`)} />
      ))}
    </Stack>
  </Box>
);

export default DynamicFieldPanel;
