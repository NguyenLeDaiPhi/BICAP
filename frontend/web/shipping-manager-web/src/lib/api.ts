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
  getShipments: () => api.get('/api/shipments'),
  getShipmentById: (id: number) => api.get(`/api/shipments/${id}`),
  createShipment: (data: any) => api.post('/api/shipments', data),
  assignDriver: (shipmentId: number, driverId: number, vehicleId: number) =>
    api.put(`/api/shipments/${shipmentId}/assign?driverId=${driverId}&vehicleId=${vehicleId}`),
  updateStatus: (shipmentId: number, status: string) =>
    api.put(`/api/shipments/${shipmentId}/status?status=${status}`),
  cancelShipment: (id: number) => api.delete(`/api/shipments/${id}`),
};

// Driver API
export const driverApi = {
  getDrivers: () => api.get('/api/drivers'),
  getDriverById: (id: number) => api.get(`/api/drivers/${id}`),
  createDriver: (data: any) => api.post('/api/drivers', data),
  updateDriver: (id: number, data: any) => api.put(`/api/drivers/${id}`, data),
  deleteDriver: (id: number) => api.delete(`/api/drivers/${id}`),
};

// Vehicle API
export const vehicleApi = {
  getVehicles: () => api.get('/api/vehicles'),
  getVehicleById: (id: number) => api.get(`/api/vehicles/${id}`),
  createVehicle: (data: any) => api.post('/api/vehicles', data),
  updateVehicle: (id: number, data: any) => api.put(`/api/vehicles/${id}`, data),
  deleteVehicle: (id: number) => api.delete(`/api/vehicles/${id}`),
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
