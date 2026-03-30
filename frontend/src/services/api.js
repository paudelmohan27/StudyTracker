import axios from 'axios';

/**
 * Axios instance pre-configured for the Study Tracker API.
 * The Vite dev server proxies /api → http://localhost:5000
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://studytracker-8x3m.onrender.com',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('st_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401, clear auth data and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('st_token');
      localStorage.removeItem('st_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
