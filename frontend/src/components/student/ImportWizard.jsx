import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
  TextField
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import * as xlsx from 'xlsx';
import { useImportStudentsMutation } from '../../features/student/studentApi';
import { Download as DownloadIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const steps = ['Upload Excel', 'Preview Data', 'Import'];

const ImportWizard = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [sessionId, setSessionId] = useState(''); // Target session
  const [importResult, setImportResult] = useState(null);
  
  const [importStudents, { isLoading }] = useImportStudentsMutation();

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const resetWizard = () => {
    setActiveStep(0);
    setFile(null);
    setPreviewData([]);
    setImportResult(null);
    setSessionId('');
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = xlsx.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const json = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        setPreviewData(json);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
  });

  const downloadTemplate = () => {
    const ws = xlsx.utils.json_to_sheet([
      {
        'Admission Number': 'ADM001',
        'Student Name': 'John Doe',
        'Gender': 'Male',
        'DOB': '2010-01-01',
        'Blood Group': 'O+',
        'Mobile': '9876543210',
        'Father Name': 'Richard Doe',
        'Mother Name': 'Jane Doe'
      }
    ]);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Template');
    xlsx.writeFile(wb, 'Student_Import_Template.xlsx');
  };

  const handleImport = async () => {
    if (!file || !sessionId) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', sessionId);
      
      const res = await importStudents(formData).unwrap();
      setImportResult(res.data);
      handleNext();
    } catch (err) {
      console.error('Import failed', err);
      // In a real app, handle error display in the UI appropriately
      alert(err.data?.message || 'Import failed');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Bulk Import Students</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ my: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 4, minHeight: 250 }}>
          {/* STEP 0: Upload */}
          {activeStep === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="body1">
                  Upload an Excel file containing student data. Ensure the columns match the required template format.
                </Typography>
                <Button startIcon={<DownloadIcon />} variant="outlined" size="small" onClick={downloadTemplate}>
                  Download Template
                </Button>
              </Box>

              <TextField
                fullWidth
                label="Target Session ID (Required for DB binding)"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                sx={{ mb: 3 }}
                required
              />

              <Paper
                {...getRootProps()}
                sx={{
                  p: 5,
                  textAlign: 'center',
                  bgcolor: isDragActive ? 'action.hover' : 'background.default',
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'divider',
                  cursor: 'pointer'
                }}
              >
                <input {...getInputProps()} />
                <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6">
                  {file ? file.name : 'Drag & drop an Excel file here, or click to select'}
                </Typography>
              </Paper>
            </Box>
          )}

          {/* STEP 1: Preview */}
          {activeStep === 1 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Found {previewData.length} records. Please review the first 5 records below:
              </Typography>
              <Paper variant="outlined" sx={{ overflowX: 'auto', p: 2 }}>
                <pre style={{ fontSize: '0.85rem' }}>
                  {JSON.stringify(previewData.slice(0, 5), null, 2)}
                </pre>
              </Paper>
            </Box>
          )}

          {/* STEP 2: Results */}
          {activeStep === 2 && importResult && (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Import completed successfully!
              </Alert>
              <Typography><strong>Total Processed:</strong> {importResult.totalProcessed}</Typography>
              <Typography><strong>Success:</strong> {importResult.successCount}</Typography>
              <Typography color="error"><strong>Errors:</strong> {importResult.errorCount}</Typography>
              
              {importResult.errors?.length > 0 && (
                <Paper variant="outlined" sx={{ mt: 2, p: 2, maxHeight: 200, overflow: 'auto' }}>
                  <Typography variant="subtitle2" color="error">Error Details:</Typography>
                  {importResult.errors.map((e, idx) => (
                    <Typography key={idx} variant="caption" display="block">
                      Row: {JSON.stringify(e.row['Admission Number'])} - {e.error}
                    </Typography>
                  ))}
                </Paper>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={isLoading}>
          {activeStep === 2 ? 'Close' : 'Cancel'}
        </Button>
        {activeStep === 0 && (
          <Button variant="contained" onClick={handleNext} disabled={!file || !sessionId}>
            Next
          </Button>
        )}
        {activeStep === 1 && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleBack} disabled={isLoading}>Back</Button>
            <Button variant="contained" onClick={handleImport} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : 'Start Import'}
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportWizard;
