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
    api.post('/api/auth/login', { email, password, clientId: 'farm' }),
  register: (data: any) =>
    api.post('/api/auth/register', data),
  getProfile: () =>
    api.get('/api/auth/profile'),
};

// Farm API
export const farmApi = {
  getMyFarm: () => api.get('/api/farms/my'),
  createFarm: (data: any) => api.post('/api/farms', data),
  updateFarm: (id: number, data: any) => api.put(`/api/farms/${id}`, data),
  getSeasons: () => api.get('/api/farms/seasons'),
  createSeason: (data: any) => api.post('/api/farms/seasons', data),
  updateSeason: (id: number, data: any) => api.put(`/api/farms/seasons/${id}`, data),
  getProcesses: (seasonId: number) => api.get(`/api/farms/seasons/${seasonId}/processes`),
  createProcess: (seasonId: number, data: any) => 
    api.post(`/api/farms/seasons/${seasonId}/processes`, data),
};

// Product API
export const productApi = {
  getMyProducts: () => api.get('/api/products/my'),
  createProduct: (data: any) => api.post('/api/products', data),
  updateProduct: (id: number, data: any) => api.put(`/api/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/api/products/${id}`),
};

// Trading API
export const tradingApi = {
  getMyListings: () => api.get('/api/trading/my-listings'),
  createListing: (data: any) => api.post('/api/trading/listings', data),
  updateListing: (id: number, data: any) => api.put(`/api/trading/listings/${id}`, data),
  deleteListing: (id: number) => api.delete(`/api/trading/listings/${id}`),
};

// Order API
export const orderApi = {
  getOrders: () => api.get('/api/orders/my'),
  acceptOrder: (id: number) => api.put(`/api/orders/${id}/accept`),
  rejectOrder: (id: number) => api.put(`/api/orders/${id}/reject`),
  getOrderDetails: (id: number) => api.get(`/api/orders/${id}`),
};

// IoT API
export const iotApi = {
  getData: (farmId: number) => api.get(`/api/iot/farm/${farmId}`),
  getAlerts: () => api.get('/api/iot/alerts'),
};

// Notification API
export const notificationApi = {
  getMyNotifications: () => api.get('/api/notifications/me'),
  getUnreadCount: () => api.get('/api/notifications/me/unread/count'),
  markAsRead: (id: number) => api.put(`/api/notifications/${id}/read`),
};

export default api;
