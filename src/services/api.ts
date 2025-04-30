import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
    console.error('API Error:', error.message, error.config);
    return Promise.reject(error);
  },
);
  
export default api;