import Project from '@/models/Project'
import '@/models/Category'
import '@/models/Skills'
import { makeToggle } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/projects/:id/toggle-featured - Toggle project featured status (protected)
export const PATCH = makeToggle(Project, {
  key: 'project',
  field: 'featured',
  notFound: 'Project not found',
  labels: { noun: 'Project', on: 'marked as featured', off: 'unmarked as featured' },
  populate: [['category', 'name'], ['technologies', 'name']],
})
