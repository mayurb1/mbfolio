import api from '../../services/api'

// Education service for education management APIs
class EducationService {
  // Get all education records with optional filtering and pagination
  async getAllEducation(params = {}) {
    try {
      const response = await api.get('/education', { params })
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch education records'
      )
    }
  }

  // Get education by ID
  async getEducationById(id) {
    try {
      const response = await api.get(`/education/${id}`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch education record'
      )
    }
  }

  // Create new education record
  async createEducation(educationData) {
    try {
      const response = await api.post('/education', educationData)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create education record'
      )
    }
  }

  // Update education record
  async updateEducation(id, educationData) {
    try {
      const response = await api.put(`/education/${id}`, educationData)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update education record'
      )
    }
  }

  // Delete education record
  async deleteEducation(id) {
    try {
      const response = await api.delete(`/education/${id}`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete education record'
      )
    }
  }

  // Bulk operations
  async bulkCreateEducation(educationData) {
    try {
      const response = await api.post('/education/bulk', { education: educationData })
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to bulk create education records'
      )
    }
  }

  async bulkToggleActive(educationIds, isActive) {
    try {
      const response = await api.patch('/education/bulk/toggle', { educationIds, isActive })
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to toggle education status'
      )
    }
  }

  // Toggle education status
  async toggleEducationStatus(id) {
    try {
      const response = await api.patch(`/education/${id}/toggle-status`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to toggle education status'
      )
    }
  }
}

export default new EducationService()