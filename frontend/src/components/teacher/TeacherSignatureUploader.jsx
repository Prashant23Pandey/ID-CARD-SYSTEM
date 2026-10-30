import { useState, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Paper } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Gesture as SignatureIcon } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useUploadSignatureMutation } from '../../features/teacher/teacherApi';

const TeacherSignatureUploader = ({ teacherId, initialSignatureUrl, onSignatureUpdate }) => {
  const [signatureUrl, setSignatureUrl] = useState(initialSignatureUrl || null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadSignature, { isLoading: isUploading }] = useUploadSignatureMutation();

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    if (teacherId) {
      try {
        const formData = new FormData();
        formData.append('signature', file);
        const response = await uploadSignature({ id: teacherId, formData }).unwrap();
        setSignatureUrl(response.data.signatureUrl);
        if (onSignatureUpdate) onSignatureUpdate(response.data.signatureUrl);
      } catch (error) {
        console.error('Failed to upload signature', error);
        setPreviewUrl(null);
      }
    } else {
      if (onSignatureUpdate) onSignatureUpdate(file);
    }
  }, [teacherId, uploadSignature, onSignatureUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'], 'image/webp': ['.webp'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const currentDisplayUrl = previewUrl || signatureUrl;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, borderRadius: 2,
        bgcolor: isDragActive ? 'action.hover' : 'background.paper',
        borderStyle: isDragActive ? 'dashed' : 'solid', borderColor: isDragActive ? 'primary.main' : 'divider',
        transition: 'all 0.2s ease',
      }}
    >
      <Typography variant="subtitle1" fontWeight="600" gutterBottom>Digital Signature</Typography>
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 300, height: 100, border: '1px solid', borderColor: 'divider', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', overflow: 'hidden' }}>
        {currentDisplayUrl ? (
          <img src={currentDisplayUrl} alt="Signature Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <SignatureIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
        )}
        {isUploading && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255, 255, 255, 0.7)' }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
      <Box {...getRootProps()}>
        <input {...getInputProps()} />
        <Button variant="outlined" size="small" startIcon={<CloudUploadIcon />} disabled={isUploading}>Upload Signature</Button>
      </Box>
      <Typography variant="caption" color="text.secondary" align="center">White background preferred.</Typography>
    </Paper>
  );
};

export default TeacherSignatureUploader;
