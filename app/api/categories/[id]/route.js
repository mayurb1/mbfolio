import Category from '@/models/Category'
import Skills from '@/models/Skills'
import { ok, okMessage, fail } from '@/lib/respond'
import { withRoute, ciExact, resolveScopeUserId } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Category not found'

// GET /api/categories/:id - Get category by ID (public; scoped)
export const GET = withRoute(
  async (request, { params }, session) => {
    const userId = await resolveScopeUserId(request, session)
    if (!userId) return fail('User scope required', 400)

    const { id } = await params
    const category = await Category.findOne({ _id: id, userId })
    if (!category) return fail(NOT_FOUND, 404)
    return ok({ category }, 'Category retrieved successfully', 200)
  },
  { auth: 'optional', notFound: NOT_FOUND }
)

// PUT /api/categories/:id - Update category (protected, owner-scoped)
export const PUT = withRoute(
  async (request, { params }, session) => {
    const { id } = await params
    const userId = session.user._id
    const { name, isActive } = await request.json()

    const category = await Category.findOne({ _id: id, userId })
    if (!category) return fail(NOT_FOUND, 404)

    if (name && name.toLowerCase() !== category.name.toLowerCase()) {
      const existingCategory = await Category.findOne({
        userId,
        name: ciExact(name),
        _id: { $ne: id },
      })
      if (existingCategory) {
        return fail('Category with this name already exists', 409)
      }
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id, userId },
      { name, isActive },
      { new: true, runValidators: true }
    )

    return ok({ category: updatedCategory }, 'Category updated successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)

// PATCH /api/categories/:id - Partial update category (protected, owner-scoped)
export const PATCH = withRoute(
  async (request, { params }, session) => {
    const { id } = await params
    const userId = session.user._id
    const body = await request.json()

    const category = await Category.findOne({ _id: id, userId })
    if (!category) return fail(NOT_FOUND, 404)

    if (body.name && body.name.toLowerCase() !== category.name.toLowerCase()) {
      const existingCategory = await Category.findOne({
        userId,
        name: ciExact(body.name),
        _id: { $ne: id },
      })
      if (existingCategory) {
        return fail('Category with this name already exists', 409)
      }
    }

    // Never allow the owner to be reassigned via the body.
    delete body.userId

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id, userId },
      { $set: body },
      { new: true, runValidators: true }
    )

    return ok({ category: updatedCategory }, 'Category updated successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)

// DELETE /api/categories/:id - Delete category (protected, owner-scoped)
export const DELETE = withRoute(
  async (request, { params }, session) => {
    const { id } = await params
    const userId = session.user._id
    const category = await Category.findOne({ _id: id, userId })
    if (!category) return fail(NOT_FOUND, 404)

    const skillsUsingCategory = await Skills.countDocuments({
      userId,
      category: category.name,
    })
    if (skillsUsingCategory > 0) {
      return fail(
        `Cannot delete category. ${skillsUsingCategory} skills are using this category.`,
        409
      )
    }

    await Category.deleteOne({ _id: id, userId })
    return okMessage('Category deleted successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)
