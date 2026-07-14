import Category from '@/models/Category'
import Skills from '@/models/Skills'
import { ok, okMessage, fail } from '@/lib/respond'
import { withRoute, ciExact } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Category not found'

// GET /api/categories/:id - Get category by ID (public)
export const GET = withRoute(
  async (request, { params }) => {
    const { id } = await params
    const category = await Category.findById(id)
    if (!category) return fail(NOT_FOUND, 404)
    return ok({ category }, 'Category retrieved successfully', 200)
  },
  { notFound: NOT_FOUND }
)

// PUT /api/categories/:id - Update category (protected)
export const PUT = withRoute(
  async (request, { params }) => {
    const { id } = await params
    const { name, isActive } = await request.json()

    const category = await Category.findById(id)
    if (!category) return fail(NOT_FOUND, 404)

    if (name && name.toLowerCase() !== category.name.toLowerCase()) {
      const existingCategory = await Category.findOne({
        name: ciExact(name),
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
  },
  { auth: true, notFound: NOT_FOUND }
)

// DELETE /api/categories/:id - Delete category (protected)
export const DELETE = withRoute(
  async (request, { params }) => {
    const { id } = await params
    const category = await Category.findById(id)
    if (!category) return fail(NOT_FOUND, 404)

    const skillsUsingCategory = await Skills.countDocuments({ category: category.name })
    if (skillsUsingCategory > 0) {
      return fail(
        `Cannot delete category. ${skillsUsingCategory} skills are using this category.`,
        409
      )
    }

    await Category.findByIdAndDelete(id)
    return okMessage('Category deleted successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)
