import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://employeeportal-rjyw.onrender.com/api',
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If token is expired, logout automatically
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login:  (data) => api.post('/auth/login', data),
};

export const employeeAPI = {
  getAll:         (params) => api.get('/employees', { params }),
  getOne:         (id)     => api.get(`/employees/${id}`),
  create:         (form)   => api.post('/employees', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:         (id, form) => api.put(`/employees/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:         (id)     => api.delete(`/employees/${id}`),
  getStats:       ()       => api.get('/employees/stats'),
  getDeleteHistory: ()     => api.get('/employees/delete-history'),
};