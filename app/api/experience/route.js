import Experience from '@/models/Experience'
import '@/models/Skills'
import { ok, fail } from '@/lib/respond'
import { withRoute, ciExact, parsePagination, paginationMeta } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/experience - Get all experiences (public)
export const GET = withRoute(async (request) => {
  const sp = request.nextUrl.searchParams
  const isActive = sp.get('isActive')
  const search = sp.get('search')
  const { page, limit, skip } = parsePagination(sp, 10)

  const filter = {}
  if (isActive !== null) filter.isActive = isActive === 'true'

  if (search) {
    filter.$or = [
      { company: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]
  }

  const total = await Experience.countDocuments(filter)

  const experiences = await Experience.find(filter)
    .populate('skills', 'name category proficiency')
    .sort({ order: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit)

  return ok(
    {
      experiences,
      pagination: paginationMeta(total, page, limit),
    },
    'Experiences retrieved successfully',
    200
  )
})

// POST /api/experience - Create new experience (protected)
export const POST = withRoute(
  async (request) => {
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

    const existingExperience = await Experience.findOne({
      company: ciExact(company),
      position: ciExact(position),
    })
    if (existingExperience) {
      return fail('Experience with this company and position already exists', 409)
    }

    const experience = new Experience({
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
    })

    const savedExperience = await experience.save()
    const populatedExperience = await Experience.findById(savedExperience._id)
      .populate('skills', 'name category proficiency')

    return ok({ experience: populatedExperience }, 'Experience created successfully', 201)
  },
  { auth: true }
)
