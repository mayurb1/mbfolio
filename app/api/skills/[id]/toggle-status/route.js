import { connectDB } from '@/lib/db'
import Skills from '@/models/Skills'
import { ok, fail, isObjectIdError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Skill not found'

// PATCH /api/skills/:id/toggle-status - Toggle skill active status (protected)
export async function PATCH(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const skill = await Skills.findById(id)
    if (!skill) return fail(NOT_FOUND, 404)

    skill.isActive = !skill.isActive
    await skill.save()

    return ok(
      { skill },
      `Skill ${skill.isActive ? 'activated' : 'deactivated'} successfully`,
      200
    )
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    return fail(err.message, 500)
  }
}
