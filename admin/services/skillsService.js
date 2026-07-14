import api from '../../services/api'

// Skills service for skills management APIs
class SkillsService {
  // Get all skills with optional filtering and pagination
  async getAllSkills(params = {}) {
    try {
      const response = await api.get('/skills', { params })
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch skills'
      )
    }
  }

  // Get skill categories from categories API
  async getCategories() {
    try {
      const response = await api.get('/categories?isActive=true')
      return { 
        data: { 
          categories: response.data.data.categories.map(cat => cat.name) 
        } 
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch categories'
      )
    }
  }

  // Get skill by ID
  async getSkillById(id) {
    try {
      const response = await api.get(`/skills/${id}`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch skill'
      )
    }
  }

  // Create new skill
  async createSkill(skillData) {
    try {
      const response = await api.post('/skills', skillData)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create skill'
      )
    }
  }

  // Update skill
  async updateSkill(id, skillData) {
    try {
      const response = await api.put(`/skills/${id}`, skillData)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update skill'
      )
    }
  }

  // Delete skill
  async deleteSkill(id) {
    try {
      const response = await api.delete(`/skills/${id}`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete skill'
      )
    }
  }

  // Toggle skill status
  async toggleSkillStatus(id) {
    try {
      const response = await api.patch(`/skills/${id}/toggle-status`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to toggle skill status'
      )
    }
  }

}

export default new SkillsService()