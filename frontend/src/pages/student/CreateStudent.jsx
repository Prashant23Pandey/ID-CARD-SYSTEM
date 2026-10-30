import { useState } from 'react';
import { Box, Typography, Breadcrumbs, Link, Alert } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { useCreateStudentMutation, useUploadPhotoMutation } from '../../../features/student/studentApi';
import StudentForm from '../../../components/student/StudentForm';

const CreateStudent = () => {
  const navigate = useNavigate();
  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [uploadPhoto] = useUploadPhotoMutation();
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (data, photoFile) => {
    setErrorMsg(null);
    try {
      // 1. Create student record
      const studentRes = await createStudent(data).unwrap();
      const newStudentId = studentRes.data.id || studentRes.data._id;

      // 2. Upload photo if provided
      if (photoFile && newStudentId) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        await uploadPhoto({ id: newStudentId, formData }).unwrap();
      }

      navigate(ROUTES.STUDENTS);
    } catch (err) {
      console.error('Failed to create student:', err);
      setErrorMsg(err.data?.message || 'Failed to create student. Please check the form data.');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
          Add New Student
        </Typography>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link component={RouterLink} color="inherit" to={ROUTES.SCHOOLADMIN_DASHBOARD}>
            Dashboard
          </Link>
          <Link component={RouterLink} color="inherit" to={ROUTES.STUDENTS}>
            Students
          </Link>
          <Typography color="text.primary">Add New</Typography>
        </Breadcrumbs>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <StudentForm onSubmit={handleSubmit} isSubmitting={isCreating} />
    </Box>
  );
};

export default CreateStudent;
