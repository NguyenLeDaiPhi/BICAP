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
    api.post('/api/auth/login', { email, password, clientId: 'shippingManager' }),
  register: (data: any) =>
    api.post('/api/auth/register', data),
};

// Shipping API
export const shippingApi = {
  getShipments: () => api.get('/api/shipping/shipments'),
  getShipmentById: (id: number) => api.get(`/api/shipping/shipments/${id}`),
  createShipment: (data: any) => api.post('/api/shipping/shipments', data),
  assignDriver: (shipmentId: number, driverId: number) =>
    api.put(`/api/shipping/shipments/${shipmentId}/assign`, { driverId }),
  updateStatus: (shipmentId: number, status: string) =>
    api.put(`/api/shipping/shipments/${shipmentId}/status`, { status }),
  cancelShipment: (id: number) => api.put(`/api/shipping/shipments/${id}/cancel`),
};

// Driver API
export const driverApi = {
  getDrivers: () => api.get('/api/shipping/drivers'),
  getDriverById: (id: number) => api.get(`/api/shipping/drivers/${id}`),
  createDriver: (data: any) => api.post('/api/shipping/drivers', data),
  updateDriver: (id: number, data: any) => api.put(`/api/shipping/drivers/${id}`, data),
};

// Vehicle API
export const vehicleApi = {
  getVehicles: () => api.get('/api/shipping/vehicles'),
  createVehicle: (data: any) => api.post('/api/shipping/vehicles', data),
  updateVehicle: (id: number, data: any) => api.put(`/api/shipping/vehicles/${id}`, data),
};

// Report API
export const reportApi = {
  getDailyReport: () => api.get('/api/shipping/reports/daily'),
  getMonthlyReport: () => api.get('/api/shipping/reports/monthly'),
};

// Notification API
export const notificationApi = {
  getMyNotifications: () => api.get('/api/notifications/me'),
  getUnreadCount: () => api.get('/api/notifications/me/unread/count'),
  markAsRead: (id: number) => api.put(`/api/notifications/${id}/read`),
};

export default api;
