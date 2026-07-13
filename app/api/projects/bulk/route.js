import { connectDB } from '@/lib/db'
import Project from '@/models/Project'
import { ok, fail, validationError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/projects/bulk - Bulk create projects (protected)
export async function POST(request) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  try {
    await connectDB()
    const { projects } = await request.json()

    if (!Array.isArray(projects) || projects.length === 0) {
      return fail('Projects array is required', 400)
    }

    const createdProjects = await Project.insertMany(projects, { ordered: false })

    return ok(
      { projects: createdProjects },
      `${createdProjects.length} projects created successfully`,
      201
    )
  } catch (err) {
    if (err.name === 'ValidationError') return validationError(err)

    // Handle bulk write errors
    if (err.code === 11000) {
      return fail('Some projects already exist', 409)
    }

    return fail(err.message, 500)
  }
}
