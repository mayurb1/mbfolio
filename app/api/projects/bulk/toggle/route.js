import Project from '@/models/Project'
import { makeBulkToggle } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/projects/bulk/toggle - Bulk toggle active status (protected)
export const PATCH = makeBulkToggle(Project, {
  idsKey: 'projectIds',
  requiredLabel: 'Project',
  itemLabel: 'projects',
})
