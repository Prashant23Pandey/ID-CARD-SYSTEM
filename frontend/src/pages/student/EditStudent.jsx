import { useState } from 'react';
import { Box, Typography, Breadcrumbs, Link, Alert, CircularProgress } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { useGetStudentByIdQuery, useUpdateStudentMutation } from '../../../features/student/studentApi';
import StudentForm from '../../../components/student/StudentForm';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: studentRes, isLoading: isFetching, isError: isFetchError } = useGetStudentByIdQuery(id);
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (data) => {
    setErrorMsg(null);
    try {
      await updateStudent({ id, ...data }).unwrap();
      navigate(ROUTES.STUDENT_PROFILE.replace(':id', id));
    } catch (err) {
      console.error('Failed to update student:', err);
      setErrorMsg(err.data?.message || 'Failed to update student. Please check the form data.');
    }
  };

  if (isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isFetchError || !studentRes?.data) {
    return (
      <Alert severity="error">
        Failed to load student details. It may have been deleted or you don't have access.
      </Alert>
    );
  }

  const student = studentRes.data;

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
          Edit Student
        </Typography>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link component={RouterLink} color="inherit" to={ROUTES.SCHOOLADMIN_DASHBOARD}>
            Dashboard
          </Link>
          <Link component={RouterLink} color="inherit" to={ROUTES.STUDENTS}>
            Students
          </Link>
          <Link component={RouterLink} color="inherit" to={ROUTES.STUDENT_PROFILE.replace(':id', id)}>
            {student.studentName}
          </Link>
          <Typography color="text.primary">Edit</Typography>
        </Breadcrumbs>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <StudentForm 
        initialData={student} 
        onSubmit={handleSubmit} 
        isSubmitting={isUpdating} 
        isEditMode={true} 
      />
    </Box>
  );
};

export default EditStudent;
