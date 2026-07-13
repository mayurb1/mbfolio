import { connectDB } from '@/lib/db'
import Category from '@/models/Category'
import { ok, fail, isObjectIdError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Category not found'

// PATCH /api/categories/:id/toggle-status - Toggle active status (protected)
export async function PATCH(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const category = await Category.findById(id)
    if (!category) return fail(NOT_FOUND, 404)

    category.isActive = !category.isActive
    await category.save()

    return ok(
      { category },
      `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      200
    )
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    return fail(err.message, 500)
  }
}
