import axios from 'axios';
import { ST_TOKEN_KEY, ST_USER_KEY } from '../utils/constants';

/**
 * Axios instance pre-configured for the Study Tracker API.
 * The Vite dev server proxies /api → http://localhost:5000
 */
const api = axios.create({
  // Use VITE_API_URL if set, otherwise empty for Dev proxy
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ST_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401, dispatch global event that AuthContext will pick up for seamless routing
    if (error.response?.status === 401) {
      localStorage.removeItem(ST_TOKEN_KEY);
      localStorage.removeItem(ST_USER_KEY);
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
