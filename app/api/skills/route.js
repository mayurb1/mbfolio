import { connectDB } from '@/lib/db'
import Skills from '@/models/Skills'
import Category from '@/models/Category'
import { ok, fail, validationError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/skills - Get all skills (public)
export async function GET(request) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  try {
    await connectDB()
    const sp = request.nextUrl.searchParams
    const category = sp.get('category')
    const isActive = sp.get('isActive')
    const search = sp.get('search')
    const page = parseInt(sp.get('page') || '1')
    const limit = parseInt(sp.get('limit') || '10')

    const filter = {}
    if (category) filter.category = category
    if (isActive !== null) filter.isActive = isActive === 'true'

    if (search) {
      filter.name = { $regex: search, $options: 'i' }
    }

    const skip = (page - 1) * limit
    const total = await Skills.countDocuments(filter)

    const skills = await Skills.find(filter)
      .sort({ experience: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)

    return ok(
      {
        skills,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Skills retrieved successfully',
      200
    )
  } catch (err) {
    return fail(err.message, 500)
  }
}

// POST /api/skills - Create new skill (protected)
export async function POST(request) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  try {
    await connectDB()
    const { name, category, proficiency, experience, description, isActive } =
      await request.json()

    const existingSkill = await Skills.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    })
    if (existingSkill) {
      return fail('Skill with this name already exists', 409)
    }

    const categoryExists = await Category.findOne({
      name: category,
      isActive: true,
    })
    if (!categoryExists) {
      return fail('Invalid category. Category must exist and be active.', 400)
    }

    const skill = new Skills({
      name,
      category,
      proficiency,
      experience,
      description,
      isActive,
    })

    await skill.save()

    return ok({ skill }, 'Skill created successfully', 201)
  } catch (err) {
    if (err.name === 'ValidationError') return validationError(err)
    return fail(err.message, 500)
  }
}
