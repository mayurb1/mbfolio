import Skills from '@/models/Skills'
import { makeBulkToggle } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/skills/bulk/toggle - Bulk toggle active status (protected)
export const PATCH = makeBulkToggle(Skills, {
  idsKey: 'skillIds',
  requiredLabel: 'Skill',
  itemLabel: 'skills',
})
