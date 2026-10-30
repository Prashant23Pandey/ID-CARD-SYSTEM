import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

class PromotionService {
  /**
   * Promote a single student
   */
  async promoteStudent(promotionData) {
    const response = await axiosInstance.post('/promotions/student', promotionData);
    return response.data.data;
  }

  /**
   * Bulk promote multiple students
   */
  async bulkPromoteStudents(bulkData) {
    const response = await axiosInstance.post('/promotions/bulk-students', bulkData);
    return response.data.data;
  }

  /**
   * Promote entire class
   */
  async promoteClass(classData) {
    const response = await axiosInstance.post('/promotions/class', classData);
    return response.data.data;
  }

  /**
   * Promote entire school
   */
  async promoteSchool(schoolData) {
    const response = await axiosInstance.post('/promotions/school', schoolData);
    return response.data.data;
  }

  /**
   * Get promotion history with filters
   */
  async getPromotionHistory(params) {
    const response = await axiosInstance.get('/promotions/history', { params });
    return response.data;
  }

  /**
   * Get student promotion history
   */
  async getStudentPromotionHistory(studentId, params) {
    const response = await axiosInstance.get(`/promotions/student/${studentId}/history`, { params });
    return response.data;
  }

  /**
   * Get promotion preview
   */
  async getPromotionPreview(params) {
    const response = await axiosInstance.get('/promotions/preview', { params });
    return response.data.data;
  }

  /**
   * Get promotion report
   */
  async getPromotionReport(params) {
    const response = await axiosInstance.get('/promotions/report', { params });
    return response.data.data;
  }

  /**
   * Rollback single promotion
   */
  async rollbackPromotion(promotionId, reason) {
    const response = await axiosInstance.post(`/promotions/${promotionId}/rollback`, {
      reason,
    });
    return response.data.data;
  }

  /**
   * Rollback batch promotion
   */
  async rollbackBatchPromotion(batchId, reason) {
    const response = await axiosInstance.post('/promotions/batch/rollback', {
      batchPromotionId: batchId,
      reason,
    });
    return response.data.data;
  }
}

export default new PromotionService();