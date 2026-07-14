import Education from '@/models/Education'
import { ok, okMessage, fail } from '@/lib/respond'
import { withRoute, ciExact } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Education record not found'

// GET /api/education/:id - Get education by ID (public)
export const GET = withRoute(
  async (request, { params }) => {
    const { id } = await params
    const education = await Education.findById(id)
    if (!education) return fail(NOT_FOUND, 404)
    return ok({ education }, 'Education record retrieved successfully', 200)
  },
  { notFound: NOT_FOUND }
)

// PUT /api/education/:id - Update education record (protected)
export const PUT = withRoute(
  async (request, { params }) => {
    const { id } = await params
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
  },
  { auth: true, notFound: NOT_FOUND }
)

// PATCH /api/education/:id - Partial update education record (protected)
export const PATCH = withRoute(
  async (request, { params }) => {
    const { id } = await params
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
  },
  { auth: true, notFound: NOT_FOUND }
)

// DELETE /api/education/:id - Delete education record (protected)
export const DELETE = withRoute(
  async (request, { params }) => {
    const { id } = await params
    const education = await Education.findById(id)
    if (!education) return fail(NOT_FOUND, 404)

    await Education.findByIdAndDelete(id)
    return okMessage('Education record deleted successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)
