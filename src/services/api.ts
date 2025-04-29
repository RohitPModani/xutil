import axios from 'axios';

const api = axios.create({
  baseURL: 'https://xutil-backend-production.up.railway.app/api',
});
  
  // Add response interceptor for error logging
api.interceptors.response.use(
    (response) => response,
    (error) => {
    console.error('API Error:', error.message, error.config);
    return Promise.reject(error);
  },
);
  
export default api;