import api from './api';

export const createGroupRequest = ({ name, description }) =>
  api.post('/groups', { name, description });

export const fetchMyGroup = () => api.get('/groups/mine');

export const updateGroupRequest = ({ name, description }) =>
  api.patch('/groups/mine', { name, description });

export const deleteGroupRequest = () => api.delete('/groups/mine');

export const leaveGroupRequest = () => api.post('/groups/mine/leave');

export const addMemberRequest = (identifier) =>
  api.post('/groups/mine/members', { identifier });

export const removeMemberRequest = (userId) =>
  api.delete(`/groups/mine/members/${userId}`);

// --- Admin ---
export const fetchAllGroupsAdmin = () => api.get('/admin/groups');
