import Education from '@/models/Education'
import { ok, fail } from '@/lib/respond'
import {
  withRoute,
  ciExact,
  parsePagination,
  paginationMeta,
  resolveScopeUserId,
} from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/education - Get a user's education records (public; scoped by ?userId/?username or session)
export const GET = withRoute(
  async (request, ctx, session) => {
    const userId = await resolveScopeUserId(request, session)
    if (!userId) return fail('User scope required', 400)

    const sp = request.nextUrl.searchParams
    const isActive = sp.get('isActive')
    const search = sp.get('search')
    const { page, limit, skip } = parsePagination(sp, 10)

    const filter = { userId }
    if (isActive !== null) filter.isActive = isActive === 'true'

    if (search) {
      filter.$or = [
        { institution: { $regex: search, $options: 'i' } },
        { degree: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const total = await Education.countDocuments(filter)

    const education = await Education.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)

    return ok(
      { education, pagination: paginationMeta(total, page, limit) },
      'Education records retrieved successfully',
      200
    )
  },
  { auth: 'optional' }
)

// POST /api/education - Create new education record (protected, owned by caller)
export const POST = withRoute(
  async (request, ctx, session) => {
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
    const userId = session.user._id

    const existingEducation = await Education.findOne({
      userId,
      institution: ciExact(institution),
      degree: ciExact(degree),
    })
    if (existingEducation) {
      return fail(
        'Education record with this institution and degree already exists',
        409
      )
    }

    const education = new Education({
      userId,
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
    })

    await education.save()

    return ok({ education }, 'Education record created successfully', 201)
  },
  { auth: true }
)
