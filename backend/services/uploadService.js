const cloudinary = require('../config/cloudinary')
const { isValidImageType, isValidPDFType, FILE_SIZE_LIMITS } = require('../constants/fileConstants')
const crypto = require('crypto')
const fs = require('fs')
const sharp = require('sharp')
const path = require('path')

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

  // Optimize image using Sharp before upload
  async optimizeImage(filePath, options = {}) {
    try {
      const {
        maxWidth = 1200,
        maxHeight = 800,
        quality = 80,
        format = 'webp'
      } = options

      // Create optimized filename
      const ext = path.extname(filePath)
      const basename = path.basename(filePath, ext)
      const dirPath = path.dirname(filePath)
      const optimizedPath = path.join(dirPath, `${basename}_optimized.${format}`)

      // Check if input file exists
      if (!fs.existsSync(filePath)) {
        throw new Error('Input file does not exist')
      }

      // Get image info
      const metadata = await sharp(filePath).metadata()
      
      let sharpInstance = sharp(filePath)

      // Only resize if image is larger than max dimensions
      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        sharpInstance = sharpInstance.resize({
          width: maxWidth,
          height: maxHeight,
          fit: 'inside',
          withoutEnlargement: true
        })
      }

      // Convert to specified format with optimization
      switch (format) {
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality, effort: 6 })
          break
        case 'jpeg':
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({ quality, progressive: true })
          break
        case 'png':
          sharpInstance = sharpInstance.png({ quality, progressive: true })
          break
        default:
          sharpInstance = sharpInstance.webp({ quality, effort: 6 })
      }

      // Save optimized image
      await sharpInstance.toFile(optimizedPath)

      // Verify the optimized file exists
      if (!fs.existsSync(optimizedPath)) {
        throw new Error('Failed to create optimized image')
      }

      return optimizedPath
    } catch (error) {
      console.error('Image optimization failed:', error)
      // Return original path if optimization fails
      return filePath
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
      // Optimize image before upload
      const optimizedPath = await this.optimizeImage(file.path, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 85,
        format: 'webp'
      })

      // Generate hash for optimized file content to check for duplicates
      const fileHash = this.generateFileHash(optimizedPath)
      
      // Check if file with same content already exists
      const existingFileUrl = await this.checkExistingFile(fileHash, 'portfolio/profiles')
      if (existingFileUrl) {
        // Clean up optimized file
        if (optimizedPath !== file.path && fs.existsSync(optimizedPath)) {
          fs.unlinkSync(optimizedPath)
        }
        return existingFileUrl // Return existing file URL instead of uploading duplicate
      }

      // File doesn't exist, proceed with upload
      const publicId = `profile_${fileHash}`

      const result = await cloudinary.uploader.upload(optimizedPath, {
        folder: 'portfolio/profiles',
        public_id: publicId,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        overwrite: false, // Don't overwrite if same public_id exists
        unique_filename: false,
        use_filename: false
      })

      // Clean up optimized file after upload
      if (optimizedPath !== file.path && fs.existsSync(optimizedPath)) {
        fs.unlinkSync(optimizedPath)
      }

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
      // Optimize image before upload
      const optimizedPath = await this.optimizeImage(file.path, {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 80,
        format: 'webp'
      })

      // Generate hash for optimized file content to check for duplicates
      const fileHash = this.generateFileHash(optimizedPath)
      
      // Check if file with same content already exists
      const existingFileUrl = await this.checkExistingFile(fileHash, 'portfolio/projects')
      if (existingFileUrl) {
        // Clean up optimized file
        if (optimizedPath !== file.path && fs.existsSync(optimizedPath)) {
          fs.unlinkSync(optimizedPath)
        }
        return existingFileUrl // Return existing file URL instead of uploading duplicate
      }

      // File doesn't exist, proceed with upload
      const publicId = `project_${fileHash}`

      const result = await cloudinary.uploader.upload(optimizedPath, {
        folder: 'portfolio/projects',
        public_id: publicId,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        overwrite: false, // Don't overwrite if same public_id exists
        unique_filename: false,
        use_filename: false
      })

      // Clean up optimized file after upload
      if (optimizedPath !== file.path && fs.existsSync(optimizedPath)) {
        fs.unlinkSync(optimizedPath)
      }

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