import { Card, CardContent, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchTemplateById, selectTemplateState } from '../../features/template/templateSlice';

const TemplateDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedTemplate } = useSelector(selectTemplateState);

  useEffect(() => {
    dispatch(fetchTemplateById(id));
  }, [dispatch, id]);

  if (!selectedTemplate) return null;
  return (
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h5">{selectedTemplate.templateName}</Typography>
          <Typography>Code: {selectedTemplate.templateCode}</Typography>
          <Typography>Type: {selectedTemplate.templateType}</Typography>
          <Typography>Status: {selectedTemplate.status}</Typography>
          <Typography>Version: {selectedTemplate.version}</Typography>
          <Typography>Orientation: {selectedTemplate.orientation}</Typography>
          <Typography>Canvas: {selectedTemplate.canvasWidth}x{selectedTemplate.canvasHeight}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TemplateDetails;
