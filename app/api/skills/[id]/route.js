import Skills from '@/models/Skills'
import Category from '@/models/Category'
import { ok, okMessage, fail } from '@/lib/respond'
import { withRoute, ciExact, resolveScopeUserId } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Skill not found'

// GET /api/skills/:id - Get skill by ID (public; scoped)
export const GET = withRoute(
  async (request, { params }, session) => {
    const userId = await resolveScopeUserId(request, session)
    if (!userId) return fail('User scope required', 400)

    const { id } = await params
    const skill = await Skills.findOne({ _id: id, userId })
    if (!skill) return fail(NOT_FOUND, 404)
    return ok({ skill }, 'Skill retrieved successfully', 200)
  },
  { auth: 'optional', notFound: NOT_FOUND }
)

// PUT /api/skills/:id - Update skill (protected, owner-scoped)
export const PUT = withRoute(
  async (request, { params }, session) => {
    const { id } = await params
    const userId = session.user._id
    const { name, category, proficiency, experience, description, isActive } =
      await request.json()

    const skill = await Skills.findOne({ _id: id, userId })
    if (!skill) return fail(NOT_FOUND, 404)

    if (name && name.toLowerCase() !== skill.name.toLowerCase()) {
      const existingSkill = await Skills.findOne({
        userId,
        name: ciExact(name),
        _id: { $ne: id },
      })
      if (existingSkill) {
        return fail('Skill with this name already exists', 409)
      }
    }

    if (category) {
      const categoryExists = await Category.findOne({
        userId,
        name: category,
        isActive: true,
      })
      if (!categoryExists) {
        return fail('Invalid category. Category must exist and be active.', 400)
      }
    }

    const updatedSkill = await Skills.findOneAndUpdate(
      { _id: id, userId },
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

// PATCH /api/skills/:id - Partial update skill (protected, owner-scoped)
export const PATCH = withRoute(
  async (request, { params }, session) => {
    const { id } = await params
    const userId = session.user._id
    const body = await request.json()

    const skill = await Skills.findOne({ _id: id, userId })
    if (!skill) return fail(NOT_FOUND, 404)

    if (body.name && body.name.toLowerCase() !== skill.name.toLowerCase()) {
      const existingSkill = await Skills.findOne({
        userId,
        name: ciExact(body.name),
        _id: { $ne: id },
      })
      if (existingSkill) {
        return fail('Skill with this name already exists', 409)
      }
    }

    if (body.category) {
      const categoryExists = await Category.findOne({
        userId,
        name: body.category,
        isActive: true,
      })
      if (!categoryExists) {
        return fail('Invalid category. Category must exist and be active.', 400)
      }
    }

    // Never allow the owner to be reassigned via the body.
    delete body.userId

    const updatedSkill = await Skills.findOneAndUpdate(
      { _id: id, userId },
      { $set: body },
      { new: true, runValidators: true }
    )

    return ok({ skill: updatedSkill }, 'Skill updated successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)

// DELETE /api/skills/:id - Delete skill (protected, owner-scoped)
export const DELETE = withRoute(
  async (request, { params }, session) => {
    const { id } = await params
    const userId = session.user._id
    const skill = await Skills.findOne({ _id: id, userId })
    if (!skill) return fail(NOT_FOUND, 404)

    await Skills.deleteOne({ _id: id, userId })

    return okMessage('Skill deleted successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)
