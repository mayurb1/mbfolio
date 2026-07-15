import Experience from '@/models/Experience'
import '@/models/Skills'
import { ok, okMessage, fail } from '@/lib/respond'
import { withRoute, ciExact } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Experience not found'

// GET /api/experience/:id - Get experience by ID (public)
export const GET = withRoute(
  async (request, { params }) => {
    const { id } = await params
    const experience = await Experience.findById(id)
      .populate('skills', 'name category proficiency')
    if (!experience) return fail(NOT_FOUND, 404)
    return ok({ experience }, 'Experience retrieved successfully', 200)
  },
  { notFound: NOT_FOUND }
)

// PUT /api/experience/:id - Update experience (protected)
export const PUT = withRoute(
  async (request, { params }) => {
    const { id } = await params
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
        company: ciExact(company || experience.company),
        position: ciExact(position || experience.position),
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
  },
  { auth: true, notFound: NOT_FOUND }
)

// PATCH /api/experience/:id - Partial update experience (protected)
export const PATCH = withRoute(
  async (request, { params }) => {
    const { id } = await params
    const body = await request.json()

    const experience = await Experience.findById(id)
    if (!experience) return fail(NOT_FOUND, 404)

    if (
      (body.company && body.company.toLowerCase() !== experience.company.toLowerCase()) ||
      (body.position && body.position.toLowerCase() !== experience.position.toLowerCase())
    ) {
      const existingExperience = await Experience.findOne({
        company: ciExact(body.company || experience.company),
        position: ciExact(body.position || experience.position),
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
  },
  { auth: true, notFound: NOT_FOUND }
)

// DELETE /api/experience/:id - Delete experience (protected)
export const DELETE = withRoute(
  async (request, { params }) => {
    const { id } = await params
    const experience = await Experience.findById(id)
    if (!experience) return fail(NOT_FOUND, 404)

    await Experience.findByIdAndDelete(id)
    return okMessage('Experience deleted successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)
