const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Auth rate limiting (more restrictive)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)
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
app.use(express.json())

// Routes
app.get('/', (req, res) => {
  res.send('API is running...')
})
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/skills', skillsRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/experience', experienceRoutes)
app.use('/api/education', educationRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/master', masterRoutes)

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
