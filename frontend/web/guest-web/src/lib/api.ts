import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Traceability API - Public, no auth required
export const traceApi = {
  getTraceability: (traceCode: string) =>
    api.get(`/api/trace/${traceCode}`),
};

// Product API - Public for browsing
export const productApi = {
  getProducts: (params?: any) =>
    api.get('/api/products', { params }),
  getProductById: (id: number) =>
    api.get(`/api/products/${id}`),
  getProductsByCategory: (categoryId: number) =>
    api.get(`/api/products/category/${categoryId}`),
};

// Trading API - Public for browsing
export const tradingApi = {
  getListings: (params?: any) =>
    api.get('/api/trading/products', { params }),
  getListingById: (id: number) =>
    api.get(`/api/trading/products/${id}`),
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
