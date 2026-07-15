import Category from '@/models/Category'
import { ok, fail } from '@/lib/respond'
import {
  withRoute,
  ciExact,
  parsePagination,
  paginationMeta,
  resolveScopeUserId,
} from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/categories - Get a user's categories (public; scoped by ?userId/?username or session)
export const GET = withRoute(
  async (request, ctx, session) => {
    const userId = await resolveScopeUserId(request, session)
    if (!userId) return fail('User scope required', 400)

    const sp = request.nextUrl.searchParams
    const isActive = sp.get('isActive')
    const { page, limit, skip } = parsePagination(sp, 50)

    const filter = { userId }
    if (isActive !== null) filter.isActive = isActive === 'true'

    const total = await Category.countDocuments(filter)
    const categories = await Category.find(filter).sort({ name: 1 }).skip(skip).limit(limit)

    return ok(
      { categories, pagination: paginationMeta(total, page, limit) },
      'Categories retrieved successfully',
      200
    )
  },
  { auth: 'optional' }
)

// POST /api/categories - Create new category (protected, owned by caller)
export const POST = withRoute(
  async (request, ctx, session) => {
    const { name, isActive } = await request.json()
    const userId = session.user._id

    const existingCategory = await Category.findOne({ userId, name: ciExact(name) })
    if (existingCategory) {
      return fail('Category with this name already exists', 409)
    }

    const category = new Category({ userId, name, isActive })
    await category.save()

    return ok({ category }, 'Category created successfully', 201)
  },
  { auth: true }
)
