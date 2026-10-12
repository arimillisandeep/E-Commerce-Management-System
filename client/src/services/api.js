import axios from 'axios';
import toast from 'react-hot-toast';

// Reusable API client (Phase 14: single place for all backend calls).
// - Dev: hits the Express server directly (Vite proxies /api as a fallback).
// - Production build without VITE_API_URL: same-origin relative paths
//   (Express serves both the API and the built frontend).
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? '' : 'http://localhost:5000/api'),
});

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling: normalize messages + auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.msg ||
      error.message ||
      'Something went wrong. Please try again.';

    if (error.response?.status === 401 && !error.config._retry) {
      const hadToken = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const msg = hadToken
        ? 'Session expired. Please log in again.'
        : 'Please log in to continue.';
      window.location.href = '/login';
      return Promise.reject({ ...error, message: msg });
    } else if (error.response && error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject({ ...error, message });
  }
);

export default api;
