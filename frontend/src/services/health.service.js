import api from './api';

/**
 * Calls the backend health check endpoint. Used to verify the
 * frontend -> backend -> database chain is wired correctly.
 */
export const getHealth = () => api.get('/health');
