import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  listState: {
    page: 1,
    limit: 10,
    search: '',
    sessionId: '',
    classId: '',
    status: '',
    sortBy: 'sectionName',
    sortOrder: 'asc',
  },
};

const sectionSlice = createSlice({
  name: 'section',
  initialState,
  reducers: {
    setSectionListState: (state, action) => {
      state.listState = { ...state.listState, ...action.payload };
    },
    resetSectionListState: (state) => {
      state.listState = initialState.listState;
    },
    setSectionPage: (state, action) => {
      state.listState.page = action.payload;
    },
    setSectionSearch: (state, action) => {
      state.listState.search = action.payload;
      state.listState.page = 1;
    },
    clearSectionFilters: (state) => {
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
  setSectionListState,
  resetSectionListState,
  setSectionPage,
  setSectionSearch,
  clearSectionFilters,
} = sectionSlice.actions;

export const selectSectionListState = (state) => state.section.listState;

export default sectionSlice.reducer;
