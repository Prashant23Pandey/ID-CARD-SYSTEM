import { Box, Typography, Grid, Paper, Avatar, Divider, Chip, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetTeacherByIdQuery } from '../../features/teacher/teacherApi';
import TeacherPhotoUploader from '../../components/teacher/TeacherPhotoUploader';
import TeacherSignatureUploader from '../../components/teacher/TeacherSignatureUploader';

const TeacherProfile = () => {
  const { id } = useParams();
  const { data: response, isLoading, error } = useGetTeacherByIdQuery(id);
  
  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Failed to load teacher profile</Alert>;
  if (!response?.data) return <Alert severity="warning">Teacher not found</Alert>;

  const teacher = response.data;

  return (
    <Box>
      <Typography variant="h4" fontWeight="600" color="primary.main" gutterBottom>
        Teacher Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Left Column: Photos & QR */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TeacherPhotoUploader teacherId={id} initialPhotoUrl={teacher.photoUrl} />
            <TeacherSignatureUploader teacherId={id} initialSignatureUrl={teacher.signatureUrl} />
            
            <Paper sx={{ p: 3, textAlign: 'center' }} variant="outlined">
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>ID Credentials</Typography>
              <Divider sx={{ mb: 2 }} />
              {teacher.qrCode && <img src={teacher.qrCode} alt="QR Code" style={{ width: 150, height: 150, marginBottom: 16 }} />}
              {teacher.barcode && <img src={teacher.barcode} alt="Barcode" style={{ width: '100%', maxWidth: 200, height: 60 }} />}
            </Paper>
          </Box>
        </Grid>

        {/* Right Column: Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4 }} variant="outlined">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h5" fontWeight="bold">{teacher.fullName}</Typography>
                <Typography variant="subtitle1" color="text.secondary">{teacher.designation} • {teacher.department || 'No Department'}</Typography>
              </Box>
              <Chip label={teacher.status} color={teacher.status === 'Active' ? 'success' : 'error'} />
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Employee ID</Typography>
                <Typography variant="body1" fontWeight="500">{teacher.employeeId}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Teacher Code</Typography>
                <Typography variant="body1" fontWeight="500">{teacher.teacherCode}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Assigned Class</Typography>
                <Typography variant="body1" fontWeight="500">
                  {teacher.classId ? `${teacher.classId.className} ${teacher.classId.sectionName || ''}` : 'Not Assigned'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Experience</Typography>
                <Typography variant="body1" fontWeight="500">{teacher.experienceYears} Years</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Email</Typography>
                <Typography variant="body1" fontWeight="500">{teacher.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Mobile</Typography>
                <Typography variant="body1" fontWeight="500">{teacher.mobile}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Qualification</Typography>
                <Typography variant="body1" fontWeight="500">{teacher.qualification || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Specialization</Typography>
                <Typography variant="body1" fontWeight="500">{teacher.specialization || '-'}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Address</Typography>
                <Typography variant="body1" fontWeight="500">{teacher.fullAddress || '-'}</Typography>
              </Grid>
            </Grid>

          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TeacherProfile;
