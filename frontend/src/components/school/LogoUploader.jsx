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
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import {
  useUploadLogoMutation,
  useDeleteLogoMutation,
} from '../../features/school/schoolApi';

const LogoUploader = ({ schoolId, initialLogoUrl, onLogoUpdate }) => {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl || null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [uploadLogo, { isLoading: isUploading }] = useUploadLogoMutation();
  const [deleteLogo, { isLoading: isDeleting }] = useDeleteLogoMutation();

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Create a local preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // If schoolId is provided, upload immediately
      if (schoolId) {
        try {
          const formData = new FormData();
          formData.append('logo', file);
          const response = await uploadLogo({ id: schoolId, formData }).unwrap();
          setLogoUrl(response.data.logoUrl);
          if (onLogoUpdate) onLogoUpdate(response.data.logoUrl);
        } catch (error) {
          console.error('Failed to upload logo', error);
          setPreviewUrl(null); // Revert preview on failure
        }
      } else {
        // If no schoolId (e.g., during create form), just pass the file up
        if (onLogoUpdate) onLogoUpdate(file);
      }
    },
    [schoolId, uploadLogo, onLogoUpdate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  const handleDelete = async () => {
    if (schoolId && logoUrl) {
      try {
        await deleteLogo(schoolId).unwrap();
        setLogoUrl(null);
        setPreviewUrl(null);
        if (onLogoUpdate) onLogoUpdate(null);
      } catch (error) {
        console.error('Failed to delete logo', error);
      }
    } else {
      setLogoUrl(null);
      setPreviewUrl(null);
      if (onLogoUpdate) onLogoUpdate(null);
    }
  };

  const currentDisplayUrl = previewUrl || logoUrl;

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
        School Logo
      </Typography>

      <Box sx={{ position: 'relative' }}>
        <Avatar
          src={currentDisplayUrl}
          variant="rounded"
          sx={{
            width: 120,
            height: 120,
            boxShadow: 1,
            bgcolor: 'action.selected',
          }}
        >
          {!currentDisplayUrl && <PhotoCameraIcon sx={{ fontSize: 48, color: 'text.disabled' }} />}
        </Avatar>
        {(isUploading || isDeleting) && (
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
              borderRadius: 1,
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
            disabled={isUploading || isDeleting}
          >
            Upload Logo
          </Button>
        </Box>
        {currentDisplayUrl && (
          <IconButton
            size="small"
            color="error"
            onClick={handleDelete}
            disabled={isUploading || isDeleting}
          >
            <DeleteIcon />
          </IconButton>
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" align="center">
        Allowed formats: JPG, PNG, WEBP. Max size: 5MB.
      </Typography>
    </Paper>
  );
};

export default LogoUploader;
