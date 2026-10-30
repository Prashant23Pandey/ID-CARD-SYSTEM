import {
  Box,
  IconButton,
  Tooltip,
  Paper,
  Typography,
  Avatar,
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  DeleteOutline as DeleteIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  setStudentPage,
  setStudentListState,
  selectStudentListState,
  setSelectedStudentIds,
} from '../../features/student/studentSlice';
import { ROUTES } from '../../constants';

const StudentTable = ({ data, totalCount, isLoading, onDeleteClick, onGenerateIdClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const listState = useSelector(selectStudentListState);

  const handlePageChange = (newPage) => {
    dispatch(setStudentPage(newPage + 1));
  };

  const handlePageSizeChange = (newPageSize) => {
    dispatch(setStudentListState({ limit: newPageSize, page: 1 }));
  };

  const handleSortModelChange = (newSortModel) => {
    if (newSortModel.length > 0) {
      dispatch(
        setStudentListState({
          sortBy: newSortModel[0].field,
          sortOrder: newSortModel[0].sort,
        })
      );
    }
  };

  const columns = [
    {
      field: 'photoUrl',
      headerName: 'Photo',
      width: 80,
      renderCell: (params) => (
        <Avatar src={params.value} sx={{ width: 32, height: 32 }} />
      ),
      sortable: false,
    },
    {
      field: 'admissionNumber',
      headerName: 'Adm No.',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="600" color="primary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'studentName',
      headerName: 'Student Name',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'classSection',
      headerName: 'Class',
      width: 120,
      renderCell: (params) => (
        `${params.row.classId?.className || ''} ${params.row.sectionId?.sectionName || ''}`
      ),
    },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 100,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color={params.value === 'Active' ? 'success.main' : 'error.main'}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 180,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="View Profile">
              <ViewIcon color="primary" />
            </Tooltip>
          }
          label="View"
          onClick={() => navigate(ROUTES.STUDENT_PROFILE.replace(':id', params.row._id || params.row.id))}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Edit Student">
              <EditIcon color="action" />
            </Tooltip>
          }
          label="Edit"
          onClick={() => navigate(ROUTES.STUDENT_EDIT.replace(':id', params.row._id || params.row.id))}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Generate ID Card">
              <BadgeIcon color="secondary" />
            </Tooltip>
          }
          label="ID Card"
          onClick={() => onGenerateIdClick && onGenerateIdClick(params.row)}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Delete">
              <DeleteIcon color="error" />
            </Tooltip>
          }
          label="Delete"
          onClick={() => onDeleteClick(params.row)}
        />,
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
        paginationModel={{
          page: listState.page - 1,
          pageSize: listState.limit,
        }}
        onPaginationModelChange={(model) => {
          if (model.page !== listState.page - 1) handlePageChange(model.page);
          if (model.pageSize !== listState.limit) handlePageSizeChange(model.pageSize);
        }}
        sortingMode="server"
        sortModel={
          listState.sortBy
            ? [{ field: listState.sortBy, sort: listState.sortOrder }]
            : []
        }
        onSortModelChange={handleSortModelChange}
        checkboxSelection
        onRowSelectionModelChange={(newSelection) => {
          dispatch(setSelectedStudentIds(newSelection));
        }}
        disableRowSelectionOnClick
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell:focus': { outline: 'none' },
          '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
        }}
      />
    </Paper>
  );
};

export default StudentTable;
