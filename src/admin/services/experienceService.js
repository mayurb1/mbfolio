import api from '../../services/api'

// Experience service for experience management APIs
class ExperienceService {
  // Get all experiences with optional filtering and pagination
  async getAllExperiences(params = {}) {
    try {
      const response = await api.get('/experience', { params })
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch experiences'
      )
    }
  }

  // Get experience by ID
  async getExperienceById(id) {
    try {
      const response = await api.get(`/experience/${id}`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch experience'
      )
    }
  }

  // Create new experience
  async createExperience(experienceData) {
    try {
      const response = await api.post('/experience', experienceData)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to create experience'
      )
    }
  }

  // Update experience
  async updateExperience(id, experienceData) {
    try {
      const response = await api.put(`/experience/${id}`, experienceData)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to update experience'
      )
    }
  }

  // Delete experience
  async deleteExperience(id) {
    try {
      const response = await api.delete(`/experience/${id}`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete experience'
      )
    }
  }

  // Bulk operations
  async bulkCreateExperiences(experiencesData) {
    try {
      const response = await api.post('/experience/bulk', {
        experiences: experiencesData,
      })
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to bulk create experiences'
      )
    }
  }

  async bulkToggleActive(experienceIds, isActive) {
    try {
      const response = await api.patch('/experience/bulk/toggle', {
        experienceIds,
        isActive,
      })
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to toggle experience status'
      )
    }
  }

  // Get all skills for dropdown
  async getSkills() {
    try {
      const response = await api.get('/skills?isActive=true&limit=100')
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch skills'
      )
    }
  }

  // Toggle experience status
  async toggleExperienceStatus(id) {
    try {
      const response = await api.patch(`/experience/${id}/toggle-status`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to toggle experience status'
      )
    }
  }
}

export default new ExperienceService()
