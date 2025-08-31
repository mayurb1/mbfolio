# Backend API Development Best Practices

This document outlines the standardized practices for developing consistent and maintainable APIs for the portfolio project.

## 📋 Table of Contents
1. [Response Structure](#response-structure)
2. [HTTP Status Codes](#http-status-codes)
3. [Error Handling](#error-handling)
4. [Authentication](#authentication)
5. [Validation](#validation)
6. [API Naming Conventions](#api-naming-conventions)
7. [CORS Configuration](#cors-configuration)
8. [Security Best Practices](#security-best-practices)

---

## 🏗️ Response Structure

### **Standardized API Response Format**

All API responses must follow this consistent structure:

```javascript
{
  data?: any,           // Optional: Include only if there's data to return
  message: string,      // Required: Human-readable message
  status: number        // Required: HTTP status code
}
```

### **Examples**

#### **Success Response with Data**
```javascript
// GET /api/auth/me
{
  data: {
    user: {
      id: "64f5a8b9c123456789abcdef",
      name: "John Doe",
      email: "john@example.com"
    }
  },
  message: "User data retrieved successfully",
  status: 200
}
```

#### **Success Response without Data**
```javascript
// DELETE /api/projects/123
{
  message: "Project deleted successfully",
  status: 200
}
```

#### **Error Response**
```javascript
// POST /api/auth/login (invalid credentials)
{
  message: "Invalid credentials",
  status: 400
}
```

#### **Validation Error Response**
```javascript
// POST /api/auth/register (missing fields)
{
  message: "Validation failed",
  status: 400,
  errors: {
    email: "Email is required",
    password: "Password must be at least 8 characters"
  }
}
```

---

## 📊 HTTP Status Codes

### **Standard Status Codes to Use**

| Code | Meaning | Usage |
|------|---------|--------|
| **200** | OK | Successful GET, PUT, PATCH requests |
| **201** | Created | Successful POST requests |
| **204** | No Content | Successful DELETE requests |
| **400** | Bad Request | Validation errors, malformed requests |
| **401** | Unauthorized | Authentication required |
| **403** | Forbidden | Access denied (authenticated but not authorized) |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Resource already exists |
| **422** | Unprocessable Entity | Validation failed |
| **500** | Internal Server Error | Server errors |

### **Implementation Example**
```javascript
// Success Cases
res.status(200).json({ data: result, message: "Success", status: 200 })
res.status(201).json({ data: newUser, message: "User created", status: 201 })

// Error Cases
res.status(400).json({ message: "Invalid request", status: 400 })
res.status(404).json({ message: "User not found", status: 404 })
res.status(500).json({ message: "Server error", status: 500 })
```

---

## ⚠️ Error Handling

### **Consistent Error Messages**
- Use clear, user-friendly error messages
- Avoid exposing internal system details
- Include field-specific errors for validation

### **Error Handler Middleware**
```javascript
const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = {}
    Object.keys(err.errors).forEach(key => {
      errors[key] = err.errors[key].message
    })
    
    return res.status(400).json({
      message: 'Validation failed',
      status: 400,
      errors
    })
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      message: 'Resource already exists',
      status: 409
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token',
      status: 401
    })
  }

  // Default server error
  res.status(500).json({
    message: 'Internal server error',
    status: 500
  })
}

module.exports = errorHandler
```

---

## 🔐 Authentication

### **JWT Token Structure**
```javascript
// Token payload
{
  id: user._id,
  iat: timestamp,
  exp: timestamp
}

// Response after login
{
  data: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    user: {
      id: "64f5a8b9c123456789abcdef",
      name: "John Doe",
      email: "john@example.com"
    }
  },
  message: "Login successful",
  status: 200
}
```

### **Protected Route Middleware**
```javascript
const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({
      message: 'No token provided',
      status: 401
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await Users.findById(decoded.id).select('-password')
    
    if (!user) {
      return res.status(401).json({
        message: 'Invalid token',
        status: 401
      })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      message: 'Invalid token',
      status: 401
    })
  }
}
```

---

## ✅ Validation

### **Input Validation with Joi**
```javascript
const Joi = require('joi')

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
    .required()
})

// Usage in route
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body)
    
    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        status: 400,
        errors: error.details.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message
          return acc
        }, {})
      })
    }

    // Continue with valid data...
  } catch (err) {
    res.status(500).json({
      message: 'Server error',
      status: 500
    })
  }
})
```

---

## 🏷️ API Naming Conventions

### **RESTful URL Structure**
```
GET    /api/users              # Get all users
GET    /api/users/:id          # Get specific user
POST   /api/users              # Create new user
PUT    /api/users/:id          # Update entire user
PATCH  /api/users/:id          # Partial update user
DELETE /api/users/:id          # Delete user

GET    /api/users/:id/projects # Get user's projects
POST   /api/users/:id/projects # Create project for user
```

### **Authentication Routes**
```
POST   /api/auth/register      # User registration
POST   /api/auth/login         # User login
POST   /api/auth/logout        # User logout
GET    /api/auth/me            # Get current user
POST   /api/auth/refresh       # Refresh token
PUT    /api/auth/password      # Change password
POST   /api/auth/forgot        # Forgot password
POST   /api/auth/reset         # Reset password
```

---

## 🌐 CORS Configuration

### **Environment-based CORS Setup**
```javascript
const cors = require('cors')

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com', 'https://www.yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:5173'], // Vite dev server
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

---

## 🔒 Security Best Practices

### **1. Environment Variables**
```javascript
// .env file
JWT_SECRET=your-super-secret-jwt-key-at-least-64-characters-long
MONGO_URI=mongodb://localhost:27017/yourdb
NODE_ENV=development
PORT=5000
```

### **2. Password Security**
```javascript
const bcrypt = require('bcryptjs')

// Hash password
const salt = await bcrypt.genSalt(12) // Use 12+ rounds
const hashedPassword = await bcrypt.hash(password, salt)

// Compare password
const isMatch = await bcrypt.compare(password, user.password)
```

### **3. Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit')

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    message: 'Too many authentication attempts, please try again later',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false
})

app.use('/api/auth', authLimiter)
```

### **4. Input Sanitization**
```javascript
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')

app.use(mongoSanitize()) // Prevent NoSQL injection
app.use(xss()) // Clean user input from XSS
```

### **5. Security Headers**
```javascript
const helmet = require('helmet')

app.use(helmet()) // Sets various HTTP headers
```

---

## 📝 Implementation Checklist

### **For Every New API Endpoint:**

- [ ] Follow standardized response structure
- [ ] Use appropriate HTTP status codes  
- [ ] Include proper error handling
- [ ] Add input validation
- [ ] Implement authentication where needed
- [ ] Add rate limiting for sensitive endpoints
- [ ] Test all success and error scenarios
- [ ] Document the endpoint

### **For Authentication Endpoints:**

- [ ] Hash passwords with bcrypt (12+ rounds)
- [ ] Generate secure JWT tokens
- [ ] Include user data in login response
- [ ] Implement token verification middleware
- [ ] Add rate limiting
- [ ] Log security events

### **For Database Operations:**

- [ ] Use Mongoose schemas with validation
- [ ] Handle duplicate key errors
- [ ] Sanitize inputs to prevent injection
- [ ] Use transactions for complex operations
- [ ] Implement soft deletes where appropriate

---

## 🔄 Response Examples by Endpoint Type

### **Authentication Endpoints**
```javascript
// POST /api/auth/register
{
  data: {
    id: "64f5a8b9c123456789abcdef",
    name: "John Doe",
    email: "john@example.com"
  },
  message: "User registered successfully",
  status: 201
}

// POST /api/auth/login  
{
  data: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    user: {
      id: "64f5a8b9c123456789abcdef",
      name: "John Doe", 
      email: "john@example.com"
    }
  },
  message: "Login successful",
  status: 200
}

// GET /api/auth/me
{
  data: {
    user: {
      id: "64f5a8b9c123456789abcdef",
      name: "John Doe",
      email: "john@example.com"
    }
  },
  message: "User data retrieved successfully",
  status: 200
}
```

### **CRUD Endpoints**
```javascript
// GET /api/projects
{
  data: {
    projects: [...],
    pagination: {
      total: 25,
      page: 1,
      limit: 10,
      totalPages: 3
    }
  },
  message: "Projects retrieved successfully",
  status: 200
}

// POST /api/projects
{
  data: {
    id: "64f5a8b9c123456789abcdef",
    title: "New Project",
    ...
  },
  message: "Project created successfully", 
  status: 201
}

// DELETE /api/projects/123
{
  message: "Project deleted successfully",
  status: 200
}
```

---

This documentation ensures consistency across all API endpoints and makes the codebase more maintainable and predictable for frontend integration.