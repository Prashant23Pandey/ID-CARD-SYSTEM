import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  listState: {
    page: 1,
    limit: 20,
    previousSessionId: '',
    nextSessionId: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

const promotionSlice = createSlice({
  name: 'promotion',
  initialState,
  reducers: {
    setPromotionListState: (state, action) => {
      state.listState = { ...state.listState, ...action.payload };
    },
    resetPromotionListState: (state) => {
      state.listState = initialState.listState;
    },
    setPromotionPage: (state, action) => {
      state.listState.page = action.payload;
    },
    clearPromotionFilters: (state) => {
      state.listState = initialState.listState;
    },
  },
});

export const {
  setPromotionListState,
  resetPromotionListState,
  setPromotionPage,
  clearPromotionFilters,
} = promotionSlice.actions;

export const selectPromotionListState = (state) => state.promotion.listState;

export default promotionSlice.reducer;
