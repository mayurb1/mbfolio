import { connectDB } from '@/lib/db'
import Experience from '@/models/Experience'
import { ok, fail, isObjectIdError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Experience not found'

// PATCH /api/experience/:id/toggle-status - Toggle experience active status (protected)
export async function PATCH(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const experience = await Experience.findById(id)
    if (!experience) return fail(NOT_FOUND, 404)

    experience.isActive = !experience.isActive
    const savedExperience = await experience.save()

    const populatedExperience = await Experience.findById(savedExperience._id)
      .populate('skills', 'name category proficiency')

    return ok(
      { experience: populatedExperience },
      `Experience ${populatedExperience.isActive ? 'activated' : 'deactivated'} successfully`,
      200
    )
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    return fail(err.message, 500)
  }
}
