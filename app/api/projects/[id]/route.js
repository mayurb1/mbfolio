import Project from '@/models/Project'
import '@/models/Category'
import '@/models/Skills'
import { ok, okMessage, fail } from '@/lib/respond'
import { withRoute, ciExact } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Project not found'

// GET /api/projects/:id - Get project by ID (public)
export const GET = withRoute(
  async (request, { params }) => {
    const { id } = await params
    const project = await Project.findById(id)
      .populate('category', 'name')
      .populate('technologies', 'name')

    if (!project) return fail(NOT_FOUND, 404)

    return ok({ project }, 'Project retrieved successfully', 200)
  },
  { notFound: NOT_FOUND }
)

// PUT /api/projects/:id - Update project (protected)
export const PUT = withRoute(
  async (request, { params }) => {
    const { id } = await params
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

    // Check if project exists
    const project = await Project.findById(id)
    if (!project) return fail(NOT_FOUND, 404)

    // Check if title is being changed and if new title already exists
    if (title && title.toLowerCase() !== project.title.toLowerCase()) {
      const existingProject = await Project.findOne({
        title: ciExact(title),
        _id: { $ne: id },
      })
      if (existingProject) {
        return fail('Project with this title already exists', 409)
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
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
      },
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .populate('technologies', 'name')

    return ok({ project: updatedProject }, 'Project updated successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)

// PATCH /api/projects/:id - Partial update project (protected)
export const PATCH = withRoute(
  async (request, { params }) => {
    const { id } = await params
    const body = await request.json()

    const project = await Project.findById(id)
    if (!project) return fail(NOT_FOUND, 404)

    // Check if title is being changed and if new title already exists
    if (body.title && body.title.toLowerCase() !== project.title.toLowerCase()) {
      const existingProject = await Project.findOne({
        title: ciExact(body.title),
        _id: { $ne: id },
      })
      if (existingProject) {
        return fail('Project with this title already exists', 409)
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .populate('technologies', 'name')

    return ok({ project: updatedProject }, 'Project updated successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)

// DELETE /api/projects/:id - Delete project (protected)
export const DELETE = withRoute(
  async (request, { params }) => {
    const { id } = await params
    const project = await Project.findById(id)
    if (!project) return fail(NOT_FOUND, 404)

    await Project.findByIdAndDelete(id)

    return okMessage('Project deleted successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)
