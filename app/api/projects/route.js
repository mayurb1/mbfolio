import Project from '@/models/Project'
import '@/models/Category'
import '@/models/Skills'
import { ok, fail } from '@/lib/respond'
import { withRoute, ciExact, parsePagination, paginationMeta } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/projects - Get all projects (public)
export const GET = withRoute(async (request) => {
  const sp = request.nextUrl.searchParams
  const isActive = sp.get('isActive')
  const category = sp.get('category')
  const type = sp.get('type')
  const featured = sp.get('featured')
  const search = sp.get('search')
  const { page, limit, skip } = parsePagination(sp, 10)

  // Build filter object
  const filter = {}
  if (isActive !== null) filter.isActive = isActive === 'true'
  if (category) filter.category = category
  if (type) filter.type = type
  if (featured !== null) filter.featured = featured === 'true'

  let projects, total

  if (search) {
    // Use aggregation pipeline for search with populated fields
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $lookup: {
          from: 'skills',
          localField: 'technologies',
          foreignField: '_id',
          as: 'technologies',
        },
      },
      {
        $match: {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { 'technologies.name': { $regex: search, $options: 'i' } },
          ],
        },
      },
      { $sort: { featured: -1, order: 1, createdAt: -1 } },
    ]

    const countPipeline = [...pipeline, { $count: 'total' }]
    const totalResult = await Project.aggregate(countPipeline)
    total = totalResult.length > 0 ? totalResult[0].total : 0

    const dataPipeline = [...pipeline, { $skip: skip }, { $limit: limit }]
    projects = await Project.aggregate(dataPipeline)
  } else {
    // Regular query without search
    total = await Project.countDocuments(filter)
    projects = await Project.find(filter)
      .populate('category', 'name')
      .populate('technologies', 'name')
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
  }

  return ok(
    {
      projects,
      pagination: paginationMeta(total, page, limit),
    },
    'Projects retrieved successfully',
    200
  )
})

// POST /api/projects - Create new project (protected)
export const POST = withRoute(
  async (request) => {
    const {
      title,
      description,
      fullDescription,
      category,
      status,
      type,
      technologies,
      highlights,
      images,
      mainImage,
      github,
      demo,
      duration,
      team,
      featured,
      isActive,
      order,
    } = await request.json()

    // Check if project with same title already exists
    const existingProject = await Project.findOne({
      title: ciExact(title),
    })
    if (existingProject) {
      return fail('Project with this title already exists', 409)
    }

    const project = new Project({
      title,
      description,
      fullDescription,
      category,
      status,
      type,
      technologies,
      highlights,
      images,
      mainImage,
      github,
      demo,
      duration,
      team,
      featured,
      isActive,
      order,
    })

    await project.save()
    await project.populate('category', 'name')
    await project.populate('technologies', 'name')

    return ok({ project }, 'Project created successfully', 201)
  },
  { auth: true }
)
