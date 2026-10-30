import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import sessionService from '../services/sessionService';

// Async thunks
export const createSession = createAsyncThunk(
  'sessions/create',
  async (sessionData, { rejectWithValue }) => {
    try {
      return await sessionService.createSession(sessionData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create session');
    }
  }
);

export const fetchSessions = createAsyncThunk(
  'sessions/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      return await sessionService.getSessions(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sessions');
    }
  }
);

export const fetchSessionById = createAsyncThunk(
  'sessions/fetchById',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await sessionService.getSessionById(sessionId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch session');
    }
  }
);

export const updateSession = createAsyncThunk(
  'sessions/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await sessionService.updateSession(id, data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update session');
    }
  }
);

export const deleteSession = createAsyncThunk(
  'sessions/delete',
  async (sessionId, { rejectWithValue }) => {
    try {
      await sessionService.deleteSession(sessionId);
      return sessionId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete session');
    }
  }
);

export const activateSession = createAsyncThunk(
  'sessions/activate',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await sessionService.activateSession(sessionId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to activate session');
    }
  }
);

export const deactivateSession = createAsyncThunk(
  'sessions/deactivate',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await sessionService.deactivateSession(sessionId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to deactivate session');
    }
  }
);

export const archiveSession = createAsyncThunk(
  'sessions/archive',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await sessionService.archiveSession(sessionId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to archive session');
    }
  }
);

export const fetchSessionStatistics = createAsyncThunk(
  'sessions/fetchStatistics',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await sessionService.getSessionStatistics(sessionId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }
);

export const fetchSessionDashboard = createAsyncThunk(
  'sessions/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await sessionService.getSessionDashboard();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

export const markPromotionCompleted = createAsyncThunk(
  'sessions/markPromotionCompleted',
  async (sessionId, { rejectWithValue }) => {
    try {
      return await sessionService.markPromotionCompleted(sessionId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark promotion completed');
    }
  }
);

// Initial state
const initialState = {
  sessions: [],
  currentSession: null,
  dashboard: null,
  statistics: null,
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 0,
    total: 0,
  },
  loading: false,
  error: null,
  filter: {
    status: '',
    search: '',
    academicYear: '',
    isArchived: false,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
};

// Slice
const sessionSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
      state.pagination.page = 1;
    },
    resetFilter: (state) => {
      state.filter = initialState.filter;
      state.pagination.page = 1;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
  },
  extraReducers: (builder) => {
    // Create Session
    builder
      .addCase(createSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions.unshift(action.payload);
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Sessions
    builder
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Session By ID
    builder
      .addCase(fetchSessionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(fetchSessionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Session
    builder
      .addCase(updateSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sessions.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
        state.currentSession = action.payload;
      })
      .addCase(updateSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Session
    builder
      .addCase(deleteSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = state.sessions.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Activate Session
    builder
      .addCase(activateSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateSession.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sessions.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
        state.currentSession = action.payload;
      })
      .addCase(activateSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Deactivate Session
    builder
      .addCase(deactivateSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deactivateSession.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sessions.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
        state.currentSession = action.payload;
      })
      .addCase(deactivateSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Archive Session
    builder
      .addCase(archiveSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(archiveSession.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sessions.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
        state.currentSession = action.payload;
      })
      .addCase(archiveSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Statistics
    builder
      .addCase(fetchSessionStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchSessionStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Dashboard
    builder
      .addCase(fetchSessionDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchSessionDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Mark Promotion Completed
    builder
      .addCase(markPromotionCompleted.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markPromotionCompleted.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sessions.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
        state.currentSession = action.payload;
      })
      .addCase(markPromotionCompleted.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilter, resetFilter, setPagination, clearError, clearCurrentSession } =
  sessionSlice.actions;

// Selectors
export const selectSessions = (state) => state.sessions.sessions;
export const selectCurrentSession = (state) => state.sessions.currentSession;
export const selectDashboard = (state) => state.sessions.dashboard;
export const selectStatistics = (state) => state.sessions.statistics;
export const selectPagination = (state) => state.sessions.pagination;
export const selectLoading = (state) => state.sessions.loading;
export const selectError = (state) => state.sessions.error;
export const selectFilter = (state) => state.sessions.filter;

export default sessionSlice.reducer;