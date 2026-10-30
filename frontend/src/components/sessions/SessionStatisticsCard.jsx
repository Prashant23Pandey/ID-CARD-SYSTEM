import { Card, CardContent, Typography, Box, Divider, Chip } from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';

const SessionStatisticsCard = ({ session }) => {
  if (!session) return null;

  const daysRemaining = Math.ceil(
    (new Date(session.endDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const totalDays = Math.ceil(
    (new Date(session.endDate) - new Date(session.startDate)) / (1000 * 60 * 60 * 24)
  );
  const progress = totalDays > 0 ? Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100)) : 0;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CalendarIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Session Overview
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Session Name</Typography>
            <Typography fontWeight={600}>{session.sessionName}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Academic Year</Typography>
            <Typography fontWeight={600}>{session.academicYear}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Start Date</Typography>
            <Typography>{new Date(session.startDate).toLocaleDateString()}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">End Date</Typography>
            <Typography>{new Date(session.endDate).toLocaleDateString()}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Status</Typography>
            <Box>
              <Chip
                label={session.isActive ? 'Active' : session.isArchived ? 'Archived' : 'Planned'}
                color={session.isActive ? 'success' : session.isArchived ? 'default' : 'info'}
                size="small"
              />
            </Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Progress</Typography>
            <Typography fontWeight={600}>{progress.toFixed(0)}%</Typography>
            <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 6, mt: 0.5 }}>
              <Box
                sx={{
                  width: `${progress}%`,
                  bgcolor: 'primary.main',
                  borderRadius: 1,
                  height: '100%',
                  transition: 'width 0.5s ease',
                }}
              />
            </Box>
          </Box>
        </Box>
        {daysRemaining > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {daysRemaining} days remaining in this session
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionStatisticsCard;
