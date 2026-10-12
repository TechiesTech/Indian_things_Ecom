import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('it_customer_token') || sessionStorage.getItem('it_user_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('it_customer_token');
      localStorage.removeItem('it_customer_user');
      sessionStorage.removeItem('it_user_token');
      // Dispatch a custom event so React contexts can react cleanly
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const getRequestErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (!error.response) {
      return `Cannot connect to the API at ${api.defaults.baseURL}. Make sure the backend is running.`;
    }
    return error.response.data?.message || `${fallback} (HTTP ${error.response.status}).`;
  }
  return error instanceof Error ? error.message : fallback;
};

export default api;
