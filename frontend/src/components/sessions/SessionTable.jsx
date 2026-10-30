import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Tooltip, TablePagination, Box, Typography,
  Skeleton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as ActivateIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';

const statusColorMap = {
  PLANNED: 'info',
  ACTIVE: 'success',
  COMPLETED: 'warning',
  ARCHIVED: 'default',
};

const SessionTable = ({ data, totalCount, isLoading, onDeleteClick, onActivate, onArchive }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={56} sx={{ mb: 1 }} />
        ))}
      </Paper>
    );
  }

  const sessions = data || [];

  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 700 }}>Session Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Academic Year</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Start Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>End Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    No sessions found. Create your first academic session.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow
                  key={session._id}
                  hover
                  sx={{ '&:last-child td': { border: 0 }, cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography fontWeight={600}>{session.sessionName}</Typography>
                  </TableCell>
                  <TableCell>{session.sessionCode}</TableCell>
                  <TableCell>{session.academicYear}</TableCell>
                  <TableCell>{new Date(session.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(session.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={session.status || (session.isActive ? 'ACTIVE' : 'PLANNED')}
                      color={statusColorMap[session.status] || 'default'}
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
                          onClick={() => navigate(ROUTES.SESSION_DETAILS.replace(':id', session._id))}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => navigate(ROUTES.SESSION_EDIT.replace(':id', session._id))}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!session.isActive && !session.isArchived && (
                        <Tooltip title="Activate">
                          <IconButton size="small" color="success" onClick={() => onActivate(session._id)}>
                            <ActivateIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {!session.isArchived && (
                        <Tooltip title="Archive">
                          <IconButton size="small" color="warning" onClick={() => onArchive(session._id)}>
                            <ArchiveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => onDeleteClick(session)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount || sessions.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
};

export default SessionTable;
