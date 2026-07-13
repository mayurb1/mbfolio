import { connectDB } from '@/lib/db'
import Education from '@/models/Education'
import { ok, fail, isObjectIdError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NOT_FOUND = 'Education record not found'

// PATCH /api/education/:id/toggle-status - Toggle education active status (protected)
export async function PATCH(request, { params }) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  const { id } = await params
  try {
    await connectDB()
    const education = await Education.findById(id)
    if (!education) return fail(NOT_FOUND, 404)

    education.isActive = !education.isActive
    await education.save()

    return ok(
      { education },
      `Education record ${education.isActive ? 'activated' : 'deactivated'} successfully`,
      200
    )
  } catch (err) {
    if (isObjectIdError(err)) return fail(NOT_FOUND, 404)
    return fail(err.message, 500)
  }
}
