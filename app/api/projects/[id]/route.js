import { connectDB } from '@/lib/db'
import Project from '@/models/Project'
import { ok, okMessage, fail, validationError, isObjectIdError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Project not found'

// GET /api/projects/:id - Get project by ID (public)
export async function GET(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const { id } = await params
  try {
    await connectDB()
    const project = await Project.findById(id)
      .populate('category', 'name')
      .populate('technologies', 'name')

    if (!project) return fail(NOT_FOUND, 404)

    return ok({ project }, 'Project retrieved successfully', 200)
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    return fail(err.message, 500)
  }
}

// PUT /api/projects/:id - Update project (protected)
export async function PUT(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
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
        title: { $regex: new RegExp(`^${title}$`, 'i') },
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
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    if (err.name === 'ValidationError') return validationError(err)
    return fail(err.message, 500)
  }
}

// PATCH /api/projects/:id - Partial update project (protected)
export async function PATCH(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const body = await request.json()

    const project = await Project.findById(id)
    if (!project) return fail(NOT_FOUND, 404)

    // Check if title is being changed and if new title already exists
    if (body.title && body.title.toLowerCase() !== project.title.toLowerCase()) {
      const existingProject = await Project.findOne({
        title: { $regex: new RegExp(`^${body.title}$`, 'i') },
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
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    if (err.name === 'ValidationError') return validationError(err)
    return fail(err.message, 500)
  }
}

// DELETE /api/projects/:id - Delete project (protected)
export async function DELETE(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const project = await Project.findById(id)
    if (!project) return fail(NOT_FOUND, 404)

    await Project.findByIdAndDelete(id)

    return okMessage('Project deleted successfully', 200)
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    return fail(err.message, 500)
  }
}
