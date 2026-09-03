import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
    api.post('/api/auth/login', { email, password, clientId: 'retailer' }),
  register: (data: any) =>
    api.post('/api/auth/register', data),
};

// Trading API (Public)
export const tradingApi = {
  getProducts: (params?: any) => api.get('/api/trading/products', { params }),
  getProductById: (id: number) => api.get(`/api/trading/products/${id}`),
  searchProducts: (query: string) => api.get('/api/trading/products/search', { params: { q: query } }),
};

// Product API
export const productApi = {
  getProducts: (params?: any) => api.get('/api/products', { params }),
};

// Order API
export const orderApi = {
  createOrder: (data: any) => api.post('/api/orders', data),
  getMyOrders: () => api.get('/api/orders/my'),
  getOrderById: (id: number) => api.get(`/api/orders/${id}`),
  cancelOrder: (id: number) => api.put(`/api/orders/${id}/cancel`),
};

// Payment API
export const paymentApi = {
  createPayment: (data: any) => api.post('/api/payments', data),
  getPaymentsByOrder: (orderId: number) => api.get(`/api/payments/order/${orderId}`),
};

// Traceability API (Public)
export const traceApi = {
  getTraceability: (traceCode: string) => api.get(`/api/trace/${traceCode}`),
};

// Notification API
export const notificationApi = {
  getMyNotifications: () => api.get('/api/notifications/me'),
  getUnreadCount: () => api.get('/api/notifications/me/unread/count'),
  markAsRead: (id: number) => api.put(`/api/notifications/${id}/read`),
};

export default api;
