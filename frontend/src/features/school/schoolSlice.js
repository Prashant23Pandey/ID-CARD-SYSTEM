import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  listState: {
    page: 1,
    limit: 10,
    search: '',
    status: '',
    boardType: '',
    schoolType: '',
    subscriptionPlan: '',
    state: '',
    city: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  selectedSchoolId: null,
  viewMode: 'table', // 'table' or 'grid'
};

const schoolSlice = createSlice({
  name: 'school',
  initialState,
  reducers: {
    setListState: (state, action) => {
      state.listState = { ...state.listState, ...action.payload };
    },
    resetListState: (state) => {
      state.listState = initialState.listState;
    },
    setSelectedSchoolId: (state, action) => {
      state.selectedSchoolId = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setPage: (state, action) => {
      state.listState.page = action.payload;
    },
    setSearch: (state, action) => {
      state.listState.search = action.payload;
      state.listState.page = 1; // Reset page on new search
    },
    clearFilters: (state) => {
      state.listState = {
        ...initialState.listState,
        limit: state.listState.limit,
        sortBy: state.listState.sortBy,
        sortOrder: state.listState.sortOrder,
      };
    },
  },
});

export const {
  setListState,
  resetListState,
  setSelectedSchoolId,
  setViewMode,
  setPage,
  setSearch,
  clearFilters,
} = schoolSlice.actions;

export const selectSchoolListState = (state) => state.school.listState;
export const selectSelectedSchoolId = (state) => state.school.selectedSchoolId;
export const selectViewMode = (state) => state.school.viewMode;

export default schoolSlice.reducer;
