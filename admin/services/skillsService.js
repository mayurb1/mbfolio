import api from '../../services/api'
import { createResourceService } from './createResourceService'

// Skills service for skills management APIs.
const base = createResourceService('/skills', { singular: 'skill', plural: 'skills' })

const skillsService = {
  getAllSkills: base.getAll,
  getSkillById: base.getById,
  createSkill: base.create,
  updateSkill: base.update,
  deleteSkill: base.remove,
  toggleSkillStatus: base.toggleStatus,

  // Get skill categories (active category names) from the categories API.
  async getCategories() {
    try {
      const response = await api.get('/categories?isActive=true')
      return {
        data: {
          categories: response.data.data.categories.map((cat) => cat.name),
        },
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch categories'
      )
    }
  },
}

export default skillsService
