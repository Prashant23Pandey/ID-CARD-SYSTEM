import { Box, Tooltip, Paper, Typography, Avatar, Chip } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Edit as EditIcon, Visibility as ViewIcon, DeleteOutline as DeleteIcon, AssignmentInd as AssignIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setTeacherPage, setTeacherListState, selectTeacherListState, setSelectedTeacherIds } from '../../features/teacher/teacherSlice';
import { ROUTES } from '../../constants';

const TeacherTable = ({ data, totalCount, isLoading, onDeleteClick, onAssignClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const listState = useSelector(selectTeacherListState);

  const handlePageChange = (newPage) => dispatch(setTeacherPage(newPage + 1));
  const handlePageSizeChange = (newPageSize) => dispatch(setTeacherListState({ limit: newPageSize, page: 1 }));
  const handleSortModelChange = (newSortModel) => {
    if (newSortModel.length > 0) {
      dispatch(setTeacherListState({ sortBy: newSortModel[0].field, sortOrder: newSortModel[0].sort }));
    }
  };

  const columns = [
    {
      field: 'photoUrl', headerName: 'Photo', width: 70, sortable: false,
      renderCell: (params) => <Avatar src={params.value} sx={{ width: 32, height: 32 }} />
    },
    { field: 'employeeId', headerName: 'Emp ID', width: 100, renderCell: (params) => <Typography variant="body2" fontWeight="600" color="primary">{params.value}</Typography> },
    { field: 'fullName', headerName: 'Full Name', flex: 1, minWidth: 150 },
    { field: 'designation', headerName: 'Designation', width: 140 },
    { field: 'mobile', headerName: 'Mobile', width: 120 },
    {
      field: 'classId', headerName: 'Assigned Class', width: 130,
      renderCell: (params) => (
        params.value ? (
           <Chip label={`${params.value.className} ${params.value.sectionName || ''}`} size="small" color="info" variant="outlined" />
        ) : (
           <Typography variant="body2" color="text.secondary">-</Typography>
        )
      ),
    },
    {
      field: 'status', headerName: 'Status', width: 100,
      renderCell: (params) => (
        <Typography variant="body2" color={params.value === 'Active' ? 'success.main' : 'error.main'}>{params.value}</Typography>
      ),
    },
    {
      field: 'actions', type: 'actions', headerName: 'Actions', width: 160,
      getActions: (params) => [
        <GridActionsCellItem icon={<Tooltip title="View Profile"><ViewIcon color="primary" /></Tooltip>} label="View" onClick={() => navigate(ROUTES.TEACHER_PROFILE.replace(':id', params.row._id || params.row.id))} />,
        <GridActionsCellItem icon={<Tooltip title="Edit Teacher"><EditIcon color="action" /></Tooltip>} label="Edit" onClick={() => navigate(ROUTES.TEACHER_EDIT.replace(':id', params.row._id || params.row.id))} />,
        <GridActionsCellItem icon={<Tooltip title="Assign Class"><AssignIcon color="secondary" /></Tooltip>} label="Assign" onClick={() => onAssignClick && onAssignClick(params.row)} />,
        <GridActionsCellItem icon={<Tooltip title="Delete"><DeleteIcon color="error" /></Tooltip>} label="Delete" onClick={() => onDeleteClick && onDeleteClick(params.row)} />,
      ],
    },
  ];

  return (
    <Paper elevation={0} variant="outlined" sx={{ height: 'calc(100vh - 280px)', width: '100%', minHeight: 400 }}>
      <DataGrid
        rows={data || []}
        columns={columns}
        getRowId={(row) => row._id || row.id}
        loading={isLoading}
        pagination
        paginationMode="server"
        rowCount={totalCount || 0}
        pageSizeOptions={[10, 25, 50, 100]}
        paginationModel={{ page: listState.page - 1, pageSize: listState.limit }}
        onPaginationModelChange={(model) => {
          if (model.page !== listState.page - 1) handlePageChange(model.page);
          if (model.pageSize !== listState.limit) handlePageSizeChange(model.pageSize);
        }}
        sortingMode="server"
        sortModel={listState.sortBy ? [{ field: listState.sortBy, sort: listState.sortOrder }] : []}
        onSortModelChange={handleSortModelChange}
        checkboxSelection
        onRowSelectionModelChange={(newSelection) => dispatch(setSelectedTeacherIds(newSelection))}
        disableRowSelectionOnClick
        sx={{ border: 'none', '& .MuiDataGrid-cell:focus': { outline: 'none' }, '& .MuiDataGrid-columnHeader:focus': { outline: 'none' } }}
      />
    </Paper>
  );
};

export default TeacherTable;
