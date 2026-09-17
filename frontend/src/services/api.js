import axios from 'axios';

// Base URL is read from an env var so it can differ between local dev,
// docker-compose, and any future deployment target.
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  // Auth is cookie-based (httpOnly JWT cookie set by the backend), so
  // every request needs to carry credentials for protected routes to work.
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => config);

// Placeholder response interceptor: centralizes error logging so
// individual pages don't need repeated try/catch boilerplate.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[api error]', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
