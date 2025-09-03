const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const skillsRoutes = require('./routes/skillsRoutes')
const categoriesRoutes = require('./routes/categoriesRoutes')
const experienceRoutes = require('./routes/experienceRoutes')
const educationRoutes = require('./routes/educationRoutes')
const projectRoutes = require('./routes/projectRoutes')

dotenv.config()
connectDB()

const app = express()
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
app.use('/api/auth', authRoutes)
app.use('/api/skills', skillsRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/experience', experienceRoutes)
app.use('/api/education', educationRoutes)
app.use('/api/projects', projectRoutes)

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
