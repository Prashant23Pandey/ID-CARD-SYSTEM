import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Typography,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  RestartAlt as ResetIcon,
} from '@mui/icons-material';
import {
  setSearch,
  setListState,
  clearFilters,
  selectSchoolListState,
} from '../../features/school/schoolSlice';
import { useGetFilterOptionsQuery } from '../../features/school/schoolApi';

const SchoolFilter = () => {
  const dispatch = useDispatch();
  const listState = useSelector(selectSchoolListState);
  const [searchValue, setSearchValue] = useState(listState.search || '');
  const [anchorEl, setAnchorEl] = useState(null);

  const { data: filterOptionsRes } = useGetFilterOptionsQuery();
  const filterOptions = filterOptionsRes?.data || {
    states: [],
    cities: [],
    boardTypes: [],
    schoolTypes: [],
    statusOptions: [],
    subscriptionPlans: [],
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setSearch(searchValue));
  };

  const handleSearchClear = () => {
    setSearchValue('');
    dispatch(setSearch(''));
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterChange = (field, value) => {
    dispatch(setListState({ [field]: value, page: 1 }));
  };

  const handleResetFilters = () => {
    dispatch(clearFilters());
    handleFilterClose();
  };

  const activeFiltersCount = Object.keys(listState).reduce((count, key) => {
    if (
      key !== 'page' &&
      key !== 'limit' &&
      key !== 'search' &&
      key !== 'sortBy' &&
      key !== 'sortOrder' &&
      listState[key] !== ''
    ) {
      return count + 1;
    }
    return count;
  }, 0);

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
      <Box
        component="form"
        onSubmit={handleSearchSubmit}
        sx={{ flexGrow: 1, minWidth: { xs: '100%', md: '300px' } }}
      >
        <TextField
          fullWidth
          placeholder="Search schools by name, code, email, city..."
          value={searchValue}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchValue && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleSearchClear}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Button
        variant={activeFiltersCount > 0 ? 'contained' : 'outlined'}
        color="primary"
        startIcon={<FilterListIcon />}
        onClick={handleFilterClick}
        sx={{ height: 40 }}
      >
        Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleFilterClose}
        PaperProps={{
          sx: { width: 320, p: 2, mt: 1 },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="600">
            Filter Schools
          </Typography>
          {activeFiltersCount > 0 && (
            <Button
              size="small"
              startIcon={<ResetIcon />}
              onClick={handleResetFilters}
              color="error"
            >
              Reset
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={listState.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {filterOptions.statusOptions.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Board Type</InputLabel>
              <Select
                value={listState.boardType}
                label="Board Type"
                onChange={(e) => handleFilterChange('boardType', e.target.value)}
              >
                <MenuItem value="">All Boards</MenuItem>
                {filterOptions.boardTypes.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>School Type</InputLabel>
              <Select
                value={listState.schoolType}
                label="School Type"
                onChange={(e) => handleFilterChange('schoolType', e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                {filterOptions.schoolTypes.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
           <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Subscription Plan</InputLabel>
              <Select
                value={listState.subscriptionPlan}
                label="Subscription Plan"
                onChange={(e) => handleFilterChange('subscriptionPlan', e.target.value)}
              >
                <MenuItem value="">All Plans</MenuItem>
                {filterOptions.subscriptionPlans.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Menu>
    </Box>
  );
};

export default SchoolFilter;
