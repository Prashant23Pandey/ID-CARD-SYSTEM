import { useState } from 'react';
import { Box, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTeacherByIdQuery, useUpdateTeacherMutation } from '../../features/teacher/teacherApi';
import TeacherForm from '../../components/teacher/TeacherForm';
import { ROUTES } from '../../constants';

const EditTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: teacherRes, isLoading: isFetching, error: fetchError } = useGetTeacherByIdQuery(id);
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();
  const [error, setError] = useState(null);

  const handleSubmit = async (data) => {
    try {
      setError(null);
      await updateTeacher({ id, ...data }).unwrap();
      navigate(ROUTES.TEACHERS);
    } catch (err) {
      setError(err.data?.message || 'Failed to update teacher');
    }
  };

  if (isFetching) return <CircularProgress />;
  if (fetchError) return <Alert severity="error">Failed to load teacher data</Alert>;

  const teacher = teacherRes?.data;

  return (
    <Box>
      <Typography variant="h4" fontWeight="600" color="primary.main" gutterBottom>
        Edit Teacher - {teacher?.fullName}
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Paper elevation={0} sx={{ p: 0, bgcolor: 'transparent' }}>
        <TeacherForm initialData={teacher} onSubmit={handleSubmit} isSubmitting={isUpdating} isEditMode={true} />
      </Paper>
    </Box>
  );
};

export default EditTeacher;
