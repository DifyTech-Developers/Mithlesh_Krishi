import axios from 'axios';
import store from './store';
import { logout } from './store/slices/authSlice';

const API_BASE_URL = import.meta.env.VITE_BASE_URL ||  'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Public endpoints
export const register = (userData) => api.post('/users/register', userData);
export const login = (credentials) => api.post('/users/login', credentials);
export const adminLogin = (credentials) => api.post('/users/admin/login', credentials);
export const forgotPassword = (phoneNumber) => api.post('/users/forgot-password', { phoneNumber });
export const resetPassword = (data) => api.post('/users/reset-password', data);
export const getAllProducts = () => api.get('/products');
export const searchProducts = (query) => api.get(`/products/search?search=${query}`);
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);

// Protected user endpoints
export const getUserProfile = () => api.get('/users/profile');
export const updateUserProfile = (userData) => api.patch('/users/profile', userData);
export const getUserPurchases = () => api.get('/purchases/user');

// Admin management endpoints
export const getAllUsers = () => api.get('/users');
export const deleteUser = (userId) => api.delete(`/users/${userId}`);
export const updateUserRole = (userId, role) => api.patch(`/users/${userId}/role`, { role });
export const adminRegister = (userData) => api.post('/users/admin/register', userData);

// Admin announcement endpoints
export const broadcastAnnouncement = (data) => api.post('/announcements/broadcast', data);
export const deleteAnnouncement = (id) => api.delete(`/announcements/${id}`);
export const sendPaymentReminders = () => api.post('/announcements/payment-reminders');

// Admin purchase endpoints
export const getPurchases = () => api.get('/purchases');
export const createPurchase = (data) => api.post('/purchases', data);
export const updatePurchaseStatus = (id, data) => api.patch(`/purchases/${id}/status`, data);

// Error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized access
    if (error.response?.status === 401) {
      // Clear auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      store.dispatch(logout());
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle specific error cases
    let errorMessage = 'Something went wrong';
    if (error.response) {
      switch (error.response.status) {
        case 400:
          errorMessage = error.response.data.message || 'Invalid request';
          break;
        case 403:
          errorMessage = 'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = error.response.data.message || 'An error occurred';
      }
    } else if (error.request) {
      errorMessage = 'Network error. Please check your internet connection.';
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;