import axios from 'axios';
import { store } from '../app/store';
import { logout, setCredentials } from '../features/auth/authSlice';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Crucial for sending HttpOnly cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach access token
axiosPrivate.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using the refresh token cookie
        const response = await axiosInstance.post('/auth/refresh-token');
        
        const { accessToken, user } = response.data.data;
        
        // Update Redux state with new token
        store.dispatch(setCredentials({ accessToken, user }));
        
        // Update the header of the failed request and retry
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axiosPrivate(originalRequest);
        
      } catch (refreshError) {
        // Refresh token is expired or invalid
        store.dispatch(logout());
        // Optional: you can redirect to login here, but usually React Router protects routes
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
