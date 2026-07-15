import Skills from '@/models/Skills'
import { makeBulkCreate } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/skills/bulk - Bulk create skills (protected)
export const POST = makeBulkCreate(Skills, {
  key: 'skills',
  requiredLabel: 'Skills',
  itemLabel: 'skills',
  duplicate: 'Some skills already exist',
})
