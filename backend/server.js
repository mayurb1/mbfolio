const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')

dotenv.config()
connectDB()

const app = express()
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://mbfolio.netlify.app/'
        : [
            'https://mbfolio.netlify.app/',
            'http://localhost:3000',
            'http://localhost:5173',
          ], // Add Vite dev server ports
    // credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // set true only if using cookies
  })
)
app.use(express.json())

// Routes
app.get('/', (req, res) => {
  res.send('API is running...')
})
app.use('/api/auth', authRoutes)

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
