import { useEffect } from 'react';
import { Button, Card, CardContent, List, ListItem, ListItemText, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { compareTemplateVersions, fetchVersionHistory, restoreTemplateVersion, selectVersionState } from '../../features/template/versionSlice';

const TemplateVersions = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { history, compare } = useSelector(selectVersionState);
  const [fromVersion, setFromVersion] = useState('');
  const [toVersion, setToVersion] = useState('');

  useEffect(() => {
    dispatch(fetchVersionHistory({ templateId: id, page: 1, limit: 20 }));
  }, [dispatch, id]);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5">Template Versions</Typography>
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              select
              label="From"
              value={fromVersion}
              onChange={(e) => setFromVersion(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              {history.map((v) => <MenuItem key={`from-${v.version}`} value={v.version}>{v.version}</MenuItem>)}
            </TextField>
            <TextField
              size="small"
              select
              label="To"
              value={toVersion}
              onChange={(e) => setToVersion(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              {history.map((v) => <MenuItem key={`to-${v.version}`} value={v.version}>{v.version}</MenuItem>)}
            </TextField>
            <Button
              variant="outlined"
              onClick={() => dispatch(compareTemplateVersions({ templateId: id, fromVersion, toVersion }))}
              disabled={!fromVersion || !toVersion}
            >
              Compare
            </Button>
          </Stack>
          {compare && (
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">Changed Fields ({compare.changedFields.length})</Typography>
              <Typography variant="body2">{compare.changedFields.join(', ') || 'No differences'}</Typography>
            </Stack>
          )}
          <List dense>
            {history.map((v) => (
              <ListItem key={v._id} secondaryAction={<Button onClick={() => dispatch(restoreTemplateVersion({ templateId: id, version: v.version }))}>Restore</Button>}>
                <ListItemText primary={`Version ${v.version}`} secondary={`${v.changeSummary} • ${new Date(v.createdAt).toLocaleString()}`} />
              </ListItem>
            ))}
          </List>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TemplateVersions;
