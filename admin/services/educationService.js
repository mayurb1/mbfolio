import api from '../../services/api'
import { createResourceService, request } from './createResourceService'

// Education service for education management APIs.
const base = createResourceService('/education', {
  singular: 'education record',
  plural: 'education records',
})

const educationService = {
  getAllEducation: base.getAll,
  getEducationById: base.getById,
  createEducation: base.create,
  updateEducation: base.update,
  deleteEducation: base.remove,
  toggleEducationStatus: base.toggleStatus,

  // Bulk operations
  bulkCreateEducation: (educationData) =>
    request(
      () => api.post('/education/bulk', { education: educationData }),
      'Failed to bulk create education records'
    ),
  bulkToggleActive: (educationIds, isActive) =>
    request(
      () => api.patch('/education/bulk/toggle', { educationIds, isActive }),
      'Failed to toggle education status'
    ),
}

export default educationService
