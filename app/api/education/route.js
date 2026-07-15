import Education from '@/models/Education'
import { ok, fail } from '@/lib/respond'
import { withRoute, ciExact, parsePagination, paginationMeta } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/education - Get all education records (public)
export const GET = withRoute(async (request) => {
  const sp = request.nextUrl.searchParams
  const isActive = sp.get('isActive')
  const search = sp.get('search')
  const { page, limit, skip } = parsePagination(sp, 10)

  const filter = {}
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
})

// POST /api/education - Create new education record (protected)
export const POST = withRoute(async (request) => {
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

  const existingEducation = await Education.findOne({
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
}, { auth: true })
