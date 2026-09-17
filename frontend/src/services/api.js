import axios from 'axios';

// Backend API URL
const baseURL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every protected API request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      '[api error]',
      error?.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export default api;