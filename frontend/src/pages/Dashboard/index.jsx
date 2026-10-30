import { Box, Card, CardContent, Grid, Typography, Avatar } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import BadgeIcon from '@mui/icons-material/Badge';
import SecurityIcon from '@mui/icons-material/Security';

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', p: 2 }}>
    <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.dark`, width: 56, height: 56, mr: 2 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="body2" color="text.secondary" fontWeight="bold">
        {title}
      </Typography>
      <Typography variant="h4" fontWeight="bold">
        {value}
      </Typography>
    </Box>
  </Card>
);

const Dashboard = () => {
  const { user, role } = useAuth();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here is what's happening today in your {role === ROLES.SUPERADMIN ? 'platform' : 'school'}.
        </Typography>
      </Box>

      {/* Role specific rendering example */}
      {role === ROLES.SUPERADMIN && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Schools" value="124" icon={<SchoolIcon />} color="primary" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Total Users" value="8,430" icon={<PeopleIcon />} color="success" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Cards Generated" value="45K" icon={<BadgeIcon />} color="warning" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard title="Active Sessions" value="1,204" icon={<SecurityIcon />} color="info" />
          </Grid>
        </Grid>
      )}

      {role === ROLES.SCHOOLADMIN && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Total Students" value="1,240" icon={<PeopleIcon />} color="primary" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Total Teachers" value="85" icon={<SchoolIcon />} color="success" />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard title="Cards Pending" value="320" icon={<BadgeIcon />} color="warning" />
          </Grid>
        </Grid>
      )}

      {role === ROLES.TEACHER && (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={6}>
            <StatCard title="My Students" value="45" icon={<PeopleIcon />} color="primary" />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <StatCard title="Cards Required" value="5" icon={<BadgeIcon />} color="error" />
          </Grid>
        </Grid>
      )}

      {/* Add more dashboard widgets here (Charts, Recent Activity tables, etc.) */}
      <Box sx={{ mt: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h6" mb={2}>Recent Activity</Typography>
        <Typography variant="body2" color="text.secondary">
          No recent activity to display.
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
