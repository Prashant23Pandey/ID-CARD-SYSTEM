import { useState } from 'react';
import { Box, Typography, Breadcrumbs, Link, Alert, CircularProgress, Paper } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { useGetSchoolByIdQuery, useUpdateSchoolMutation } from '../../../features/school/schoolApi';
import SchoolForm from '../../../components/school/SchoolForm';

const EditSchool = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: schoolRes, isLoading: isFetching, isError: isFetchError } = useGetSchoolByIdQuery(id);
  const [updateSchool, { isLoading: isUpdating }] = useUpdateSchoolMutation();
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (data, logoFile) => {
    setErrorMsg(null);
    try {
      let payload = { id, ...data };
      if (logoFile) {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          if (data[key] !== undefined && data[key] !== null) {
            formData.append(key, data[key]);
          }
        });
        formData.append('logo', logoFile);
        
        // RTK Query mutation signature for file upload updates might differ slightly based on our API design.
        // We handle simple data update here. If logo is included, we might need a separate endpoint or mixed endpoint.
        // In our current API design, PUT /schools/:id accepts logo. 
        payload = { id, formData }; 
        // Need to ensure the schoolApi update mutation knows how to handle formData.
        // Currently it just spreads data. Let's adjust to pass standard data, and rely on LogoUploader for direct logo updates.
        // Actually, our LogoUploader already handles immediate upload if schoolId is passed! 
        // So we don't need to append logo here if it was already handled by the LogoUploader.
      }

      await updateSchool({ id, ...data }).unwrap();
      navigate(ROUTES.SCHOOL_DETAILS.replace(':id', id));
    } catch (err) {
      console.error('Failed to update school:', err);
      setErrorMsg(err.data?.message || 'Failed to update school. Please check the form data.');
    }
  };

  if (isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isFetchError || !schoolRes?.data) {
    return (
      <Alert severity="error">
        Failed to load school details. It may have been deleted or you don't have access.
      </Alert>
    );
  }

  const school = schoolRes.data;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
          Edit School
        </Typography>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link component={RouterLink} color="inherit" to={ROUTES.SUPERADMIN_DASHBOARD}>
            Dashboard
          </Link>
          <Link component={RouterLink} color="inherit" to={ROUTES.SCHOOLS}>
            Schools
          </Link>
          <Link component={RouterLink} color="inherit" to={ROUTES.SCHOOL_DETAILS.replace(':id', id)}>
            {school.schoolName}
          </Link>
          <Typography color="text.primary">Edit</Typography>
        </Breadcrumbs>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <SchoolForm 
        initialData={school} 
        onSubmit={handleSubmit} 
        isSubmitting={isUpdating} 
        isEditMode={true} 
      />
    </Box>
  );
};

export default EditSchool;
