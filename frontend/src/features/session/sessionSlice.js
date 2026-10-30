import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  listState: {
    page: 1,
    limit: 10,
    search: '',
    status: '',
    academicYear: '',
    sortBy: 'startDate',
    sortOrder: 'desc',
  },
  activeSessionId: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSessionListState: (state, action) => {
      state.listState = { ...state.listState, ...action.payload };
    },
    resetSessionListState: (state) => {
      state.listState = initialState.listState;
    },
    setSessionPage: (state, action) => {
      state.listState.page = action.payload;
    },
    setSessionSearch: (state, action) => {
      state.listState.search = action.payload;
      state.listState.page = 1;
    },
    clearSessionFilters: (state) => {
      state.listState = {
        ...initialState.listState,
        limit: state.listState.limit,
        sortBy: state.listState.sortBy,
        sortOrder: state.listState.sortOrder,
      };
    },
    setActiveSessionId: (state, action) => {
      state.activeSessionId = action.payload;
    },
  },
});

export const {
  setSessionListState,
  resetSessionListState,
  setSessionPage,
  setSessionSearch,
  clearSessionFilters,
  setActiveSessionId,
} = sessionSlice.actions;

export const selectSessionListState = (state) => state.session.listState;
export const selectActiveSessionId = (state) => state.session.activeSessionId;

export default sessionSlice.reducer;
