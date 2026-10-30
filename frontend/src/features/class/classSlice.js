import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  listState: {
    page: 1,
    limit: 10,
    search: '',
    sessionId: '',
    status: '',
    sortBy: 'classNumericValue',
    sortOrder: 'asc',
  },
};

const classSlice = createSlice({
  name: 'class',
  initialState,
  reducers: {
    setClassListState: (state, action) => {
      state.listState = { ...state.listState, ...action.payload };
    },
    resetClassListState: (state) => {
      state.listState = initialState.listState;
    },
    setClassPage: (state, action) => {
      state.listState.page = action.payload;
    },
    setClassSearch: (state, action) => {
      state.listState.search = action.payload;
      state.listState.page = 1;
    },
    setClassSessionFilter: (state, action) => {
      state.listState.sessionId = action.payload;
      state.listState.page = 1;
    },
    clearClassFilters: (state) => {
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
  setClassListState,
  resetClassListState,
  setClassPage,
  setClassSearch,
  setClassSessionFilter,
  clearClassFilters,
} = classSlice.actions;

export const selectClassListState = (state) => state.class.listState;

export default classSlice.reducer;
