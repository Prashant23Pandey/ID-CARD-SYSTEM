import { Box, Card, CardContent, Typography } from '@mui/material';

const PreviewPanel = ({ preview }) => (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Live Preview JSON</Typography>
      <Box component="pre" sx={{ m: 0, maxHeight: 280, overflow: 'auto', fontSize: 12 }}>
        {JSON.stringify(preview || {}, null, 2)}
      </Box>
    </CardContent>
  </Card>
);

export default PreviewPanel;
