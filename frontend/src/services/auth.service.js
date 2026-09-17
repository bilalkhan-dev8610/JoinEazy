import api from './api';

export const registerRequest = ({ fullName, email, password }) =>
  api.post('/auth/register', { fullName, email, password });

export const loginRequest = ({ email, password }) =>
  api.post('/auth/login', { email, password });

export const logoutRequest = () => api.post('/auth/logout');

export const fetchProfile = () => api.get('/auth/profile');
