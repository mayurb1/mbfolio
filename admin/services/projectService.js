import api from '../../services/api'
import {
  FILE_SIZE_LIMITS,
  FILE_SIZE_LIMITS_MB,
  isValidImageType,
} from '../../constants/fileConstants'
import { createResourceService, request } from './createResourceService'

// Project service for project management APIs.
const base = createResourceService('/projects', {
  singular: 'project',
  plural: 'projects',
})

const projectService = {
  getAllProjects: base.getAll,
  getProjectById: base.getById,
  createProject: base.create,
  updateProject: base.update,
  deleteProject: base.remove,
  toggleProjectStatus: base.toggleStatus,

  // Toggle project featured status
  toggleProjectFeatured: (id) =>
    request(
      () => api.patch(`/projects/${id}/toggle-featured`),
      'Failed to toggle project featured status'
    ),

  // Get all categories for projects
  getCategories: () =>
    request(() => api.get('/categories'), 'Failed to fetch categories'),

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
        error.response?.data?.message || error.message || 'Failed to upload image'
      )
    }
  },

  // Delete image via authenticated backend
  deleteImage: (publicId) =>
    request(
      () => api.delete('/projects/delete-image', { data: { publicId } }),
      'Failed to delete image'
    ),
}

export default projectService
