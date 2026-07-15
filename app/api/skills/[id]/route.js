import Skills from '@/models/Skills'
import Category from '@/models/Category'
import { ok, okMessage, fail } from '@/lib/respond'
import { withRoute, ciExact } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Skill not found'

// GET /api/skills/:id - Get skill by ID (public)
export const GET = withRoute(
  async (request, { params }) => {
    const { id } = await params
    const skill = await Skills.findById(id)
    if (!skill) return fail(NOT_FOUND, 404)
    return ok({ skill }, 'Skill retrieved successfully', 200)
  },
  { notFound: NOT_FOUND }
)

// PUT /api/skills/:id - Update skill (protected)
export const PUT = withRoute(
  async (request, { params }) => {
    const { id } = await params
    const { name, category, proficiency, experience, description, isActive } =
      await request.json()

    const skill = await Skills.findById(id)
    if (!skill) return fail(NOT_FOUND, 404)

    if (name && name.toLowerCase() !== skill.name.toLowerCase()) {
      const existingSkill = await Skills.findOne({
        name: ciExact(name),
        _id: { $ne: id },
      })
      if (existingSkill) {
        return fail('Skill with this name already exists', 409)
      }
    }

    if (category) {
      const categoryExists = await Category.findOne({
        name: category,
        isActive: true,
      })
      if (!categoryExists) {
        return fail('Invalid category. Category must exist and be active.', 400)
      }
    }

    const updatedSkill = await Skills.findByIdAndUpdate(
      id,
      {
        name,
        category,
        proficiency,
        experience,
        description,
        isActive,
      },
      { new: true, runValidators: true }
    )

    return ok({ skill: updatedSkill }, 'Skill updated successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)

// PATCH /api/skills/:id - Partial update skill (protected)
export const PATCH = withRoute(
  async (request, { params }) => {
    const { id } = await params
    const body = await request.json()

    const skill = await Skills.findById(id)
    if (!skill) return fail(NOT_FOUND, 404)

    if (body.name && body.name.toLowerCase() !== skill.name.toLowerCase()) {
      const existingSkill = await Skills.findOne({
        name: ciExact(body.name),
        _id: { $ne: id },
      })
      if (existingSkill) {
        return fail('Skill with this name already exists', 409)
      }
    }

    if (body.category) {
      const categoryExists = await Category.findOne({
        name: body.category,
        isActive: true,
      })
      if (!categoryExists) {
        return fail('Invalid category. Category must exist and be active.', 400)
      }
    }

    const updatedSkill = await Skills.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )

    return ok({ skill: updatedSkill }, 'Skill updated successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)

// DELETE /api/skills/:id - Delete skill (protected)
export const DELETE = withRoute(
  async (request, { params }) => {
    const { id } = await params
    const skill = await Skills.findById(id)
    if (!skill) return fail(NOT_FOUND, 404)

    await Skills.findByIdAndDelete(id)

    return okMessage('Skill deleted successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)
