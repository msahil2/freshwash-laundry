// frontend/src/utils/api.js
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (userData) => api.put('/api/auth/profile', userData),
  refreshToken: () => api.post('/api/auth/refresh'),
}

// Services API
export const servicesAPI = {
  getAll: () => api.get('/api/services'),
  getById: (id) => api.get(`/api/services/${id}`),
  getByCategory: (category) => api.get(`/api/services/category/${category}`),
  create: (serviceData) => api.post('/api/services', serviceData),
  update: (id, serviceData) => api.put(`/api/services/${id}`, serviceData),
  delete: (id) => api.delete(`/api/services/${id}`),
}

// Orders API
export const ordersAPI = {
  create: (orderData) => api.post('/api/orders', orderData),
  getAll: () => api.get('/api/orders'),
  getById: (id) => api.get(`/api/orders/${id}`),
  getUserOrders: () => api.get('/api/orders/myorders'),
  updateStatus: (id, status) => api.put(`/api/orders/${id}/status`, { status }),
  cancel: (id) => api.put(`/api/orders/${id}/cancel`),

}

// Payment API
export const paymentAPI = {
  createPaymentIntent: (orderData) => api.post('/api/payments/create-payment-intent', orderData),
  confirmPayment: (paymentIntentId) => api.post('/api/payments/confirm', { paymentIntentId }),
  getPaymentHistory: () => api.get('/api/payments/history'),
}

// Feedback API
export const feedbackAPI = {
  create: (feedbackData) => api.post('/api/feedback', feedbackData),
  getAll: () => api.get('/api/feedback'),
  getByService: (serviceId) => api.get(`/api/feedback/service/${serviceId}`),
  update: (id, feedbackData) => api.put(`/api/feedback/${id}`, feedbackData),
  delete: (id) => api.delete(`/api/feedback/${id}`),
}

// Contact API
export const contactAPI = {
  sendMessage: (messageData) => api.post('/api/contact', messageData),
  getMessages: () => api.get('/api/contact'),
  markAsRead: (id) => api.put(`/api/contact/${id}/read`),
}

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/api/admin/stats'),
  getAllUsers: () => api.get('/api/admin/users'),
  getUserById: (id) => api.get(`/api/admin/users/${id}`),
  updateUser: (id, userData) => api.put(`/api/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  getAllOrders: () => api.get('/api/admin/orders'),
  updateOrderStatus: (id, status) => api.put(`/api/admin/orders/${id}`, { status }),
  getRevenue: (period) => api.get(`/api/admin/revenue?period=${period}`),
}

// Upload API
export const uploadAPI = {
  uploadImage: (formData) => api.post('/api/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
}

// Utility functions
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price)
}

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export const getOrderStatusColor = (status) => {
  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'confirmed': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
  }
  return statusColors[status] || 'bg-gray-100 text-gray-800'
}

export const getServiceTypeDisplayName = (serviceType) => {
  const displayNames = {
    wash: 'Wash',
    iron: 'Iron',
    dryClean: 'Dry Clean',
    washAndIron: 'Wash & Iron',
  }
  return displayNames[serviceType] || serviceType
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone)
}

export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export default api