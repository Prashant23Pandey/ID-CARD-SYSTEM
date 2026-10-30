import {
  Box,
  IconButton,
  Tooltip,
  Paper,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  DeleteOutline as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  setPage,
  setListState,
  selectSchoolListState,
} from '../../features/school/schoolSlice';
import SchoolStatusChip from './SchoolStatusChip';
import { ROUTES } from '../../constants';
import { format } from 'date-fns';

const CustomToolbar = () => {
  return (
    <GridToolbarContainer sx={{ p: 1, justifyContent: 'space-between' }}>
      <Box />
      <GridToolbarExport 
        printOptions={{ disableToolbarButton: true }}
        csvOptions={{
          fileName: `Schools_Export_${format(new Date(), 'yyyy-MM-dd')}`,
          utf8WithBom: true,
        }}
      />
    </GridToolbarContainer>
  );
};

const SchoolTable = ({ data, totalCount, isLoading, onDeleteClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const listState = useSelector(selectSchoolListState);

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage + 1));
  };

  const handlePageSizeChange = (newPageSize) => {
    dispatch(setListState({ limit: newPageSize, page: 1 }));
  };

  const handleSortModelChange = (newSortModel) => {
    if (newSortModel.length > 0) {
      dispatch(
        setListState({
          sortBy: newSortModel[0].field,
          sortOrder: newSortModel[0].sort,
        })
      );
    }
  };

  const columns = [
    {
      field: 'schoolCode',
      headerName: 'Code',
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="600" color="primary">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'schoolName',
      headerName: 'School Name',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'city',
      headerName: 'City',
      width: 130,
    },
    {
      field: 'state',
      headerName: 'State',
      width: 150,
    },
    {
      field: 'boardType',
      headerName: 'Board',
      width: 100,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => <SchoolStatusChip status={params.value} />,
    },
    {
      field: 'subscriptionPlan',
      headerName: 'Plan',
      width: 110,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 200,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="View Details">
              <ViewIcon color="primary" />
            </Tooltip>
          }
          label="View"
          onClick={() => navigate(ROUTES.SCHOOL_DETAILS.replace(':id', params.row._id || params.row.id))}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Edit School">
              <EditIcon color="action" />
            </Tooltip>
          }
          label="Edit"
          onClick={() => navigate(ROUTES.SCHOOL_EDIT.replace(':id', params.row._id || params.row.id))}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Manage Admins">
              <AdminIcon color="info" />
            </Tooltip>
          }
          label="Admins"
          onClick={() => navigate(ROUTES.SCHOOL_ASSIGN_ADMIN.replace(':id', params.row._id || params.row.id))}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Settings">
              <SettingsIcon color="secondary" />
            </Tooltip>
          }
          label="Settings"
          onClick={() => navigate(ROUTES.SCHOOL_SETTINGS.replace(':id', params.row._id || params.row.id))}
        />,
        <GridActionsCellItem
          icon={
            <Tooltip title="Delete">
              <DeleteIcon color="error" />
            </Tooltip>
          }
          label="Delete"
          onClick={() => onDeleteClick(params.row)}
          disabled={params.row.status === 'Deleted'}
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
          if (model.page !== listState.page - 1) {
            handlePageChange(model.page);
          }
          if (model.pageSize !== listState.limit) {
            handlePageSizeChange(model.pageSize);
          }
        }}
        sortingMode="server"
        sortModel={
          listState.sortBy
            ? [{ field: listState.sortBy, sort: listState.sortOrder }]
            : []
        }
        onSortModelChange={handleSortModelChange}
        disableRowSelectionOnClick
        slots={{
          toolbar: CustomToolbar,
        }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-columnHeader:focus': {
            outline: 'none',
          },
        }}
      />
    </Paper>
  );
};

export default SchoolTable;
