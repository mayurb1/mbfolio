import Skills from '@/models/Skills'
import Category from '@/models/Category'
import { ok, fail } from '@/lib/respond'
import { withRoute, ciExact, parsePagination, paginationMeta } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/skills - Get all skills (public)
export const GET = withRoute(async (request) => {
  const sp = request.nextUrl.searchParams
  const category = sp.get('category')
  const isActive = sp.get('isActive')
  const search = sp.get('search')
  const { page, limit, skip } = parsePagination(sp, 10)

  const filter = {}
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
})

// POST /api/skills - Create new skill (protected)
export const POST = withRoute(
  async (request) => {
    const { name, category, proficiency, experience, description, isActive } =
      await request.json()

    const existingSkill = await Skills.findOne({
      name: ciExact(name),
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
  },
  { auth: true }
)
