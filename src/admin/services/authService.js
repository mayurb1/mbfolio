import api from '../../services/api'

// Auth service for admin authentication APIs
class AuthService {
  // Check if registration is allowed
  async checkRegistrationStatus() {
    try {
      const response = await api.get('/auth/registration-status')
      return response.data // Returns { data: { isRegistrationAllowed, adminExists }, message, status }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to check registration status'
      )
    }
  }

  // Register admin user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData)
      return response.data // Returns { data: user, message, status }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Registration failed. Please try again.'
      )
    }
  }

  // Login admin user
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data // Returns { data: { token, user }, message, status }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Login failed. Please try again.'
      )
    }
  }

  // Logout admin user
  async logout() {
    try {
      // Call logout endpoint to invalidate token on server
      const response = await api.post('/auth/logout')
      
      // Clear stored tokens after successful server logout
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      
      return response.data // Return the complete response with message
    } catch (error) {
      // Even if API call fails, clear local storage for security
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Logout failed'
      )
    }
  }

  // Verify current token
  async verifyToken() {
    try {
      const response = await api.get('/auth/me')
      return response.data // Returns { data: { user }, message, status }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Token verification failed'
      )
    }
  }

  // Refresh auth token
  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh')
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Token refresh failed'
      )
    }
  }

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Password change failed'
      )
    }
  }

  // Get stored auth data from localStorage
  getStoredAuth() {
    try {
      const token = localStorage.getItem('admin_token')
      const userData = localStorage.getItem('admin_user')
      
      if (token && userData) {
        return {
          token,
          user: JSON.parse(userData)
        }
      }
      
      return null
    } catch (error) {
      // Clear invalid data
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      return null
    }
  }

  // Store auth data in localStorage
  storeAuth(token, user) {
    try {
      localStorage.setItem('admin_token', token)
      localStorage.setItem('admin_user', JSON.stringify(user))
      return true
    } catch (error) {
      console.error('Failed to store auth data:', error)
      return false
    }
  }

  // Clear stored auth data
  clearStoredAuth() {
    try {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      return true
    } catch (error) {
      console.error('Failed to clear auth data:', error)
      return false
    }
  }
}

// Export singleton instance
export default new AuthService()