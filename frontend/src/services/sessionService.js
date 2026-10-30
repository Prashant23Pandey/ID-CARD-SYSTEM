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

class SessionService {
  /**
   * Create a new session
   */
  async createSession(sessionData) {
    const response = await axiosInstance.post('/sessions', sessionData);
    return response.data.data;
  }

  /**
   * Get all sessions with pagination and filters
   */
  async getSessions(params) {
    const response = await axiosInstance.get('/sessions', { params });
    return response.data;
  }

  /**
   * Get session by ID
   */
  async getSessionById(sessionId) {
    const response = await axiosInstance.get(`/sessions/${sessionId}`);
    return response.data.data;
  }

  /**
   * Update session
   */
  async updateSession(sessionId, data) {
    const response = await axiosInstance.put(`/sessions/${sessionId}`, data);
    return response.data.data;
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId) {
    const response = await axiosInstance.delete(`/sessions/${sessionId}`);
    return response.data;
  }

  /**
   * Activate session
   */
  async activateSession(sessionId) {
    const response = await axiosInstance.patch(`/sessions/${sessionId}/activate`);
    return response.data.data;
  }

  /**
   * Deactivate session
   */
  async deactivateSession(sessionId) {
    const response = await axiosInstance.patch(`/sessions/${sessionId}/deactivate`);
    return response.data.data;
  }

  /**
   * Archive session
   */
  async archiveSession(sessionId) {
    const response = await axiosInstance.patch(`/sessions/${sessionId}/archive`);
    return response.data.data;
  }

  /**
   * Get session statistics
   */
  async getSessionStatistics(sessionId) {
    const response = await axiosInstance.get(`/sessions/${sessionId}/statistics`);
    return response.data.data;
  }

  /**
   * Get session dashboard
   */
  async getSessionDashboard() {
    const response = await axiosInstance.get('/sessions/dashboard/overview');
    return response.data.data;
  }

  /**
   * Mark promotion as completed
   */
  async markPromotionCompleted(sessionId) {
    const response = await axiosInstance.patch(
      `/sessions/${sessionId}/mark-promotion-completed`
    );
    return response.data.data;
  }

  /**
   * Reset promotion status
   */
  async resetPromotionStatus(sessionId) {
    const response = await axiosInstance.patch(
      `/sessions/${sessionId}/reset-promotion`
    );
    return response.data.data;
  }
}

export default new SessionService();