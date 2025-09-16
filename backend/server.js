const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const helmet = require('helmet')
const { generalLimiter, authLimiter, publicLimiter } = require('./middleware/rateLimiter')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const skillsRoutes = require('./routes/skillsRoutes')
const categoriesRoutes = require('./routes/categoriesRoutes')
const experienceRoutes = require('./routes/experienceRoutes')
const educationRoutes = require('./routes/educationRoutes')
const projectRoutes = require('./routes/projectRoutes')
const masterRoutes = require('./routes/masterRoutes')

dotenv.config()
connectDB()

const app = express()

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://mbfolio.netlify.app'
        : true, // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

// Apply rate limiting middleware
app.use('/api/', generalLimiter) // General rate limiting for all API endpoints

// Routes
app.get('/', (req, res) => {
  res.send('API is running...')
})

// Apply specific rate limiting to different route groups
app.use('/api/auth', authLimiter, authRoutes) // Strict rate limiting for authentication
app.use('/api/master', publicLimiter, masterRoutes) // More lenient for public data
app.use('/api/skills', skillsRoutes) // Uses general rate limiting
app.use('/api/categories', categoriesRoutes) // Uses general rate limiting  
app.use('/api/experience', experienceRoutes) // Uses general rate limiting
app.use('/api/education', educationRoutes) // Uses general rate limiting
app.use('/api/projects', projectRoutes) // Uses general rate limiting

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
