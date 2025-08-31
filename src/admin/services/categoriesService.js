import api from '../../services/api'

// Categories service for categories management APIs
class CategoriesService {
  // Get all categories with optional filtering and pagination
  async getAllCategories(params = {}) {
    try {
      const response = await api.get('/categories', { params })
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch categories'
      )
    }
  }

  // Get category by ID
  async getCategoryById(id) {
    try {
      const response = await api.get(`/categories/${id}`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch category'
      )
    }
  }

  // Create new category
  async createCategory(categoryData) {
    try {
      const response = await api.post('/categories', categoryData)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create category'
      )
    }
  }

  // Update category
  async updateCategory(id, categoryData) {
    try {
      const response = await api.put(`/categories/${id}`, categoryData)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update category'
      )
    }
  }

  // Delete category
  async deleteCategory(id) {
    try {
      const response = await api.delete(`/categories/${id}`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete category'
      )
    }
  }
}

export default new CategoriesService()