import { useState } from 'react';
import { Box, Typography, Breadcrumbs, Link, Alert } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { useCreateSchoolMutation } from '../../../features/school/schoolApi';
import SchoolForm from '../../../components/school/SchoolForm';

const CreateSchool = () => {
  const navigate = useNavigate();
  const [createSchool, { isLoading }] = useCreateSchoolMutation();
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (data, logoFile) => {
    setErrorMsg(null);
    try {
      // If there's a logo file, we must use FormData
      let payload = data;
      if (logoFile) {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          if (data[key] !== undefined && data[key] !== null) {
            formData.append(key, data[key]);
          }
        });
        formData.append('logo', logoFile);
        payload = formData;
      }

      await createSchool(payload).unwrap();
      navigate(ROUTES.SCHOOLS);
    } catch (err) {
      console.error('Failed to create school:', err);
      setErrorMsg(err.data?.message || 'Failed to create school. Please check the form data.');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
          Add New School
        </Typography>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link component={RouterLink} color="inherit" to={ROUTES.SUPERADMIN_DASHBOARD}>
            Dashboard
          </Link>
          <Link component={RouterLink} color="inherit" to={ROUTES.SCHOOLS}>
            Schools
          </Link>
          <Typography color="text.primary">Add New</Typography>
        </Breadcrumbs>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <SchoolForm onSubmit={handleSubmit} isSubmitting={isLoading} />
    </Box>
  );
};

export default CreateSchool;
