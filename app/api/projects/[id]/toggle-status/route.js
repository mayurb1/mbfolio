import Project from '@/models/Project'
import '@/models/Category'
import '@/models/Skills'
import { makeToggle } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/projects/:id/toggle-status - Toggle project active status (protected)
export const PATCH = makeToggle(Project, {
  key: 'project',
  field: 'isActive',
  notFound: 'Project not found',
  labels: { noun: 'Project', on: 'activated', off: 'deactivated' },
  populate: [['category', 'name'], ['technologies', 'name']],
})
