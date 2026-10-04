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

// Product API - Kết nối với product-service
export const productApi = {
  // Lấy tất cả sản phẩm
  getAllProducts: () => api.get('/api/products'),
  // Lấy sản phẩm của trang trại hiện tại
  getMyProducts: () => api.get('/api/products/my'),
  // Lấy sản phẩm theo farmId
  getProductsByFarm: (farmId: number) => api.get(`/api/products/farm/${farmId}`),
  // Tạo sản phẩm mới
  createProduct: (data: any) => api.post('/api/products', data),
  uploadProductImage: (id: number, file: File) => {
    const body = new FormData(); body.append('file', file);
    return api.post('/api/products/' + id + '/images', body, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  // Cập nhật sản phẩm
  updateProduct: (id: number, data: any) => api.put(`/api/products/${id}`, data),
  // Xóa sản phẩm (soft delete)
  deleteProduct: (id: number) => api.delete(`/api/products/${id}`),
  // Lấy sản phẩm theo ID
  getProductById: (id: number) => api.get(`/api/products/${id}`),
};

// Farm Production API - Kết nối với farm-production-service qua Kong routes
export interface CreateFarmingProcessRequest {
  processType: string;
  description: string;
  performedDate: string;
}

export const farmProductionApi = {
  // Lấy danh sách mùa vụ (GET /api/production-batches)
  getSeasons: () => api.get('/api/production-batches'),
  
  // Tạo mùa vụ mới (POST /api/production-batches)
  createSeason: (data: any) => api.post('/api/production-batches', data),
  
  // Lấy chi tiết mùa vụ (GET /api/production-batches/{id})
  getSeasonById: (id: number) => api.get(`/api/production-batches/${id}`),
  
  // Lấy chi tiết mùa vụ với process và export (GET /api/production-batches/{id}/detail)
  getSeasonDetail: (id: number) => api.get(`/api/production-batches/${id}/detail`),
  
  // Cập nhật mùa vụ (PUT /api/production-batches/{id})
  updateSeason: (id: number, data: any) => api.put(`/api/production-batches/${id}`, data),
  
  // Xóa mùa vụ (DELETE /api/production-batches/{id})
  deleteSeason: (id: number) => api.delete(`/api/production-batches/${id}`),
  
  // Lấy mùa vụ theo farm (GET /api/production-batches/farm/{farmId})
  getSeasonsByFarm: (farmId: number) => api.get(`/api/production-batches/farm/${farmId}`),
  
  // Lấy marketplace products
  getMarketplaceProducts: (farmId: number) => api.get(`/api/marketplace-products/farm/${farmId}`),
  
  // Tạo marketplace product
  createMarketplaceProduct: (data: any) => api.post('/api/marketplace-products', data),
  
  // Cập nhật marketplace product
  updateMarketplaceProduct: (id: number, data: any) => api.put(`/api/marketplace-products/${id}`, data),
  
  // Xóa marketplace product
  deleteMarketplaceProduct: (id: number) => api.delete(`/api/marketplace-products/${id}`),
  
  // Tạo nhật ký canh tác (farming process)
  createProcess: (seasonId: number, data: CreateFarmingProcessRequest) => api.post(`/api/farming-processes/batch/${seasonId}`, data),
  
  // Lấy nhật ký canh tác
  getProcesses: (seasonId: number) => api.get(`/api/farming-processes/batch/${seasonId}`),
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
