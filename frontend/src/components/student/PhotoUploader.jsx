import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Paper,
  Avatar,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useUploadPhotoMutation } from '../../features/student/studentApi';

const PhotoUploader = ({ studentId, initialPhotoUrl, onPhotoUpdate }) => {
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl || null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [uploadPhoto, { isLoading: isUploading }] = useUploadPhotoMutation();

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      if (studentId) {
        try {
          const formData = new FormData();
          formData.append('photo', file);
          const response = await uploadPhoto({ id: studentId, formData }).unwrap();
          setPhotoUrl(response.data.photoUrl);
          if (onPhotoUpdate) onPhotoUpdate(response.data.photoUrl);
        } catch (error) {
          console.error('Failed to upload photo', error);
          setPreviewUrl(null);
        }
      } else {
        if (onPhotoUpdate) onPhotoUpdate(file);
      }
    },
    [studentId, uploadPhoto, onPhotoUpdate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const currentDisplayUrl = previewUrl || photoUrl;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        borderRadius: 2,
        bgcolor: isDragActive ? 'action.hover' : 'background.paper',
        borderStyle: isDragActive ? 'dashed' : 'solid',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        transition: 'all 0.2s ease',
      }}
    >
      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
        Student Photo
      </Typography>

      <Box sx={{ position: 'relative' }}>
        <Avatar
          src={currentDisplayUrl}
          sx={{
            width: 150,
            height: 150,
            boxShadow: 1,
            bgcolor: 'action.selected',
          }}
        >
          {!currentDisplayUrl && <PhotoCameraIcon sx={{ fontSize: 64, color: 'text.disabled' }} />}
        </Avatar>
        {isUploading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '50%',
            }}
          >
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Box {...getRootProps()}>
          <input {...getInputProps()} />
          <Button
            variant="outlined"
            size="small"
            startIcon={<CloudUploadIcon />}
            disabled={isUploading}
          >
            Upload Photo
          </Button>
        </Box>
      </Box>

      <Typography variant="caption" color="text.secondary" align="center">
        Allowed formats: JPG, PNG, WEBP. Max size: 5MB.
      </Typography>
    </Paper>
  );
};

export default PhotoUploader;
