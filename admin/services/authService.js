import api from '../../services/api'

// Auth service for admin authentication APIs.
//
// Cookie-based (Next.js migration): the JWT lives in an httpOnly `admin_token`
// cookie set by the API on login and cleared on logout. It is never stored in
// localStorage and never read by JS — the browser sends it automatically
// (axios `withCredentials: true`). `proxy.js` is the real route gate; these
// helpers only drive the client-side Redux auth state (user profile + flags).
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

  // Login admin user — the API sets the httpOnly cookie; nothing to persist here.
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

  // Logout admin user — the API clears the cookie and blacklists the token.
  async logout() {
    try {
      const response = await api.post('/auth/logout')
      return response.data // Return the complete response with message
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Logout failed'
      )
    }
  }

  // Verify the current session by fetching the profile (cookie sent automatically).
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

  // Change password
  async changePassword(passwordData) {
    try {
      // Try the standard change-password endpoint first
      const response = await api.patch('/auth/change-password', passwordData)
      return response.data
    } catch (error) {
      // If the endpoint doesn't exist (404), try updating via /auth/me
      if (error.response?.status === 404) {
        try {
          const response = await api.patch('/auth/me', passwordData)
          return response.data
        } catch (fallbackError) {
          throw new Error(
            fallbackError.response?.data?.message ||
            fallbackError.message ||
            'Password change failed'
          )
        }
      }

      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Password change failed'
      )
    }
  }
}

// Export singleton instance
export default new AuthService()
