import crypto from 'crypto'
import sharp from 'sharp'
import cloudinary from '@/lib/cloudinary'
import {
  isValidImageType,
  isValidPDFType,
  FILE_SIZE_LIMITS,
} from '@/constants/fileConstants'

// In-memory port of the Express uploadService. Route Handlers read the uploaded
// file from request.formData() and hand us a normalized descriptor:
//   { buffer: Buffer, mimetype: string, size: number, originalname?: string }
// No disk I/O (serverless-friendly); sharp works on the buffer and Cloudinary
// receives it via upload_stream.

function md5(buffer) {
  return crypto.createHash('md5').update(buffer).digest('hex')
}

// Normalize a Web File/Blob (from formData) into our descriptor.
export async function fileFromFormData(entry) {
  if (!entry || typeof entry.arrayBuffer !== 'function') return null
  const buffer = Buffer.from(await entry.arrayBuffer())
  return {
    buffer,
    mimetype: entry.type,
    size: entry.size ?? buffer.length,
    originalname: entry.name,
  }
}

async function checkExistingFile(fileHash, folder) {
  try {
    const searchResult = await cloudinary.search
      .expression(`folder:${folder} AND filename:*${fileHash}*`)
      .max_results(1)
      .execute()
    if (searchResult.resources && searchResult.resources.length > 0) {
      return searchResult.resources[0].secure_url
    }
    return null
  } catch (error) {
    console.error('Error checking existing file:', error)
    return null
  }
}

async function optimizeImage(buffer, options = {}) {
  try {
    const {
      maxWidth = 1200,
      maxHeight = 800,
      quality = 80,
      format = 'webp',
    } = options

    const metadata = await sharp(buffer).metadata()
    let sharpInstance = sharp(buffer)

    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      sharpInstance = sharpInstance.resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

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

    return await sharpInstance.toBuffer()
  } catch (error) {
    console.error('Image optimization failed:', error)
    return buffer
  }
}

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) =>
      err ? reject(err) : resolve(result)
    )
    stream.end(buffer)
  })
}

export async function uploadProfileImage(file) {
  if (!file) throw new Error('No file provided')
  if (!isValidImageType(file.mimetype)) {
    throw new Error('Invalid file type. Only images are allowed.')
  }
  if (file.size > FILE_SIZE_LIMITS.PROFILE_IMAGE) {
    throw new Error('File size too large. Maximum size is 5MB.')
  }

  const optimized = await optimizeImage(file.buffer, {
    maxWidth: 500,
    maxHeight: 500,
    quality: 85,
    format: 'webp',
  })
  const fileHash = md5(optimized)

  const existing = await checkExistingFile(fileHash, 'portfolio/profiles')
  if (existing) return existing

  const result = await uploadBuffer(optimized, {
    folder: 'portfolio/profiles',
    public_id: `profile_${fileHash}`,
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    overwrite: false,
    unique_filename: false,
    use_filename: false,
  })
  return result.secure_url
}

export async function uploadProjectImage(file) {
  if (!file) throw new Error('No file provided')
  if (!isValidImageType(file.mimetype)) {
    throw new Error('Invalid file type. Only images are allowed.')
  }
  if (file.size > FILE_SIZE_LIMITS.PROJECT_IMAGE) {
    throw new Error('File size too large. Maximum size is 10MB.')
  }

  const optimized = await optimizeImage(file.buffer, {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 80,
    format: 'webp',
  })
  const fileHash = md5(optimized)

  const existing = await checkExistingFile(fileHash, 'portfolio/projects')
  if (existing) return existing

  const result = await uploadBuffer(optimized, {
    folder: 'portfolio/projects',
    public_id: `project_${fileHash}`,
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    overwrite: false,
    unique_filename: false,
    use_filename: false,
  })
  return result.secure_url
}

export async function uploadResume(file) {
  if (!file) throw new Error('No file provided')
  if (!isValidPDFType(file.mimetype)) {
    throw new Error('Invalid file type. Only PDF files are allowed.')
  }
  if (file.size > FILE_SIZE_LIMITS.RESUME_PDF) {
    throw new Error('File size too large. Maximum size is 10MB.')
  }

  const fileHash = md5(file.buffer)

  const existing = await checkExistingFile(fileHash, 'portfolio/resumes')
  if (existing) return existing

  const result = await uploadBuffer(file.buffer, {
    folder: 'portfolio/resumes',
    public_id: `resume_${fileHash}`,
    resource_type: 'raw',
    allowed_formats: ['pdf'],
    overwrite: false,
    unique_filename: false,
    use_filename: false,
  })
  return result.secure_url
}

export async function deleteFile(publicId, resourceType = 'image') {
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    })
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}
