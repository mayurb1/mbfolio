import Education from '@/models/Education'
import { makeBulkCreate } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/education/bulk - Bulk create education records (protected)
export const POST = makeBulkCreate(Education, {
  key: 'education',
  requiredLabel: 'Education',
  itemLabel: 'education records',
  duplicate: 'Some education records already exist',
})
