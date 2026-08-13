import axios from 'axios';

let envBase = import.meta.env.VITE_API_BASE_URL || '/api';
if (envBase !== '/api') {
  envBase = envBase.replace(/\/+$/, '');
  if (!envBase.endsWith('/api')) {
    envBase += '/api';
  }
}
const API_BASE_URL = envBase;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Authorization Bearer token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config && error.config.url && (
        error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/signup')
      );

      // Only reset session state and reload for protected routes when session has expired
      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login') && localStorage.getItem('token')) {
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);

export const signupUser = async (name, email, password) => {
  console.log('Sending signup request to:', API_BASE_URL + '/auth/signup', { name, email });
  const response = await api.post('/auth/signup', { name, email, password });
  return response.data;
};

export const loginUser = async (email, password) => {
  console.log('Sending login request to:', API_BASE_URL + '/auth/login', { email });
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getProtectedProfile = async () => {
  const response = await api.get('/test/me');
  return response.data;
};

export default api;
