import Education from '@/models/Education'
import { makeBulkToggle } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/education/bulk/toggle - Bulk toggle active status (protected)
export const PATCH = makeBulkToggle(Education, {
  idsKey: 'educationIds',
  requiredLabel: 'Education',
  itemLabel: 'education records',
})
