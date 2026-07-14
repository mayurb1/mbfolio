import Experience from '@/models/Experience'
import '@/models/Skills'
import { makeToggle } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/experience/:id/toggle-status - Toggle experience active status (protected)
export const PATCH = makeToggle(Experience, {
  key: 'experience',
  notFound: 'Experience not found',
  labels: { noun: 'Experience', on: 'activated', off: 'deactivated' },
  populate: [['skills', 'name category proficiency']],
})
