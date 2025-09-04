import api from './api'

export const masterService = {
  // Get master data for entire website
  getMasterData: async () => {
    try {
      const response = await api.get('/master')
      return response.data
    } catch (error) {
      console.error('Error fetching master data:', error)
      throw error
    }
  }
}

export default masterService