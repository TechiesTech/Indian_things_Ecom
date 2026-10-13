import axios from 'axios';

// ADAPT: If your env variable already contains '/api', this normalizes it so '/api' isn't duplicated.
// Default fallback is http://localhost:3000 according to system spec.
const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const API_BASE_URL = normalizedBaseUrl.endsWith('/api')
  ? normalizedBaseUrl
  : `${normalizedBaseUrl}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    // ADAPT: Change 'token' to 'it_admin_token' or your custom token key if your auth stores it differently.
    const token = localStorage.getItem('token') || localStorage.getItem('it_admin_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401 Unauthorized, clear localStorage and redirect to /login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // ADAPT: Add or remove any specific keys you keep in localStorage for admin auth
      localStorage.removeItem('token');
      localStorage.removeItem('it_admin_token');
      localStorage.removeItem('user');
      localStorage.removeItem('it_admin_user');

      // Dispatch custom event in case an active AuthContext is listening
      window.dispatchEvent(new Event('auth:admin_unauthorized'));

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Helper to safely extract human-readable error messages from Axios or generic errors.
 */
export const getRequestErrorMessage = (error, fallback = 'An unexpected error occurred') => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return `Unable to reach the server at ${api.defaults.baseURL}. Please verify your backend is running.`;
    }
    return error.response.data?.message || error.response.data?.error || `${fallback} (HTTP ${error.response.status})`;
  }
  return error instanceof Error ? error.message : fallback;
};

export default api;
