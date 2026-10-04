import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
    api.post('/api/auth/login', { email, password, clientId: 'admin' }),
  register: (data: any) =>
    api.post('/api/auth/register', data),
  refreshToken: (refreshToken: string) =>
    api.post('/api/auth/refresh-token', { refreshToken }),
  logout: () =>
    api.post('/api/auth/logout'),
};

// Admin API
export const adminApi = {
  getDashboard: () => api.get('/api/v1/admin/dashboard/stats'),
  getUsers: (params?: { page?: number; size?: number; keyword?: string }) =>
    api.get('/api/v1/admin/users', { params }),
  getFarms: () => api.get('/api/v1/admin/farms'),
  getProducts: (params?: { page?: number; size?: number; keyword?: string }) =>
    api.get('/api/v1/admin/products', { params }),
  approveProduct: (id: number) => api.put(`/api/v1/admin/products/${id}/approve`),
  getOrders: () => api.get('/api/v1/admin/orders'),
};

export default api;

/**
 * Hàm helper trích xuất thông báo lỗi từ response
 * Xử lý nhiều format response khác nhau từ Backend:
 * - { error: "message" } - BICAP Backend format
 * - { message: "message" } - Một số service
 * - Plain string response
 * - Fallback sang err.message
 */
export const getErrorMessage = (err: any): string => {
  // Backend BICAP trả về { error: "..." }
  if (err.response?.data?.error) {
    return err.response.data.error;
  }
  // Một số service trả về { message: "..." }
  if (err.response?.data?.message) {
    return err.response.data.message;
  }
  // Response là string trực tiếp
  if (typeof err.response?.data === 'string') {
    return err.response.data;
  }
  // Fallback sang err.message (sẽ là "Request failed with status code 400" nếu không có các trường trên)
  if (err.message) {
    return err.message;
  }
  return 'Đã xảy ra lỗi không xác định';
};
