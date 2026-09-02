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
