import Skills from '@/models/Skills'
import { ok } from '@/lib/respond'
import { withRoute } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/skills/categories - Get all skill categories (public)
export const GET = withRoute(async () => {
  const categories = await Skills.distinct('category', { isActive: true })

  return ok({ categories }, 'Categories retrieved successfully', 200)
})
