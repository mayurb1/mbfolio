import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:10000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (works for both admin and regular auth)
    const adminToken = localStorage.getItem('admin_token')
    const userToken = localStorage.getItem('auth_token') // if you have regular user auth
    
    // Prioritize admin token for admin routes
    const token = config.url?.includes('/admin/') ? adminToken : (adminToken || userToken)
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (error.config?.url?.includes('/admin/')) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        window.location.href = '/admin/login'
      } else {
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default api