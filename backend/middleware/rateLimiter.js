const rateLimit = require('express-rate-limit')

// General API rate limiting - 300 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting in development for easier testing
    return process.env.NODE_ENV !== 'production'
  }
})

// Strict rate limiting for authentication endpoints - 5 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: {
    error: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => {
    // Skip rate limiting in development for easier testing
    return process.env.NODE_ENV !== 'production'
  }
})

// File upload rate limiting - 50 uploads per hour per IP
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 upload requests per hour
  message: {
    error: 'Too many file upload attempts from this IP, please try again after 1 hour.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development for easier testing
    return process.env.NODE_ENV !== 'production'
  }
})

// Public API rate limiting for master data - 300 requests per 15 minutes per IP (more lenient for public data)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.',
    code: 'PUBLIC_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development for easier testing
    return process.env.NODE_ENV !== 'production'
  }
})

// Strict rate limiting for sensitive operations - 3 attempts per 15 minutes per IP
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    error: 'Too many attempts from this IP, please try again after 15 minutes.',
    code: 'STRICT_RATE_LIMIT_EXCEEDED',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting in development for easier testing
    return process.env.NODE_ENV !== 'production'
  }
})

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  publicLimiter,
  strictLimiter
}