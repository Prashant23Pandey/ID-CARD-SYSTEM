import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  listState: {
    page: 1,
    limit: 10,
    search: '',
    status: '',
    designation: '',
    department: '',
    sortBy: 'fullName',
    sortOrder: 'asc',
  },
  selectedTeacherIds: [],
};

const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    setTeacherListState: (state, action) => {
      state.listState = { ...state.listState, ...action.payload };
    },
    resetTeacherListState: (state) => {
      state.listState = initialState.listState;
    },
    setTeacherPage: (state, action) => {
      state.listState.page = action.payload;
    },
    setTeacherSearch: (state, action) => {
      state.listState.search = action.payload;
      state.listState.page = 1;
    },
    clearTeacherFilters: (state) => {
      state.listState = {
        ...initialState.listState,
        limit: state.listState.limit,
        sortBy: state.listState.sortBy,
        sortOrder: state.listState.sortOrder,
      };
    },
    setSelectedTeacherIds: (state, action) => {
      state.selectedTeacherIds = action.payload;
    },
  },
});

export const {
  setTeacherListState,
  resetTeacherListState,
  setTeacherPage,
  setTeacherSearch,
  clearTeacherFilters,
  setSelectedTeacherIds,
} = teacherSlice.actions;

export const selectTeacherListState = (state) => state.teacher.listState;
export const selectSelectedTeacherIds = (state) => state.teacher.selectedTeacherIds;

export default teacherSlice.reducer;
