import Experience from '@/models/Experience'
import { makeBulkToggle } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/experience/bulk/toggle - Bulk toggle active status (protected)
export const PATCH = makeBulkToggle(Experience, {
  idsKey: 'experienceIds',
  requiredLabel: 'Experience',
  itemLabel: 'experiences',
})
