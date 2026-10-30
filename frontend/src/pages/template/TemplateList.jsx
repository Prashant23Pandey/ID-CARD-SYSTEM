import { useEffect } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTemplates, selectTemplateState } from '../../features/template/templateSlice';
import templateService from '../../services/templateService';

const TemplateList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { templates, pagination, loading } = useSelector(selectTemplateState);

  useEffect(() => {
    dispatch(fetchTemplates({ page: 1, limit: 20 }));
  }, [dispatch]);

  const columns = [
    { field: 'templateName', headerName: 'Template Name', flex: 1 },
    { field: 'templateCode', headerName: 'Code', width: 180 },
    { field: 'templateType', headerName: 'Type', width: 180 },
    { field: 'status', headerName: 'Status', width: 130 },
    { field: 'version', headerName: 'Version', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 320,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => navigate(`/templates/${row._id}/designer`)}>Edit</Button>
          <Button size="small" onClick={() => navigate(`/templates/${row._id}/details`)}>Details</Button>
          <Button size="small" onClick={() => templateService.publish(row._id)}>Publish</Button>
          <Button size="small" onClick={() => templateService.archive(row._id)}>Archive</Button>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h5">Template Manager</Typography>
        <Button variant="contained" onClick={() => navigate('/templates/designer')}>Create Template</Button>
      </Stack>
      <DataGrid
        autoHeight
        rows={templates}
        rowCount={pagination.total}
        getRowId={(row) => row._id}
        columns={columns}
        loading={loading}
      />
    </Stack>
  );
};

export default TemplateList;
