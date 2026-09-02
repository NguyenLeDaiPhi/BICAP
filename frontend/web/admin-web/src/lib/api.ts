import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
  register: (data: any) =>
    api.post('/api/auth/register', data),
  refreshToken: (refreshToken: string) =>
    api.post('/api/auth/refresh-token', { refreshToken }),
  logout: () =>
    api.post('/api/auth/logout'),
};

// Admin API
export const adminApi = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getUsers: () => api.get('/api/admin/users'),
  getFarms: () => api.get('/api/admin/farms'),
  approveFarm: (farmId: number) => api.put(`/api/admin/farms/${farmId}/approve`),
  rejectFarm: (farmId: number) => api.put(`/api/admin/farms/${farmId}/reject`),
  getProducts: () => api.get('/api/admin/products'),
  getOrders: () => api.get('/api/admin/orders'),
  getStatistics: () => api.get('/api/admin/statistics'),
};

export default api;
