// File upload constants for backend
const FILE_SIZE_LIMITS = {
  // Profile image size limit (5MB)
  PROFILE_IMAGE: 5 * 1024 * 1024,
  
  // Project image size limit (10MB)
  PROJECT_IMAGE: 10 * 1024 * 1024,
  
  // Default image size limit (10MB)
  DEFAULT_IMAGE: 10 * 1024 * 1024
}

// Human readable file size limits
const FILE_SIZE_LIMITS_MB = {
  PROFILE_IMAGE: '5MB',
  PROJECT_IMAGE: '10MB',
  DEFAULT_IMAGE: '10MB'
}

// Supported file types
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
]

// File type validation
const isValidImageType = (fileType) => {
  return SUPPORTED_IMAGE_TYPES.includes(fileType)
}

// File size validation
const isValidFileSize = (fileSize, sizeType = 'DEFAULT_IMAGE') => {
  return fileSize <= FILE_SIZE_LIMITS[sizeType]
}

module.exports = {
  FILE_SIZE_LIMITS,
  FILE_SIZE_LIMITS_MB,
  SUPPORTED_IMAGE_TYPES,
  isValidImageType,
  isValidFileSize
}