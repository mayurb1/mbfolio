import Skills from '@/models/Skills'
import Category from '@/models/Category'
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

// GET /api/skills - Get a user's skills (public; scoped by ?userId/?username or session)
export const GET = withRoute(
  async (request, ctx, session) => {
    const userId = await resolveScopeUserId(request, session)
    if (!userId) return fail('User scope required', 400)

    const sp = request.nextUrl.searchParams
    const category = sp.get('category')
    const isActive = sp.get('isActive')
    const search = sp.get('search')
    const { page, limit, skip } = parsePagination(sp, 10)

    const filter = { userId }
    if (category) filter.category = category
    if (isActive !== null) filter.isActive = isActive === 'true'

    if (search) {
      filter.name = { $regex: search, $options: 'i' }
    }

    const total = await Skills.countDocuments(filter)

    const skills = await Skills.find(filter)
      .sort({ experience: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)

    return ok(
      {
        skills,
        pagination: paginationMeta(total, page, limit),
      },
      'Skills retrieved successfully',
      200
    )
  },
  { auth: 'optional' }
)

// POST /api/skills - Create new skill (protected, owned by caller)
export const POST = withRoute(
  async (request, ctx, session) => {
    const { name, category, proficiency, experience, description, isActive } =
      await request.json()
    const userId = session.user._id

    const existingSkill = await Skills.findOne({
      userId,
      name: ciExact(name),
    })
    if (existingSkill) {
      return fail('Skill with this name already exists', 409)
    }

    const categoryExists = await Category.findOne({
      userId,
      name: category,
      isActive: true,
    })
    if (!categoryExists) {
      return fail('Invalid category. Category must exist and be active.', 400)
    }

    const skill = new Skills({
      userId,
      name,
      category,
      proficiency,
      experience,
      description,
      isActive,
    })

    await skill.save()

    return ok({ skill }, 'Skill created successfully', 201)
  },
  { auth: true }
)
