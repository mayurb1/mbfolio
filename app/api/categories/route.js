import Category from '@/models/Category'
import { ok, fail } from '@/lib/respond'
import { withRoute, ciExact, parsePagination, paginationMeta } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/categories - Get all categories (public)
export const GET = withRoute(async (request) => {
  const sp = request.nextUrl.searchParams
  const isActive = sp.get('isActive')
  const { page, limit, skip } = parsePagination(sp, 50)

  const filter = {}
  if (isActive !== null) filter.isActive = isActive === 'true'

  const total = await Category.countDocuments(filter)
  const categories = await Category.find(filter).sort({ name: 1 }).skip(skip).limit(limit)

  return ok(
    { categories, pagination: paginationMeta(total, page, limit) },
    'Categories retrieved successfully',
    200
  )
})

// POST /api/categories - Create new category (protected)
export const POST = withRoute(
  async (request) => {
    const { name, isActive } = await request.json()

    const existingCategory = await Category.findOne({ name: ciExact(name) })
    if (existingCategory) {
      return fail('Category with this name already exists', 409)
    }

    const category = new Category({ name, isActive })
    await category.save()

    return ok({ category }, 'Category created successfully', 201)
  },
  { auth: true }
)
