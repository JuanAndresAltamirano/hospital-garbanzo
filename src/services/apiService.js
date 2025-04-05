import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiService = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Helper methods for auth token management
apiService.setAuthToken = (token) => {
  if (token) {
    apiService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiService.defaults.headers.common['Authorization'];
  }
};

apiService.removeAuthToken = () => {
  delete apiService.defaults.headers.common['Authorization'];
};

const login = async (credentials) => {
  try {
    const response = await apiService.post('/auth/login', credentials);
    const token = response.data.token || response.data.access_token;
    if (token) {
      localStorage.setItem('token', token);
      return response.data;
    }
    throw new Error('No token received from server');
  } catch (error) {
    throw error;
  }
};

const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/admin';
};

export { apiService, login, logout }; 