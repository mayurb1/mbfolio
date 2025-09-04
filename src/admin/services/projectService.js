import api from '../../services/api'

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

  // Upload project image to Cloudinary
  async uploadImage(file) {
    try {
      // Validate file
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file')
      }

      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'project_images')
      formData.append('folder', 'portfolio/projects')
      formData.append('unique_filename', 'false')
      
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      if (!cloudName) {
        throw new Error('Cloudinary configuration missing')
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        if (response.status === 400) {
          throw new Error(errorData.error?.message || 'Invalid upload parameters.')
        } else if (response.status === 401) {
          throw new Error('Upload preset not found or not configured.')
        } else if (response.status === 413) {
          throw new Error('File too large. Maximum size is 10MB.')
        } else {
          throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`)
        }
      }
      
      const data = await response.json()
      
      if (!data.secure_url) {
        throw new Error('Upload completed but no URL returned')
      }
      
      return data.secure_url
    } catch (error) {
      throw new Error(
        error.message || 'Failed to upload image'
      )
    }
  }

  // Delete image from Cloudinary
  async deleteImage(publicId) {
    try {
      const response = await api.post('/projects/delete-image', { publicId })
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