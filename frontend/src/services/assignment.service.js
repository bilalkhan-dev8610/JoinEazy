import api from './api';

// --- Admin ---
export const createAssignmentRequest = (payload) => api.post('/assignments', payload);

export const updateAssignmentRequest = (id, payload) => api.patch(`/assignments/${id}`, payload);

export const fetchAssignments = () => api.get('/assignments');

export const fetchAssignment = (id) => api.get(`/assignments/${id}`);

// --- Student ---
export const fetchMyAssignments = () => api.get('/students/assignments');
