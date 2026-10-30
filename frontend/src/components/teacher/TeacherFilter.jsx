import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, TextField, InputAdornment, IconButton, Button, Menu, MenuItem, FormControl, InputLabel, Select, Grid, Typography, Divider } from '@mui/material';
import { Search as SearchIcon, FilterList as FilterListIcon, Clear as ClearIcon, RestartAlt as ResetIcon } from '@mui/icons-material';
import { setTeacherSearch, setTeacherListState, clearTeacherFilters, selectTeacherListState } from '../../features/teacher/teacherSlice';
import { TEACHER_STATUS_OPTIONS, TEACHER_DESIGNATION_OPTIONS } from '../../constants';

const TeacherFilter = () => {
  const dispatch = useDispatch();
  const listState = useSelector(selectTeacherListState);
  const [searchValue, setSearchValue] = useState(listState.search || '');
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setTeacherSearch(searchValue));
  };

  const handleSearchClear = () => {
    setSearchValue('');
    dispatch(setTeacherSearch(''));
  };

  const handleFilterClick = (event) => setAnchorEl(event.currentTarget);
  const handleFilterClose = () => setAnchorEl(null);

  const handleFilterChange = (field, value) => {
    dispatch(setTeacherListState({ [field]: value, page: 1 }));
  };

  const handleResetFilters = () => {
    dispatch(clearTeacherFilters());
    handleFilterClose();
  };

  const activeFiltersCount = Object.keys(listState).reduce((count, key) => {
    if (!['page', 'limit', 'search', 'sortBy', 'sortOrder'].includes(key) && listState[key]) {
      return count + 1;
    }
    return count;
  }, 0);

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ flexGrow: 1, minWidth: { xs: '100%', md: '300px' } }}>
        <TextField
          fullWidth
          placeholder="Search by name, employee code, email..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
            endAdornment: searchValue && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleSearchClear}><ClearIcon fontSize="small" /></IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Button variant={activeFiltersCount > 0 ? 'contained' : 'outlined'} color="primary" startIcon={<FilterListIcon />} onClick={handleFilterClick} sx={{ height: 40 }}>
        Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
      </Button>

      <Menu
        anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleFilterClose}
        PaperProps={{ sx: { width: 320, p: 2, mt: 1 } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="600">Filter Teachers</Typography>
          {activeFiltersCount > 0 && <Button size="small" startIcon={<ResetIcon />} onClick={handleResetFilters} color="error">Reset</Button>}
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={listState.status} label="Status" onChange={(e) => handleFilterChange('status', e.target.value)}>
                <MenuItem value="">All Statuses</MenuItem>
                {TEACHER_STATUS_OPTIONS.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Designation</InputLabel>
              <Select value={listState.designation} label="Designation" onChange={(e) => handleFilterChange('designation', e.target.value)}>
                <MenuItem value="">All Designations</MenuItem>
                {TEACHER_DESIGNATION_OPTIONS.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Menu>
    </Box>
  );
};

export default TeacherFilter;
