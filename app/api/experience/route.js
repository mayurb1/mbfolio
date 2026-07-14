import { connectDB } from '@/lib/db'
import Experience from '@/models/Experience'
import '@/models/Skills'
import { ok, fail, validationError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/experience - Get all experiences (public)
export async function GET(request) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  try {
    await connectDB()
    const sp = request.nextUrl.searchParams
    const isActive = sp.get('isActive')
    const search = sp.get('search')
    const page = parseInt(sp.get('page') || '1')
    const limit = parseInt(sp.get('limit') || '10')

    const filter = {}
    if (isActive !== null) filter.isActive = isActive === 'true'

    if (search) {
      filter.$or = [
        { company: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit
    const total = await Experience.countDocuments(filter)

    const experiences = await Experience.find(filter)
      .populate('skills', 'name category proficiency')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)

    return ok(
      {
        experiences,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Experiences retrieved successfully',
      200
    )
  } catch (err) {
    return fail(err.message, 500)
  }
}

// POST /api/experience - Create new experience (protected)
export async function POST(request) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

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

    const existingExperience = await Experience.findOne({
      company: { $regex: new RegExp(`^${company}$`, 'i') },
      position: { $regex: new RegExp(`^${position}$`, 'i') },
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
  } catch (err) {
    if (err.name === 'ValidationError') return validationError(err)
    return fail(err.message, 500)
  }
}
