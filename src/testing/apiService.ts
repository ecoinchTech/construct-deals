// services/apiService.js
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL:  'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken
        });
        
        const { token, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { resetToken: token, password })
};

// Vendor APIs
export const vendorAPI = {
  createProfile: (profileData) => api.post('/vendors', profileData),
  getProfile: () => api.get('/vendors/me'),
  updateProfile: (profileData) => api.put('/vendors/me', profileData),
  uploadKYCDocuments: (formData) => api.post('/vendors/me/kyc-documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  enableProductCapability: (data) => api.post('/vendors/enable-products', data),
  disableProductCapability: () => api.post('/vendors/disable-products'),
  getVendors: (params) => api.get('/vendors', { params }),
  getVendor: (id) => api.get(`/vendors/${id}`)
};

// Product Category APIs
export const productCategoryAPI = {
  getCategories: () => api.get('/product-categories'),
  getCategoryTree: () => api.get('/product-categories/tree'),
  getCategory: (id) => api.get(`/product-categories/${id}`)
};

// Product APIs
export const productAPI = {
  createProduct: (productData) => api.post('/products', productData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  uploadProductImages: (id, formData) => api.post(`/products/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  addProductVariant: (id, variantData) => api.post(`/products/${id}/variants`, variantData),
  updateProductVariant: (id, variantId, variantData) => api.put(`/products/${id}/variants/${variantId}`, variantData),
  deleteProductVariant: (id, variantId) => api.delete(`/products/${id}/variants/${variantId}`)
};

// Cart APIs
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (itemData) => api.post('/cart', itemData),
  updateCartItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart'),
  applyCoupon: (couponCode) => api.post('/cart/apply-coupon', { couponCode })
};

// Order APIs
export const orderAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  cancelOrder: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  updateTracking: (id, trackingNumber) => api.post(`/orders/${id}/track`, { trackingNumber }),
  getTracking: (id) => api.get(`/orders/${id}/track`),
  addOrderReview: (id, reviewData) => api.post(`/orders/${id}/review`, reviewData),
  getOrderInvoice: (id) => api.get(`/orders/${id}/invoice`)
};

// Profile APIs
export const profileAPI = {
  getUserProfile: () => api.get('/profiles'),
  switchCapability: (capability) => api.post('/profiles/switch-capability', { capability }),
  updatePreferences: (preferences) => api.put('/profiles/preferences', { preferences })
};

// Category APIs (for services)
export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  getCategoryTree: () => api.get('/categories/tree')
};

export default api;