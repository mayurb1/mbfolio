import { connectDB } from '@/lib/db'
import Experience from '@/models/Experience'
import { ok, okMessage, fail, validationError, isObjectIdError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Experience not found'

// GET /api/experience/:id - Get experience by ID (public)
export async function GET(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const { id } = await params
  try {
    await connectDB()
    const experience = await Experience.findById(id)
      .populate('skills', 'name category proficiency')
    if (!experience) return fail(NOT_FOUND, 404)
    return ok({ experience }, 'Experience retrieved successfully', 200)
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    return fail(err.message, 500)
  }
}

// PUT /api/experience/:id - Update experience (protected)
export async function PUT(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const {
      company,
      position,
      startDate,
      endDate,
      isOngoing,
      location,
      type,
      logo,
      website,
      description,
      achievements,
      skills,
      highlights,
      isActive,
      order,
    } = await request.json()

    const experience = await Experience.findById(id)
    if (!experience) return fail(NOT_FOUND, 404)

    if (
      (company && company.toLowerCase() !== experience.company.toLowerCase()) ||
      (position && position.toLowerCase() !== experience.position.toLowerCase())
    ) {
      const existingExperience = await Experience.findOne({
        company: { $regex: new RegExp(`^${company || experience.company}$`, 'i') },
        position: { $regex: new RegExp(`^${position || experience.position}$`, 'i') },
        _id: { $ne: id },
      })
      if (existingExperience) {
        return fail('Experience with this company and position already exists', 409)
      }
    }

    const updatedExperience = await Experience.findByIdAndUpdate(
      id,
      {
        company,
        position,
        startDate,
        endDate,
        isOngoing,
        location,
        type,
        logo,
        website,
        description,
        achievements,
        skills,
        highlights,
        isActive,
        order,
      },
      { new: true, runValidators: true }
    )

    const populatedExperience = await Experience.findById(updatedExperience._id)
      .populate('skills', 'name category proficiency')

    return ok({ experience: populatedExperience }, 'Experience updated successfully', 200)
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    if (err.name === 'ValidationError') return validationError(err)
    return fail(err.message, 500)
  }
}

// PATCH /api/experience/:id - Partial update experience (protected)
export async function PATCH(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const body = await request.json()

    const experience = await Experience.findById(id)
    if (!experience) return fail(NOT_FOUND, 404)

    if (
      (body.company && body.company.toLowerCase() !== experience.company.toLowerCase()) ||
      (body.position && body.position.toLowerCase() !== experience.position.toLowerCase())
    ) {
      const existingExperience = await Experience.findOne({
        company: { $regex: new RegExp(`^${body.company || experience.company}$`, 'i') },
        position: { $regex: new RegExp(`^${body.position || experience.position}$`, 'i') },
        _id: { $ne: id },
      })
      if (existingExperience) {
        return fail('Experience with this company and position already exists', 409)
      }
    }

    const updatedExperience = await Experience.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )

    const populatedExperience = await Experience.findById(updatedExperience._id)
      .populate('skills', 'name category proficiency')

    return ok({ experience: populatedExperience }, 'Experience updated successfully', 200)
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    if (err.name === 'ValidationError') return validationError(err)
    return fail(err.message, 500)
  }
}

// DELETE /api/experience/:id - Delete experience (protected)
export async function DELETE(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const experience = await Experience.findById(id)
    if (!experience) return fail(NOT_FOUND, 404)

    await Experience.findByIdAndDelete(id)
    return okMessage('Experience deleted successfully', 200)
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    return fail(err.message, 500)
  }
}
