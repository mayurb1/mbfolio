import Project from '@/models/Project'
import '@/models/Category'
import '@/models/Skills'
import { ok, okMessage, fail } from '@/lib/respond'
import { withRoute, ciExact, resolveScopeUserId } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Project not found'

// GET /api/projects/:id - Get project by ID (public; scoped)
export const GET = withRoute(
  async (request, { params }, session) => {
    const userId = await resolveScopeUserId(request, session)
    if (!userId) return fail('User scope required', 400)

    const { id } = await params
    const project = await Project.findOne({ _id: id, userId })
      .populate('category', 'name')
      .populate('technologies', 'name')

    if (!project) return fail(NOT_FOUND, 404)

    return ok({ project }, 'Project retrieved successfully', 200)
  },
  { auth: 'optional', notFound: NOT_FOUND }
)

// PUT /api/projects/:id - Update project (protected, owner-scoped)
export const PUT = withRoute(
  async (request, { params }, session) => {
    const { id } = await params
    const userId = session.user._id
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
    const project = await Project.findOne({ _id: id, userId })
    if (!project) return fail(NOT_FOUND, 404)

    // Check if title is being changed and if new title already exists
    if (title && title.toLowerCase() !== project.title.toLowerCase()) {
      const existingProject = await Project.findOne({
        userId,
        title: ciExact(title),
        _id: { $ne: id },
      })
      if (existingProject) {
        return fail('Project with this title already exists', 409)
      }
    }

    const updatedProject = await Project.findOneAndUpdate(
      { _id: id, userId },
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

// PATCH /api/projects/:id - Partial update project (protected, owner-scoped)
export const PATCH = withRoute(
  async (request, { params }, session) => {
    const { id } = await params
    const userId = session.user._id
    const body = await request.json()

    const project = await Project.findOne({ _id: id, userId })
    if (!project) return fail(NOT_FOUND, 404)

    // Check if title is being changed and if new title already exists
    if (body.title && body.title.toLowerCase() !== project.title.toLowerCase()) {
      const existingProject = await Project.findOne({
        userId,
        title: ciExact(body.title),
        _id: { $ne: id },
      })
      if (existingProject) {
        return fail('Project with this title already exists', 409)
      }
    }

    // Never allow the owner to be reassigned via the body.
    delete body.userId

    const updatedProject = await Project.findOneAndUpdate(
      { _id: id, userId },
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .populate('technologies', 'name')

    return ok({ project: updatedProject }, 'Project updated successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)

// DELETE /api/projects/:id - Delete project (protected, owner-scoped)
export const DELETE = withRoute(
  async (request, { params }, session) => {
    const { id } = await params
    const userId = session.user._id
    const project = await Project.findOne({ _id: id, userId })
    if (!project) return fail(NOT_FOUND, 404)

    await Project.deleteOne({ _id: id, userId })

    return okMessage('Project deleted successfully', 200)
  },
  { auth: true, notFound: NOT_FOUND }
)
