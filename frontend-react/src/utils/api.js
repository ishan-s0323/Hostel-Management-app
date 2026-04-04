import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response && err.response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    throw err.response ? err.response.data : new Error('Network Error');
  }
);

export default api;
