import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach admin JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('it_admin_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401: clear session and redirect to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('it_admin_token');
      localStorage.removeItem('it_admin_user');
      window.dispatchEvent(new Event('auth:admin_unauthorized'));
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getRequestErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (!error.response) {
      return `Cannot connect to API at ${api.defaults.baseURL}. Ensure backend is running.`;
    }
    return error.response.data?.message || `${fallback} (HTTP ${error.response.status}).`;
  }
  return error instanceof Error ? error.message : fallback;
};

export default api;
