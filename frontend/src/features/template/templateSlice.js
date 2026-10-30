import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import templateService from '../../services/templateService';

const initialState = {
  templates: [],
  selectedTemplate: null,
  listParams: { page: 1, limit: 20, search: '', status: '', templateType: '' },
  loading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
};

export const fetchTemplates = createAsyncThunk('template/fetchTemplates', async (params, { rejectWithValue }) => {
  try {
    const response = await templateService.list(params);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch templates');
  }
});

export const fetchTemplateById = createAsyncThunk('template/fetchTemplateById', async (id, { rejectWithValue }) => {
  try {
    const response = await templateService.getById(id);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to load template');
  }
});

export const saveTemplate = createAsyncThunk('template/saveTemplate', async (payload, { rejectWithValue }) => {
  try {
    const response = payload.id
      ? await templateService.update(payload.id, payload.data)
      : await templateService.create(payload.data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to save template');
  }
});

const templateSlice = createSlice({
  name: 'template',
  initialState,
  reducers: {
    setTemplateListParams: (state, action) => {
      state.listParams = { ...state.listParams, ...action.payload };
    },
    setSelectedTemplate: (state, action) => {
      state.selectedTemplate = action.payload;
    },
    clearTemplateState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTemplateById.fulfilled, (state, action) => {
        state.selectedTemplate = action.payload;
      })
      .addCase(saveTemplate.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveTemplate.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTemplate = action.payload;
      })
      .addCase(saveTemplate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setTemplateListParams, setSelectedTemplate, clearTemplateState } = templateSlice.actions;
export const selectTemplateState = (state) => state.template;

export default templateSlice.reducer;
