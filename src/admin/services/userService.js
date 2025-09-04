import api from '../../services/api'
import { FILE_SIZE_LIMITS, FILE_SIZE_LIMITS_MB, isValidImageType, isValidPDFType } from '../../constants/fileConstants'

class UserService {
  // Get current user profile
  async getProfile() {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch profile'
      )
    }
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/me', profileData)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to update profile'
      )
    }
  }

  // Upload profile image to Cloudinary
  async uploadProfileImage(file) {
    try {
      // Validate file
      if (!file || !isValidImageType(file.type)) {
        throw new Error('Please select a valid image file')
      }

      // Check file size using constants
      if (file.size > FILE_SIZE_LIMITS.PROFILE_IMAGE) {
        throw new Error(`File size must be less than ${FILE_SIZE_LIMITS_MB.PROFILE_IMAGE}`)
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'project_images')
      formData.append('folder', 'portfolio/profiles')
      // formData.append('unique_filename', 'false')

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      if (!cloudName) {
        throw new Error('Cloudinary configuration missing')
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (response.status === 400) {
          throw new Error(
            errorData.error?.message || 'Invalid upload parameters.'
          )
        } else if (response.status === 401) {
          throw new Error('Upload preset not found or not configured.')
        } else if (response.status === 413) {
          throw new Error(`File too large. Maximum size is ${FILE_SIZE_LIMITS_MB.PROFILE_IMAGE}.`)
        } else {
          throw new Error(
            errorData.error?.message ||
              `Upload failed with status ${response.status}`
          )
        }
      }

      const data = await response.json()

      if (!data.secure_url) {
        throw new Error('Upload completed but no URL returned')
      }

      console.log(data, 'data')

      return data.secure_url
    } catch (error) {
      throw new Error(error.message || 'Failed to upload profile image')
    }
  }

  // Upload resume PDF to Cloudinary
  async uploadResume(file) {
    try {
      // Validate file
      if (!file || !isValidPDFType(file.type)) {
        throw new Error('Please select a valid PDF file')
      }

      // Check file size using constants
      if (file.size > FILE_SIZE_LIMITS.RESUME_PDF) {
        throw new Error(`File size must be less than ${FILE_SIZE_LIMITS_MB.RESUME_PDF}`)
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'project_images')
      formData.append('folder', 'portfolio/resumes')
      formData.append('resource_type', 'raw')

      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      if (!cloudName) {
        throw new Error('Cloudinary configuration missing')
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        if (response.status === 400) {
          throw new Error(
            errorData.error?.message || 'Invalid upload parameters.'
          )
        } else if (response.status === 401) {
          throw new Error('Upload preset not found or not configured.')
        } else if (response.status === 413) {
          throw new Error(`File too large. Maximum size is ${FILE_SIZE_LIMITS_MB.RESUME_PDF}.`)
        } else {
          throw new Error(
            errorData.error?.message ||
              `Upload failed with status ${response.status}`
          )
        }
      }

      const data = await response.json()

      if (!data.secure_url) {
        throw new Error('Upload completed but no URL returned')
      }

      return data.secure_url
    } catch (error) {
      throw new Error(error.message || 'Failed to upload resume')
    }
  }

  // Delete profile image from Cloudinary
  async deleteProfileImage(publicId) {
    try {
      const response = await api.post('/auth/delete-profile-image', {
        publicId,
      })
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete profile image'
      )
    }
  }
}

export default new UserService()
