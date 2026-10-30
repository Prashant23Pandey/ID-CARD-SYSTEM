import { useState } from 'react';
import { Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchTemplatePreview, selectPreviewState } from '../../features/template/previewSlice';
import PreviewPanel from '../../components/template/PreviewPanel';

const TemplatePreview = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { data } = useSelector(selectPreviewState);
  const [admissionNumber, setAdmissionNumber] = useState('ADM2026-001');
  const [studentName, setStudentName] = useState('Aarav Sharma');

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">Template Live Preview</Typography>
          <Stack direction="row" spacing={2}>
            <TextField value={studentName} onChange={(e) => setStudentName(e.target.value)} label="Student Name" />
            <TextField value={admissionNumber} onChange={(e) => setAdmissionNumber(e.target.value)} label="Admission Number" />
            <Button
              variant="contained"
              onClick={() => dispatch(fetchTemplatePreview({ templateId: id, data: { studentName, admissionNumber } }))}
            >
              Render Preview
            </Button>
          </Stack>
          <PreviewPanel preview={data} />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TemplatePreview;
