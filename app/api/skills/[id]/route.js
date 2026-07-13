import { connectDB } from '@/lib/db'
import Skills from '@/models/Skills'
import Category from '@/models/Category'
import { ok, okMessage, fail, validationError, isObjectIdError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Skill not found'

// GET /api/skills/:id - Get skill by ID (public)
export async function GET(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const { id } = await params
  try {
    await connectDB()
    const skill = await Skills.findById(id)
    if (!skill) return fail(NOT_FOUND, 404)
    return ok({ skill }, 'Skill retrieved successfully', 200)
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    return fail(err.message, 500)
  }
}

// PUT /api/skills/:id - Update skill (protected)
export async function PUT(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const { name, category, proficiency, experience, description, isActive } =
      await request.json()

    const skill = await Skills.findById(id)
    if (!skill) return fail(NOT_FOUND, 404)

    if (name && name.toLowerCase() !== skill.name.toLowerCase()) {
      const existingSkill = await Skills.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
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
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    if (err.name === 'ValidationError') return validationError(err)
    return fail(err.message, 500)
  }
}

// PATCH /api/skills/:id - Partial update skill (protected)
export async function PATCH(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const body = await request.json()

    const skill = await Skills.findById(id)
    if (!skill) return fail(NOT_FOUND, 404)

    if (body.name && body.name.toLowerCase() !== skill.name.toLowerCase()) {
      const existingSkill = await Skills.findOne({
        name: { $regex: new RegExp(`^${body.name}$`, 'i') },
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
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    if (err.name === 'ValidationError') return validationError(err)
    return fail(err.message, 500)
  }
}

// DELETE /api/skills/:id - Delete skill (protected)
export async function DELETE(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const skill = await Skills.findById(id)
    if (!skill) return fail(NOT_FOUND, 404)

    await Skills.findByIdAndDelete(id)

    return okMessage('Skill deleted successfully', 200)
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    return fail(err.message, 500)
  }
}
