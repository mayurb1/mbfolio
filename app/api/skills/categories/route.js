import Skills from '@/models/Skills'
import { ok, fail } from '@/lib/respond'
import { withRoute, resolveScopeUserId } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/skills/categories - Get a user's skill categories (public; scoped)
export const GET = withRoute(
  async (request, ctx, session) => {
    const userId = await resolveScopeUserId(request, session)
    if (!userId) return fail('User scope required', 400)

    const categories = await Skills.distinct('category', { isActive: true, userId })

    return ok({ categories }, 'Categories retrieved successfully', 200)
  },
  { auth: 'optional' }
)
