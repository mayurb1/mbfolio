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

// Config map driving uploadFile(). Each entry captures the validation, sizing,
// optimization and Cloudinary options for a given upload kind.
const UPLOAD_KINDS = {
  profile: {
    folder: 'portfolio/profiles',
    prefix: 'profile',
    validate: isValidImageType,
    invalidTypeMessage: 'Invalid file type. Only images are allowed.',
    sizeLimit: FILE_SIZE_LIMITS.PROFILE_IMAGE,
    sizeLimitMessage: 'File size too large. Maximum size is 5MB.',
    optimize: { maxWidth: 500, maxHeight: 500, quality: 85, format: 'webp' },
    resourceType: 'image',
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
  project: {
    folder: 'portfolio/projects',
    prefix: 'project',
    validate: isValidImageType,
    invalidTypeMessage: 'Invalid file type. Only images are allowed.',
    sizeLimit: FILE_SIZE_LIMITS.PROJECT_IMAGE,
    sizeLimitMessage: 'File size too large. Maximum size is 10MB.',
    optimize: { maxWidth: 1200, maxHeight: 800, quality: 80, format: 'webp' },
    resourceType: 'image',
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
  resume: {
    folder: 'portfolio/resumes',
    prefix: 'resume',
    validate: isValidPDFType,
    invalidTypeMessage: 'Invalid file type. Only PDF files are allowed.',
    sizeLimit: FILE_SIZE_LIMITS.RESUME_PDF,
    sizeLimitMessage: 'File size too large. Maximum size is 10MB.',
    optimize: null,
    resourceType: 'raw',
    allowedFormats: ['pdf'],
  },
}

// Per-user Cloudinary folder for a given upload kind, e.g.
// portfolio/profiles/<userId>. Namespacing by owner keeps one user's assets
// from colliding with (or being deletable by) another's.
function userFolder(cfg, userId) {
  return userId ? `${cfg.folder}/${userId}` : cfg.folder
}

async function uploadFile(file, kind, userId) {
  const cfg = UPLOAD_KINDS[kind]
  if (!file) throw new Error('No file provided')
  if (!userId) throw new Error('Owner is required for upload')
  if (!cfg.validate(file.mimetype)) {
    throw new Error(cfg.invalidTypeMessage)
  }
  if (file.size > cfg.sizeLimit) {
    throw new Error(cfg.sizeLimitMessage)
  }

  const buffer = cfg.optimize
    ? await optimizeImage(file.buffer, cfg.optimize)
    : file.buffer
  const fileHash = md5(buffer)
  const folder = userFolder(cfg, userId)

  const existing = await checkExistingFile(fileHash, folder)
  if (existing) return existing

  const result = await uploadBuffer(buffer, {
    folder,
    public_id: `${cfg.prefix}_${fileHash}`,
    resource_type: cfg.resourceType,
    allowed_formats: cfg.allowedFormats,
    overwrite: false,
    unique_filename: false,
    use_filename: false,
  })
  return result.secure_url
}

export async function uploadProfileImage(file, userId) {
  return uploadFile(file, 'profile', userId)
}

export async function uploadProjectImage(file, userId) {
  return uploadFile(file, 'project', userId)
}

export async function uploadResume(file, userId) {
  return uploadFile(file, 'resume', userId)
}

// True if a Cloudinary publicId belongs to the given user's namespace. Used to
// stop a user from deleting assets they don't own.
export function ownsAsset(publicId, userId) {
  return (
    typeof publicId === 'string' &&
    !!userId &&
    publicId.includes(`/${userId}/`)
  )
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
