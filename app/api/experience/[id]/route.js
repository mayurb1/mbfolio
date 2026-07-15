import Experience from '@/models/Experience'
import '@/models/Skills'
import { ok, okMessage, fail } from '@/lib/respond'
import { withRoute, ciExact, resolveScopeUserId } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Experience not found'

// GET /api/experience/:id - Get experience by ID (public; scoped)
export const GET = withRoute(
  async (request, { params }, session) => {
    const userId = await resolveScopeUserId(request, session)
    if (!userId) return fail('User scope required', 400)

    const { id } = await params
    const experience = await Experience.findOne({ _id: id, userId })
      .populate('skills', 'name category proficiency')
    if (!experience) return fail(NOT_FOUND, 404)
    return ok({ experience }, 'Experience retrieved successfully', 200)
  },
  { auth: 'optional', notFound: NOT_FOUND }
)

// PUT /api/experience/:id - Update experience (protected, owner-scoped)
export const PUT = withRoute(
  async (request, { params }, session) => {
    const { id } = await params
    const userId = session.user._id
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

    const experience = await Experience.findOne({ _id: id, userId })
    if (!experience) return fail(NOT_FOUND, 404)

    if (
      (company && company.toLowerCase() !== experience.company.toLowerCase()) ||
      (position && position.toLowerCase() !== experience.position.toLowerCase())
    ) {
      const existingExperience = await Experience.findOne({
        userId,
        company: ciExact(company || experience.company),
        position: ciExact(position || experience.position),
        _id: { $ne: id },
      })
      if (existingExperience) {
        return fail('Experience with this company and position already exists', 409)
      }
    }

    const updatedExperience = await Experience.findOneAndUpdate(
      { _id: id, userId },
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

// PATCH /api/experience/:id - Partial update experience (protected, owner-scoped)
export const PATCH = withRoute(
  async (request, { params }, session) => {
    const { id } = await params
    const userId = session.user._id
    const body = await request.json()

    const experience = await Experience.findOne({ _id: id, userId })
    if (!experience) return fail(NOT_FOUND, 404)

    if (
      (body.company && body.company.toLowerCase() !== experience.company.toLowerCase()) ||
      (body.position && body.position.toLowerCase() !== experience.position.toLowerCase())
    ) {
      const existingExperience = await Experience.findOne({
        userId,
        company: ciExact(body.company || experience.company),
        position: ciExact(body.position || experience.position),
        _id: { $ne: id },
      })
      if (existingExperience) {
        return fail('Experience with this company and position already exists', 409)
      }
    }

    // Never allow the owner to be reassigned via the body.
    delete body.userId

    const updatedExperience = await Experience.findOneAndUpdate(
      { _id: id, userId },
      { $set: body },
      { new: true, runValidators: true }
    )

    const populatedExperience = await Experience.findById(updatedExperience._id)
      .populate('skills', 'name category proficiency')

    return ok({ experience: populatedExperience }, 'Experience updated successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)

// DELETE /api/experience/:id - Delete experience (protected, owner-scoped)
export const DELETE = withRoute(
  async (request, { params }, session) => {
    const { id } = await params
    const userId = session.user._id
    const experience = await Experience.findOne({ _id: id, userId })
    if (!experience) return fail(NOT_FOUND, 404)

    await Experience.deleteOne({ _id: id, userId })
    return okMessage('Experience deleted successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)
