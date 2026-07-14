import api from '../../services/api'
import { createResourceService, request } from './createResourceService'

// Experience service for experience management APIs.
const base = createResourceService('/experience', {
  singular: 'experience',
  plural: 'experiences',
})

const experienceService = {
  getAllExperiences: base.getAll,
  getExperienceById: base.getById,
  createExperience: base.create,
  updateExperience: base.update,
  deleteExperience: base.remove,
  toggleExperienceStatus: base.toggleStatus,

  // Bulk operations
  bulkCreateExperiences: (experiencesData) =>
    request(
      () => api.post('/experience/bulk', { experiences: experiencesData }),
      'Failed to bulk create experiences'
    ),
  bulkToggleActive: (experienceIds, isActive) =>
    request(
      () => api.patch('/experience/bulk/toggle', { experienceIds, isActive }),
      'Failed to toggle experience status'
    ),

  // Get all skills for dropdown
  getSkills: () =>
    request(
      () => api.get('/skills?isActive=true&limit=100'),
      'Failed to fetch skills'
    ),
}

export default experienceService
