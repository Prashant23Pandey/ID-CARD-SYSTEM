import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import promotionService from '../services/promotionService';

// Async thunks
export const promoteStudent = createAsyncThunk(
  'promotions/promoteStudent',
  async (promotionData, { rejectWithValue }) => {
    try {
      return await promotionService.promoteStudent(promotionData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to promote student');
    }
  }
);

export const bulkPromoteStudents = createAsyncThunk(
  'promotions/bulkPromoteStudents',
  async (bulkData, { rejectWithValue }) => {
    try {
      return await promotionService.bulkPromoteStudents(bulkData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk promote students');
    }
  }
);

export const promoteClass = createAsyncThunk(
  'promotions/promoteClass',
  async (classData, { rejectWithValue }) => {
    try {
      return await promotionService.promoteClass(classData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to promote class');
    }
  }
);

export const promoteSchool = createAsyncThunk(
  'promotions/promoteSchool',
  async (schoolData, { rejectWithValue }) => {
    try {
      return await promotionService.promoteSchool(schoolData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to promote school');
    }
  }
);

export const fetchPromotionHistory = createAsyncThunk(
  'promotions/fetchHistory',
  async (params, { rejectWithValue }) => {
    try {
      return await promotionService.getPromotionHistory(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch promotion history');
    }
  }
);

export const fetchStudentPromotionHistory = createAsyncThunk(
  'promotions/fetchStudentHistory',
  async ({ studentId, params }, { rejectWithValue }) => {
    try {
      return await promotionService.getStudentPromotionHistory(studentId, params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch student history');
    }
  }
);

export const fetchPromotionPreview = createAsyncThunk(
  'promotions/fetchPreview',
  async (params, { rejectWithValue }) => {
    try {
      return await promotionService.getPromotionPreview(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch promotion preview');
    }
  }
);

export const fetchPromotionReport = createAsyncThunk(
  'promotions/fetchReport',
  async (params, { rejectWithValue }) => {
    try {
      return await promotionService.getPromotionReport(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch promotion report');
    }
  }
);

export const rollbackPromotion = createAsyncThunk(
  'promotions/rollback',
  async ({ promotionId, reason }, { rejectWithValue }) => {
    try {
      return await promotionService.rollbackPromotion(promotionId, reason);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rollback promotion');
    }
  }
);

export const rollbackBatchPromotion = createAsyncThunk(
  'promotions/rollbackBatch',
  async ({ batchId, reason }, { rejectWithValue }) => {
    try {
      return await promotionService.rollbackBatchPromotion(batchId, reason);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rollback batch');
    }
  }
);

// Initial state
const initialState = {
  history: [],
  studentHistory: [],
  preview: null,
  report: null,
  currentPromotion: null,
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 0,
    total: 0,
  },
  loading: false,
  error: null,
  filter: {
    studentId: '',
    sessionId: '',
    promotionStatus: '',
    sortBy: 'promotionDate',
    sortOrder: 'desc',
  },
};

// Slice
const promotionSlice = createSlice({
  name: 'promotions',
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
    clearPreview: (state) => {
      state.preview = null;
    },
    clearReport: (state) => {
      state.report = null;
    },
  },
  extraReducers: (builder) => {
    // Promote Student
    builder
      .addCase(promoteStudent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(promoteStudent.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPromotion = action.payload;
      })
      .addCase(promoteStudent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Bulk Promote Students
    builder
      .addCase(bulkPromoteStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkPromoteStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPromotion = action.payload;
      })
      .addCase(bulkPromoteStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Promote Class
    builder
      .addCase(promoteClass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(promoteClass.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPromotion = action.payload;
      })
      .addCase(promoteClass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Promote School
    builder
      .addCase(promoteSchool.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(promoteSchool.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPromotion = action.payload;
      })
      .addCase(promoteSchool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Promotion History
    builder
      .addCase(fetchPromotionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload.data;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          totalPages: action.payload.totalPages,
          total: action.payload.total,
        };
      })
      .addCase(fetchPromotionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Student Promotion History
    builder
      .addCase(fetchStudentPromotionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentPromotionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.studentHistory = action.payload.data;
      })
      .addCase(fetchStudentPromotionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Promotion Preview
    builder
      .addCase(fetchPromotionPreview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotionPreview.fulfilled, (state, action) => {
        state.loading = false;
        state.preview = action.payload;
      })
      .addCase(fetchPromotionPreview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Promotion Report
    builder
      .addCase(fetchPromotionReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotionReport.fulfilled, (state, action) => {
        state.loading = false;
        state.report = action.payload;
      })
      .addCase(fetchPromotionReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Rollback Promotion
    builder
      .addCase(rollbackPromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rollbackPromotion.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(rollbackPromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Rollback Batch Promotion
    builder
      .addCase(rollbackBatchPromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rollbackBatchPromotion.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(rollbackBatchPromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilter, resetFilter, setPagination, clearError, clearPreview, clearReport } =
  promotionSlice.actions;

// Selectors
export const selectPromotionHistory = (state) => state.promotions.history;
export const selectStudentPromotionHistory = (state) => state.promotions.studentHistory;
export const selectPromotionPreview = (state) => state.promotions.preview;
export const selectPromotionReport = (state) => state.promotions.report;
export const selectCurrentPromotion = (state) => state.promotions.currentPromotion;
export const selectPagination = (state) => state.promotions.pagination;
export const selectLoading = (state) => state.promotions.loading;
export const selectError = (state) => state.promotions.error;
export const selectFilter = (state) => state.promotions.filter;

export default promotionSlice.reducer;