// File upload constants (shared by API upload handlers and admin UI)
export const FILE_SIZE_LIMITS = {
  // Profile image size limit (5MB)
  PROFILE_IMAGE: 5 * 1024 * 1024,

  // Project image size limit (10MB)
  PROJECT_IMAGE: 10 * 1024 * 1024,

  // Default image size limit (10MB)
  DEFAULT_IMAGE: 10 * 1024 * 1024,

  // Resume PDF size limit (10MB)
  RESUME_PDF: 10 * 1024 * 1024,

  // Logo (SVG) size limit (1MB)
  LOGO: 1 * 1024 * 1024,
}

// Human readable file size limits
export const FILE_SIZE_LIMITS_MB = {
  PROFILE_IMAGE: '5MB',
  PROJECT_IMAGE: '10MB',
  DEFAULT_IMAGE: '10MB',
  RESUME_PDF: '10MB',
  LOGO: '1MB',
}

// Supported file types
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]

export const SUPPORTED_PDF_TYPES = ['application/pdf']

// Logo must be an SVG only (vector, small, theme-friendly)
export const SUPPORTED_LOGO_TYPES = ['image/svg+xml']

// File type validation
export const isValidImageType = (fileType) => {
  return SUPPORTED_IMAGE_TYPES.includes(fileType)
}

export const isValidPDFType = (fileType) => {
  return SUPPORTED_PDF_TYPES.includes(fileType)
}

export const isValidLogoType = (fileType) => {
  return SUPPORTED_LOGO_TYPES.includes(fileType)
}

// File size validation
export const isValidFileSize = (fileSize, sizeType = 'DEFAULT_IMAGE') => {
  return fileSize <= FILE_SIZE_LIMITS[sizeType]
}
