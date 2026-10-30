import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Tooltip, TablePagination, Box, Typography,
  Skeleton, Avatar, LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  PersonAdd as AssignTeacherIcon,
  Group as StudentsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';

const ClassTable = ({ data, totalCount, isLoading, onDeleteClick, onAssignTeacher }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (isLoading) {
    return (
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={56} sx={{ mb: 1 }} />
        ))}
      </Paper>
    );
  }

  const classes = data || [];

  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 700 }}>Class Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Class Teacher</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Students</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Capacity</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Occupancy</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No classes found. Create your first class.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              classes.map((cls) => {
                const occupancy = cls.capacity ? (cls.currentStudentCount / cls.capacity) * 100 : 0;
                return (
                  <TableRow key={cls._id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Typography fontWeight={600}>{cls.className}</Typography>
                    </TableCell>
                    <TableCell>{cls.classCode}</TableCell>
                    <TableCell>
                      {cls.classTeacherId ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: 14, bgcolor: 'primary.main' }}>
                            {cls.classTeacherId.name?.[0] || 'T'}
                          </Avatar>
                          <Typography variant="body2">{cls.classTeacherId.name || 'Assigned'}</Typography>
                        </Box>
                      ) : (
                        <Chip label="Unassigned" size="small" color="warning" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>{cls.currentStudentCount || 0}</TableCell>
                    <TableCell>{cls.capacity}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(occupancy, 100)}
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                          color={occupancy > 90 ? 'error' : occupancy > 70 ? 'warning' : 'primary'}
                        />
                        <Typography variant="caption" fontWeight={600}>
                          {occupancy.toFixed(0)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={cls.status}
                        color={cls.status === 'ACTIVE' ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(ROUTES.CLASS_DETAILS.replace(':id', cls._id))}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => navigate(ROUTES.CLASS_EDIT.replace(':id', cls._id))}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Assign Teacher">
                          <IconButton size="small" color="secondary" onClick={() => onAssignTeacher(cls)}>
                            <AssignTeacherIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Students">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(ROUTES.CLASS_DETAILS.replace(':id', cls._id))}
                          >
                            <StudentsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => onDeleteClick(cls)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount || classes.length}
        page={page}
        onPageChange={(e, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
};

export default ClassTable;
