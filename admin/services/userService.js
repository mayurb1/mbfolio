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

  // Upload profile image via authenticated backend
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

      const response = await api.post('/auth/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data.data.imageUrl
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to upload profile image'
      )
    }
  }

  // Upload resume PDF via authenticated backend
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

      const response = await api.post('/auth/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data.data.resumeUrl
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to upload resume'
      )
    }
  }

  // Delete profile image via authenticated backend
  async deleteProfileImage(publicId) {
    try {
      const response = await api.delete('/auth/delete-profile-image', {
        data: { publicId }
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
