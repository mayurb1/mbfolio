// Token management utilities
export const TOKEN_EXPIRY_CHECK_INTERVAL = 60000 // Check every minute
export const TOKEN_REFRESH_THRESHOLD = 300000 // Refresh if expires within 5 minutes

// Decode JWT token to get expiration time
export const decodeToken = (token) => {
  try {
    if (!token) return null
    
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

// Check if token is expired or will expire soon
export const isTokenExpired = (token, threshold = 0) => {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true
  
  const now = Date.now()
  const expiry = decoded.exp * 1000 // Convert to milliseconds
  
  return (expiry - now) <= threshold
}

// Get time until token expires (in milliseconds)
export const getTimeUntilExpiry = (token) => {
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return 0
  
  const now = Date.now()
  const expiry = decoded.exp * 1000
  
  return Math.max(0, expiry - now)
}

// Auto-logout when token expires
export const startTokenExpiryCheck = (onExpire) => {
  const checkToken = () => {
    const token = localStorage.getItem('admin_token')
    
    if (!token) {
      onExpire()
      return
    }
    
    if (isTokenExpired(token)) {
      console.log('Token expired, logging out...')
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      onExpire()
      return
    }
    
    // Continue checking
    setTimeout(checkToken, TOKEN_EXPIRY_CHECK_INTERVAL)
  }
  
  // Start checking
  setTimeout(checkToken, TOKEN_EXPIRY_CHECK_INTERVAL)
}

// Clear all token-related storage
export const clearTokenStorage = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
}