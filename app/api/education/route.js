import { connectDB } from '@/lib/db'
import Education from '@/models/Education'
import { ok, fail, validationError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/education - Get all education records (public)
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
        { institution: { $regex: search, $options: 'i' } },
        { degree: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const skip = (page - 1) * limit
    const total = await Education.countDocuments(filter)

    const education = await Education.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)

    return ok(
      {
        education,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Education records retrieved successfully',
      200
    )
  } catch (err) {
    return fail(err.message, 500)
  }
}

// POST /api/education - Create new education record (protected)
export async function POST(request) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

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

    const existingEducation = await Education.findOne({
      institution: { $regex: new RegExp(`^${institution}$`, 'i') },
      degree: { $regex: new RegExp(`^${degree}$`, 'i') },
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
  } catch (err) {
    if (err.name === 'ValidationError') return validationError(err)
    return fail(err.message, 500)
  }
}
