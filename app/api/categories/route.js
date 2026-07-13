import { connectDB } from '@/lib/db'
import Category from '@/models/Category'
import { ok, fail, validationError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/categories - Get all categories (public)
export async function GET(request) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  try {
    await connectDB()
    const sp = request.nextUrl.searchParams
    const isActive = sp.get('isActive')
    const page = parseInt(sp.get('page') || '1')
    const limit = parseInt(sp.get('limit') || '50')

    const filter = {}
    if (isActive !== null) filter.isActive = isActive === 'true'

    const skip = (page - 1) * limit
    const total = await Category.countDocuments(filter)

    const categories = await Category.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)

    return ok(
      {
        categories,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Categories retrieved successfully',
      200
    )
  } catch (err) {
    return fail(err.message, 500)
  }
}

// POST /api/categories - Create new category (protected)
export async function POST(request) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  try {
    await connectDB()
    const { name, isActive } = await request.json()

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    })
    if (existingCategory) {
      return fail('Category with this name already exists', 409)
    }

    const category = new Category({ name, isActive })
    await category.save()

    return ok({ category }, 'Category created successfully', 201)
  } catch (err) {
    if (err.name === 'ValidationError') return validationError(err)
    return fail(err.message, 500)
  }
}
