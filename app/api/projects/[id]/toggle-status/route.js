import { connectDB } from '@/lib/db'
import Project from '@/models/Project'
import { ok, fail, isObjectIdError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Project not found'

// PATCH /api/projects/:id/toggle-status - Toggle project active status (protected)
export async function PATCH(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const project = await Project.findById(id)
    if (!project) return fail(NOT_FOUND, 404)

    project.isActive = !project.isActive
    await project.save()
    await project.populate('category', 'name')
    await project.populate('technologies', 'name')

    return ok(
      { project },
      `Project ${project.isActive ? 'activated' : 'deactivated'} successfully`,
      200
    )
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    return fail(err.message, 500)
  }
}
