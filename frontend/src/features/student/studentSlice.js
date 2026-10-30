import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  listState: {
    page: 1,
    limit: 10,
    search: '',
    status: '',
    gender: '',
    bloodGroup: '',
    classId: '',
    sectionId: '',
    sessionId: '',
    sortBy: 'studentName',
    sortOrder: 'asc',
  },
  selectedStudentIds: [],
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudentListState: (state, action) => {
      state.listState = { ...state.listState, ...action.payload };
    },
    resetStudentListState: (state) => {
      state.listState = initialState.listState;
    },
    setStudentPage: (state, action) => {
      state.listState.page = action.payload;
    },
    setStudentSearch: (state, action) => {
      state.listState.search = action.payload;
      state.listState.page = 1;
    },
    clearStudentFilters: (state) => {
      state.listState = {
        ...initialState.listState,
        limit: state.listState.limit,
        sortBy: state.listState.sortBy,
        sortOrder: state.listState.sortOrder,
      };
    },
    setSelectedStudentIds: (state, action) => {
      state.selectedStudentIds = action.payload;
    },
  },
});

export const {
  setStudentListState,
  resetStudentListState,
  setStudentPage,
  setStudentSearch,
  clearStudentFilters,
  setSelectedStudentIds,
} = studentSlice.actions;

export const selectStudentListState = (state) => state.student.listState;
export const selectSelectedStudentIds = (state) => state.student.selectedStudentIds;

export default studentSlice.reducer;
