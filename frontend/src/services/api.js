import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Product API
export const getProducts = () => api.get('/products');
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (productData) => api.post('/products', productData);
export const updateProduct = (id, productData) => api.put(`/products/${id}`, productData);
export const updateStock = (id, stockData) => api.patch(`/products/${id}/stock`, stockData);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Supplier Reorder API
export const getReorders = () => api.get('/reorders');
export const getReorderById = (id) => api.get(`/reorders/${id}`);
export const requestReorderOTP = (id) => api.post(`/reorders/${id}/request-otp`);
export const approveReorderOTP = (id, otpCode) => api.post(`/reorders/${id}/approve-otp`, { otp_code: otpCode });

// Audit Logs & Exports
export const getAuditLogs = () => api.get('/audit-logs');
export const exportProductsCSVUrl = '/api/export/products/csv';
export const exportReordersCSVUrl = '/api/export/reorders/csv';

export default api;
