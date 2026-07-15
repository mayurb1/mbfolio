import Project from '@/models/Project'
import { makeBulkCreate } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/projects/bulk - Bulk create projects (protected)
export const POST = makeBulkCreate(Project, {
  key: 'projects',
  requiredLabel: 'Projects',
  itemLabel: 'projects',
  duplicate: 'Some projects already exist',
})
