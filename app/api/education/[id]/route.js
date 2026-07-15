import Education from '@/models/Education'
import { ok, okMessage, fail } from '@/lib/respond'
import { withRoute, ciExact, resolveScopeUserId } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Education record not found'

// GET /api/education/:id - Get education by ID (public; scoped)
export const GET = withRoute(
  async (request, { params }, session) => {
    const userId = await resolveScopeUserId(request, session)
    if (!userId) return fail('User scope required', 400)

    const { id } = await params
    const education = await Education.findOne({ _id: id, userId })
    if (!education) return fail(NOT_FOUND, 404)
    return ok({ education }, 'Education record retrieved successfully', 200)
  },
  { auth: 'optional', notFound: NOT_FOUND }
)

// PUT /api/education/:id - Update education record (protected, owner-scoped)
export const PUT = withRoute(
  async (request, { params }, session) => {
    const { id } = await params
    const userId = session.user._id
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

    const education = await Education.findOne({ _id: id, userId })
    if (!education) return fail(NOT_FOUND, 404)

    if (
      (institution &&
        institution.toLowerCase() !== education.institution.toLowerCase()) ||
      (degree && degree.toLowerCase() !== education.degree.toLowerCase())
    ) {
      const existingEducation = await Education.findOne({
        userId,
        institution: ciExact(institution || education.institution),
        degree: ciExact(degree || education.degree),
        _id: { $ne: id },
      })
      if (existingEducation) {
        return fail(
          'Education record with this institution and degree already exists',
          409
        )
      }
    }

    const updatedEducation = await Education.findOneAndUpdate(
      { _id: id, userId },
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
  },
  { auth: true, notFound: NOT_FOUND }
)

// PATCH /api/education/:id - Partial update education record (protected, owner-scoped)
export const PATCH = withRoute(
  async (request, { params }, session) => {
    const { id } = await params
    const userId = session.user._id
    const body = await request.json()

    const education = await Education.findOne({ _id: id, userId })
    if (!education) return fail(NOT_FOUND, 404)

    if (
      (body.institution &&
        body.institution.toLowerCase() !==
          education.institution.toLowerCase()) ||
      (body.degree &&
        body.degree.toLowerCase() !== education.degree.toLowerCase())
    ) {
      const existingEducation = await Education.findOne({
        userId,
        institution: ciExact(body.institution || education.institution),
        degree: ciExact(body.degree || education.degree),
        _id: { $ne: id },
      })
      if (existingEducation) {
        return fail(
          'Education record with this institution and degree already exists',
          409
        )
      }
    }

    // Never allow the owner to be reassigned via the body.
    delete body.userId

    const updatedEducation = await Education.findOneAndUpdate(
      { _id: id, userId },
      { $set: body },
      { new: true, runValidators: true }
    )

    return ok(
      { education: updatedEducation },
      'Education record updated successfully',
      200
    )
  },
  { auth: true, notFound: NOT_FOUND }
)

// DELETE /api/education/:id - Delete education record (protected, owner-scoped)
export const DELETE = withRoute(
  async (request, { params }, session) => {
    const { id } = await params
    const userId = session.user._id
    const education = await Education.findOne({ _id: id, userId })
    if (!education) return fail(NOT_FOUND, 404)

    await Education.deleteOne({ _id: id, userId })
    return okMessage('Education record deleted successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)
