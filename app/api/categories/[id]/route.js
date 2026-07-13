import { connectDB } from '@/lib/db'
import Category from '@/models/Category'
import Skills from '@/models/Skills'
import { ok, okMessage, fail, validationError, isObjectIdError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Category not found'

// GET /api/categories/:id - Get category by ID (public)
export async function GET(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const { id } = await params
  try {
    await connectDB()
    const category = await Category.findById(id)
    if (!category) return fail(NOT_FOUND, 404)
    return ok({ category }, 'Category retrieved successfully', 200)
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    return fail(err.message, 500)
  }
}

// PUT /api/categories/:id - Update category (protected)
export async function PUT(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const { name, isActive } = await request.json()

    const category = await Category.findById(id)
    if (!category) return fail(NOT_FOUND, 404)

    if (name && name.toLowerCase() !== category.name.toLowerCase()) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id },
      })
      if (existingCategory) {
        return fail('Category with this name already exists', 409)
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, isActive },
      { new: true, runValidators: true }
    )

    return ok({ category: updatedCategory }, 'Category updated successfully', 200)
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    if (err.name === 'ValidationError') return validationError(err)
    return fail(err.message, 500)
  }
}

// DELETE /api/categories/:id - Delete category (protected)
export async function DELETE(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const category = await Category.findById(id)
    if (!category) return fail(NOT_FOUND, 404)

    const skillsUsingCategory = await Skills.countDocuments({
      category: category.name,
    })
    if (skillsUsingCategory > 0) {
      return fail(
        `Cannot delete category. ${skillsUsingCategory} skills are using this category.`,
        409
      )
    }

    await Category.findByIdAndDelete(id)
    return okMessage('Category deleted successfully', 200)
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    return fail(err.message, 500)
  }
}
