import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import previewService from '../../services/previewService';

const initialState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchTemplatePreview = createAsyncThunk(
  'preview/fetchTemplatePreview',
  async ({ templateId, data }, { rejectWithValue }) => {
    try {
      const response = await previewService.previewTemplate(templateId, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Preview failed');
    }
  }
);

const previewSlice = createSlice({
  name: 'preview',
  initialState,
  reducers: {
    clearPreview: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplatePreview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplatePreview.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTemplatePreview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPreview } = previewSlice.actions;
export const selectPreviewState = (state) => state.preview;
export default previewSlice.reducer;
