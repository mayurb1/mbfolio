import Experience from '@/models/Experience'
import { makeBulkCreate } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/experience/bulk - Bulk create experiences (protected)
export const POST = makeBulkCreate(Experience, {
  key: 'experiences',
  requiredLabel: 'Experiences',
  itemLabel: 'experiences',
  duplicate: 'Some experiences already exist',
})
