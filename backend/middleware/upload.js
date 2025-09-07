const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { FILE_SIZE_LIMITS } = require('../constants/fileConstants')

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const extension = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + extension)
  }
})

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept images and PDFs
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false)
  }
}

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: FILE_SIZE_LIMITS.PROJECT_IMAGE // Use largest limit
  },
  fileFilter: fileFilter
})

// Middleware to clean up uploaded files after processing
const cleanupFile = (req, res, next) => {
  const originalJson = res.json
  
  res.json = function(data) {
    // Clean up uploaded file
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error cleaning up file:', err)
      })
    }
    
    // Call original json method
    originalJson.call(this, data)
  }
  
  // Handle errors - also cleanup file
  const originalSend = res.send
  res.send = function(data) {
    if (res.statusCode >= 400 && req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error cleaning up file:', err)
      })
    }
    originalSend.call(this, data)
  }
  
  next()
}

module.exports = {
  upload,
  cleanupFile
}