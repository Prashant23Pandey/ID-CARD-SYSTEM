import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import versionService from '../../services/versionService';

const initialState = {
  history: [],
  compare: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  loading: false,
  error: null,
};

export const fetchVersionHistory = createAsyncThunk(
  'version/fetchHistory',
  async ({ templateId, page, limit }, { rejectWithValue }) => {
    try {
      const response = await versionService.getHistory(templateId, page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Version history failed');
    }
  }
);

export const restoreTemplateVersion = createAsyncThunk(
  'version/restore',
  async ({ templateId, version }, { rejectWithValue }) => {
    try {
      const response = await versionService.restore(templateId, version);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Restore failed');
    }
  }
);

export const compareTemplateVersions = createAsyncThunk(
  'version/compare',
  async ({ templateId, fromVersion, toVersion }, { rejectWithValue }) => {
    try {
      const response = await versionService.compare(templateId, fromVersion, toVersion);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Compare failed');
    }
  }
);

const versionSlice = createSlice({
  name: 'version',
  initialState,
  reducers: {
    clearVersionCompare: (state) => {
      state.compare = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVersionHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVersionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchVersionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(compareTemplateVersions.fulfilled, (state, action) => {
        state.compare = action.payload;
      });
  },
});

export const selectVersionState = (state) => state.version;
export const { clearVersionCompare } = versionSlice.actions;
export default versionSlice.reducer;
