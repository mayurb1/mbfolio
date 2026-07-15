import Skills from '@/models/Skills'
import { makeToggle } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/skills/:id/toggle-status - Toggle skill active status (protected)
export const PATCH = makeToggle(Skills, {
  key: 'skill',
  notFound: 'Skill not found',
  labels: { noun: 'Skill', on: 'activated', off: 'deactivated' },
})
