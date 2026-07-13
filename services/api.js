import axios from 'axios'

// Same-origin API client. Since the backend is folded into this Next.js app,
// the base URL is relative ('/api') and auth flows via the httpOnly cookie
// (sent automatically with withCredentials) — no Bearer header injection.
const api = axios.create({
  baseURL: '/api',
  timeout: process.env.NODE_ENV === 'production' ? 60000 : 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Response interceptor: on 401, bounce to the appropriate login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== 'undefined' &&
      error.response?.status === 401 &&
      !window.location.pathname.includes('/login')
    ) {
      if (window.location.pathname.includes('/admin')) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
