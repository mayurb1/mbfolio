const cloudinary = require('../config/cloudinary')
const { isValidImageType, isValidPDFType, FILE_SIZE_LIMITS } = require('../constants/fileConstants')
const crypto = require('crypto')
const fs = require('fs')

class UploadService {
  // Generate consistent hash for file content to prevent duplicates
  generateFileHash(filePath) {
    const fileBuffer = fs.readFileSync(filePath)
    return crypto.createHash('md5').update(fileBuffer).digest('hex')
  }

  // Check if file with same content already exists
  async checkExistingFile(fileHash, folder) {
    try {
      // Search for files with the content hash in the filename
      const searchResult = await cloudinary.search
        .expression(`folder:${folder} AND filename:*${fileHash}*`)
        .max_results(1)
        .execute()
      
      if (searchResult.resources && searchResult.resources.length > 0) {
        // File with same content already exists, return existing URL
        return searchResult.resources[0].secure_url
      }
      
      return null
    } catch (error) {
      // If search fails, proceed with upload (don't block uploads due to search issues)
      console.error('Error checking existing file:', error)
      return null
    }
  }
  // Upload profile image
  async uploadProfileImage(file) {
    if (!file) {
      throw new Error('No file provided')
    }

    // Validate file type
    if (!isValidImageType(file.mimetype)) {
      throw new Error('Invalid file type. Only images are allowed.')
    }

    // Validate file size
    if (file.size > FILE_SIZE_LIMITS.PROFILE_IMAGE) {
      throw new Error('File size too large. Maximum size is 5MB.')
    }

    try {
      // Generate hash for file content to check for duplicates
      const fileHash = this.generateFileHash(file.path)
      
      // Check if file with same content already exists
      const existingFileUrl = await this.checkExistingFile(fileHash, 'portfolio/profiles')
      if (existingFileUrl) {
        return existingFileUrl // Return existing file URL instead of uploading duplicate
      }

      // File doesn't exist, proceed with upload
      const publicId = `profile_${fileHash}`

      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'portfolio/profiles',
        public_id: publicId,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        overwrite: false, // Don't overwrite if same public_id exists
        unique_filename: false,
        use_filename: false,
        transformation: [
          { width: 500, height: 500, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
        ]
      })

      return result.secure_url
    } catch (error) {
      throw new Error(`Failed to upload profile image: ${error.message}`)
    }
  }

  // Upload project image
  async uploadProjectImage(file) {
    if (!file) {
      throw new Error('No file provided')
    }

    // Validate file type
    if (!isValidImageType(file.mimetype)) {
      throw new Error('Invalid file type. Only images are allowed.')
    }

    // Validate file size
    if (file.size > FILE_SIZE_LIMITS.PROJECT_IMAGE) {
      throw new Error('File size too large. Maximum size is 10MB.')
    }

    try {
      // Generate hash for file content to check for duplicates
      const fileHash = this.generateFileHash(file.path)
      
      // Check if file with same content already exists
      const existingFileUrl = await this.checkExistingFile(fileHash, 'portfolio/projects')
      if (existingFileUrl) {
        return existingFileUrl // Return existing file URL instead of uploading duplicate
      }

      // File doesn't exist, proceed with upload
      const publicId = `project_${fileHash}`

      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'portfolio/projects',
        public_id: publicId,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        overwrite: false, // Don't overwrite if same public_id exists
        unique_filename: false,
        use_filename: false,
        transformation: [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
        ]
      })

      return result.secure_url
    } catch (error) {
      throw new Error(`Failed to upload project image: ${error.message}`)
    }
  }

  // Upload resume PDF
  async uploadResume(file) {
    if (!file) {
      throw new Error('No file provided')
    }

    // Validate file type
    if (!isValidPDFType(file.mimetype)) {
      throw new Error('Invalid file type. Only PDF files are allowed.')
    }

    // Validate file size
    if (file.size > FILE_SIZE_LIMITS.RESUME_PDF) {
      throw new Error('File size too large. Maximum size is 10MB.')
    }

    try {
      // Generate hash for file content to check for duplicates
      const fileHash = this.generateFileHash(file.path)
      
      // Check if file with same content already exists
      const existingFileUrl = await this.checkExistingFile(fileHash, 'portfolio/resumes')
      if (existingFileUrl) {
        return existingFileUrl // Return existing file URL instead of uploading duplicate
      }

      // File doesn't exist, proceed with upload
      const publicId = `resume_${fileHash}`

      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'portfolio/resumes',
        public_id: publicId,
        resource_type: 'raw',
        allowed_formats: ['pdf'],
        overwrite: false, // Don't overwrite if same public_id exists
        unique_filename: false,
        use_filename: false
      })

      return result.secure_url
    } catch (error) {
      throw new Error(`Failed to upload resume: ${error.message}`)
    }
  }

  // Delete file from Cloudinary
  async deleteFile(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      })
      return result
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  }

  // Extract public ID from Cloudinary URL
  extractPublicId(cloudinaryUrl) {
    if (!cloudinaryUrl) return null
    
    // Extract public ID from Cloudinary URL
    const matches = cloudinaryUrl.match(/\/v\d+\/(.+?)\.(jpg|jpeg|png|gif|webp|pdf)$/i)
    return matches ? matches[1] : null
  }
}

module.exports = new UploadService()