import { connectDB } from '@/lib/db'
import Education from '@/models/Education'
import { ok, okMessage, fail, validationError, isObjectIdError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Education record not found'

// GET /api/education/:id - Get education by ID (public)
export async function GET(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const { id } = await params
  try {
    await connectDB()
    const education = await Education.findById(id)
    if (!education) return fail(NOT_FOUND, 404)
    return ok({ education }, 'Education record retrieved successfully', 200)
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    return fail(err.message, 500)
  }
}

// PUT /api/education/:id - Update education record (protected)
export async function PUT(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const {
      institution,
      degree,
      startDate,
      endDate,
      isOngoing,
      location,
      gpa,
      logo,
      website,
      description,
      achievements,
      isActive,
      order,
    } = await request.json()

    const education = await Education.findById(id)
    if (!education) return fail(NOT_FOUND, 404)

    if (
      (institution &&
        institution.toLowerCase() !== education.institution.toLowerCase()) ||
      (degree && degree.toLowerCase() !== education.degree.toLowerCase())
    ) {
      const existingEducation = await Education.findOne({
        institution: {
          $regex: new RegExp(`^${institution || education.institution}$`, 'i'),
        },
        degree: { $regex: new RegExp(`^${degree || education.degree}$`, 'i') },
        _id: { $ne: id },
      })
      if (existingEducation) {
        return fail(
          'Education record with this institution and degree already exists',
          409
        )
      }
    }

    const updatedEducation = await Education.findByIdAndUpdate(
      id,
      {
        institution,
        degree,
        startDate,
        endDate,
        isOngoing,
        location,
        gpa,
        logo,
        website,
        description,
        achievements,
        isActive,
        order,
      },
      { new: true, runValidators: true }
    )

    return ok(
      { education: updatedEducation },
      'Education record updated successfully',
      200
    )
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    if (err.name === 'ValidationError') return validationError(err)
    return fail(err.message, 500)
  }
}

// PATCH /api/education/:id - Partial update education record (protected)
export async function PATCH(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const body = await request.json()

    const education = await Education.findById(id)
    if (!education) return fail(NOT_FOUND, 404)

    if (
      (body.institution &&
        body.institution.toLowerCase() !==
          education.institution.toLowerCase()) ||
      (body.degree &&
        body.degree.toLowerCase() !== education.degree.toLowerCase())
    ) {
      const existingEducation = await Education.findOne({
        institution: {
          $regex: new RegExp(`^${body.institution || education.institution}$`, 'i'),
        },
        degree: {
          $regex: new RegExp(`^${body.degree || education.degree}$`, 'i'),
        },
        _id: { $ne: id },
      })
      if (existingEducation) {
        return fail(
          'Education record with this institution and degree already exists',
          409
        )
      }
    }

    const updatedEducation = await Education.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )

    return ok(
      { education: updatedEducation },
      'Education record updated successfully',
      200
    )
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    if (err.name === 'ValidationError') return validationError(err)
    return fail(err.message, 500)
  }
}

// DELETE /api/education/:id - Delete education record (protected)
export async function DELETE(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const education = await Education.findById(id)
    if (!education) return fail(NOT_FOUND, 404)

    await Education.findByIdAndDelete(id)
    return okMessage('Education record deleted successfully', 200)
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    return fail(err.message, 500)
  }
}
