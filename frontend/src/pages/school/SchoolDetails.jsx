import { Box, Typography, Breadcrumbs, Link, Alert, CircularProgress, Paper, Grid, Divider, Button } from '@mui/material';
import { NavigateNext as NavigateNextIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { useGetSchoolByIdQuery } from '../../../features/school/schoolApi';
import SchoolStatusChip from '../../../components/school/SchoolStatusChip';

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

const SchoolDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: schoolRes, isLoading, isError } = useGetSchoolByIdQuery(id);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !schoolRes?.data) {
    return (
      <Alert severity="error">
        Failed to load school details.
      </Alert>
    );
  }

  const school = schoolRes.data;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
            {school.schoolName}
          </Typography>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
            <Link component={RouterLink} color="inherit" to={ROUTES.SUPERADMIN_DASHBOARD}>
              Dashboard
            </Link>
            <Link component={RouterLink} color="inherit" to={ROUTES.SCHOOLS}>
              Schools
            </Link>
            <Typography color="text.primary">{school.schoolCode}</Typography>
          </Breadcrumbs>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(ROUTES.SCHOOL_EDIT.replace(':id', id))}
        >
          Edit School
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color="primary">Basic Information</Typography>
              <SchoolStatusChip status={school.status} />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><DetailItem label="School Code" value={school.schoolCode} /></Grid>
              <Grid item xs={12} sm={6}><DetailItem label="Short Name" value={school.schoolShortName} /></Grid>
              <Grid item xs={12} sm={6}><DetailItem label="Board Type" value={school.boardType} /></Grid>
              <Grid item xs={12} sm={6}><DetailItem label="School Type" value={school.schoolType} /></Grid>
              <Grid item xs={12} sm={6}><DetailItem label="Registration No." value={school.registrationNumber} /></Grid>
              <Grid item xs={12} sm={6}><DetailItem label="Established Year" value={school.establishedYear} /></Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
            <Typography variant="h6" color="primary" gutterBottom>Contact & Address</Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><DetailItem label="Principal Name" value={school.principalName} /></Grid>
              <Grid item xs={12} sm={6}><DetailItem label="Email" value={school.email} /></Grid>
              <Grid item xs={12} sm={6}><DetailItem label="Phone" value={school.phone} /></Grid>
              <Grid item xs={12} sm={6}><DetailItem label="Website" value={school.website} /></Grid>
              <Grid item xs={12}>
                <DetailItem label="Address" value={`${school.addressLine1}${school.addressLine2 ? ', ' + school.addressLine2 : ''}`} />
              </Grid>
              <Grid item xs={12} sm={4}><DetailItem label="City" value={school.city} /></Grid>
              <Grid item xs={12} sm={4}><DetailItem label="State" value={school.state} /></Grid>
              <Grid item xs={12} sm={4}><DetailItem label="Postal Code" value={school.postalCode} /></Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }} variant="outlined">
             <Box
              component="img"
              src={school.logoUrl || '/assets/default-school.png'}
              alt="School Logo"
              sx={{ width: 120, height: 120, borderRadius: 2, objectFit: 'contain', bgcolor: 'grey.100', mb: 2 }}
            />
            <Typography variant="h6">{school.schoolShortName || school.schoolCode}</Typography>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }} variant="outlined">
            <Typography variant="h6" color="primary" gutterBottom>Subscription & Stats</Typography>
            <Divider sx={{ mb: 3 }} />
            <DetailItem label="Plan" value={school.subscriptionPlan} />
            <DetailItem label="Student Capacity" value={school.studentCapacity} />
            <DetailItem label="Current Students" value={school.currentStudentCount} />
            <DetailItem label="Current Teachers" value={school.teacherCount || school.currentTeacherCount} />
          </Paper>
          
          <Paper sx={{ p: 3 }} variant="outlined">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="primary">Assigned Admins</Typography>
                <Button size="small" onClick={() => navigate(ROUTES.SCHOOL_ASSIGN_ADMIN.replace(':id', id))}>Manage</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {school.admins && school.admins.length > 0 ? (
                school.admins.map((admin) => (
                    <Box key={admin._id} sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="500">{admin.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{admin.email}</Typography>
                    </Box>
                ))
            ) : (
                <Typography variant="body2" color="text.secondary">No admins assigned yet.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SchoolDetails;
