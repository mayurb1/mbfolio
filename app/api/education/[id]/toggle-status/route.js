import Education from '@/models/Education'
import { makeToggle } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/education/:id/toggle-status - Toggle education active status (protected)
export const PATCH = makeToggle(Education, {
  key: 'education',
  notFound: 'Education record not found',
  labels: { noun: 'Education record', on: 'activated', off: 'deactivated' },
})
