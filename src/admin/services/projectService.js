import api from '../../services/api'
import { FILE_SIZE_LIMITS, FILE_SIZE_LIMITS_MB, isValidImageType } from '../../constants/fileConstants'

// Project service for project management APIs
class ProjectService {
  // Get all projects with optional filtering and pagination
  async getAllProjects(params = {}) {
    try {
      const response = await api.get('/projects', { params })
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch projects'
      )
    }
  }

  // Get project by ID
  async getProjectById(id) {
    try {
      const response = await api.get(`/projects/${id}`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch project'
      )
    }
  }

  // Create new project
  async createProject(projectData) {
    try {
      const response = await api.post('/projects', projectData)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to create project'
      )
    }
  }

  // Update project
  async updateProject(id, projectData) {
    try {
      const response = await api.put(`/projects/${id}`, projectData)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to update project'
      )
    }
  }

  // Delete project
  async deleteProject(id) {
    try {
      const response = await api.delete(`/projects/${id}`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete project'
      )
    }
  }

  // Toggle project status
  async toggleProjectStatus(id) {
    try {
      const response = await api.patch(`/projects/${id}/toggle-status`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to toggle project status'
      )
    }
  }

  // Toggle project featured status
  async toggleProjectFeatured(id) {
    try {
      const response = await api.patch(`/projects/${id}/toggle-featured`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to toggle project featured status'
      )
    }
  }

  // Get all categories for projects
  async getCategories() {
    try {
      const response = await api.get('/categories')
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch categories'
      )
    }
  }

  // Upload project image via authenticated backend
  async uploadImage(file) {
    try {
      // Validate file
      if (!file || !isValidImageType(file.type)) {
        throw new Error('Please select a valid image file')
      }

      // Check file size using constants
      if (file.size > FILE_SIZE_LIMITS.PROJECT_IMAGE) {
        throw new Error(`File size must be less than ${FILE_SIZE_LIMITS_MB.PROJECT_IMAGE}`)
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/projects/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data.data.imageUrl
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to upload image'
      )
    }
  }

  // Delete image via authenticated backend
  async deleteImage(publicId) {
    try {
      const response = await api.delete('/projects/delete-image', {
        data: { publicId }
      })
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete image'
      )
    }
  }
}

export default new ProjectService()
