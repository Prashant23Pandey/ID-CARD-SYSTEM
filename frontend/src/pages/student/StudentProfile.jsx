import { Box, Typography, Breadcrumbs, Link, Alert, CircularProgress, Paper, Grid, Divider, Button } from '@mui/material';
import { NavigateNext as NavigateNextIcon, Edit as EditIcon, Badge as BadgeIcon } from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { useGetStudentByIdQuery } from '../../../features/student/studentApi';

const DetailItem = ({ label, value }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    <Typography variant="body1" fontWeight="500">
      {value || '-'}
    </Typography>
  </Box>
);

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: studentRes, isLoading, isError } = useGetStudentByIdQuery(id);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !studentRes?.data) {
    return (
      <Alert severity="error">
        Failed to load student details.
      </Alert>
    );
  }

  const student = studentRes.data;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
            {student.studentName}
          </Typography>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Link component={RouterLink} color="inherit" to={ROUTES.SCHOOLADMIN_DASHBOARD}>
              Dashboard
            </Link>
            <Link component={RouterLink} color="inherit" to={ROUTES.STUDENTS}>
              Students
            </Link>
            <Typography color="text.primary">{student.admissionNumber}</Typography>
          </Breadcrumbs>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<BadgeIcon />}
            // This would route to the ID Card module later
            onClick={() => alert('Navigate to ID Card Generator')}
          >
            Generate ID Card
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(ROUTES.STUDENT_EDIT.replace(':id', id))}
          >
            Edit Profile
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
            <Typography variant="h6" color="primary" gutterBottom>Academic Information</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}><DetailItem label="Admission No." value={student.admissionNumber} /></Grid>
              <Grid item xs={12} sm={4}><DetailItem label="Roll No." value={student.rollNumber} /></Grid>
              <Grid item xs={12} sm={4}><DetailItem label="Status" value={student.status} /></Grid>
              <Grid item xs={12} sm={4}><DetailItem label="Class" value={student.classId?.className} /></Grid>
              <Grid item xs={12} sm={4}><DetailItem label="Section" value={student.sectionId?.sectionName} /></Grid>
              <Grid item xs={12} sm={4}><DetailItem label="Session" value={student.sessionId?.sessionName} /></Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
            <Typography variant="h6" color="primary" gutterBottom>Personal Information</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}><DetailItem label="Gender" value={student.gender} /></Grid>
              <Grid item xs={12} sm={4}><DetailItem label="Date of Birth" value={student.dateOfBirth} /></Grid>
              <Grid item xs={12} sm={4}><DetailItem label="Blood Group" value={student.bloodGroup} /></Grid>
              <Grid item xs={12} sm={4}><DetailItem label="Religion" value={student.religion} /></Grid>
              <Grid item xs={12} sm={4}><DetailItem label="Category" value={student.category} /></Grid>
              <Grid item xs={12} sm={4}><DetailItem label="Aadhaar" value={student.aadhaarNumber} /></Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
            <Typography variant="h6" color="primary" gutterBottom>Parent & Contact Details</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><DetailItem label="Father's Name" value={student.fatherName} /></Grid>
              <Grid item xs={12} sm={6}><DetailItem label="Father's Mobile" value={student.fatherMobile} /></Grid>
              <Grid item xs={12} sm={6}><DetailItem label="Mother's Name" value={student.motherName} /></Grid>
              <Grid item xs={12} sm={6}><DetailItem label="Mother's Mobile" value={student.motherMobile} /></Grid>
              <Grid item xs={12} sm={6}><DetailItem label="Student Mobile" value={student.studentMobile} /></Grid>
              <Grid item xs={12} sm={6}><DetailItem label="Email" value={student.email} /></Grid>
              <Grid item xs={12}>
                <DetailItem label="Address" value={`${student.addressLine1} ${student.addressLine2 || ''}`} />
              </Grid>
              <Grid item xs={12} sm={4}><DetailItem label="City" value={student.city} /></Grid>
              <Grid item xs={12} sm={4}><DetailItem label="State" value={student.state} /></Grid>
              <Grid item xs={12} sm={4}><DetailItem label="Postal Code" value={student.postalCode} /></Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right Column (Photo, QR, Barcode) */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }} variant="outlined">
             <Box
              component="img"
              src={student.photoUrl || '/assets/default-avatar.png'}
              alt="Student Photo"
              sx={{ width: 150, height: 150, borderRadius: '50%', objectFit: 'cover', bgcolor: 'grey.100', mb: 2, border: '4px solid #fff', boxShadow: 2 }}
            />
            <Typography variant="h6">{student.studentName}</Typography>
            <Typography variant="body2" color="text.secondary">{student.admissionNumber}</Typography>
          </Paper>

          {/* QR Code and Barcode */}
          <Paper sx={{ p: 3, mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }} variant="outlined">
            <Typography variant="h6" color="primary" gutterBottom>ID Card Data</Typography>
            <Divider sx={{ width: '100%', mb: 3 }} />
            
            {student.qrCode && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>QR Code</Typography>
                <img src={student.qrCode} alt="QR Code" style={{ width: 150, height: 150 }} />
              </Box>
            )}

            {student.barcode && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>Barcode</Typography>
                <img src={student.barcode} alt="Barcode" style={{ maxWidth: '100%', height: 'auto' }} />
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentProfile;
