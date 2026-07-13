import { connectDB } from '@/lib/db'
import Experience from '@/models/Experience'
import { ok, fail, validationError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/experience/bulk - Bulk create experiences (protected)
export async function POST(request) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  try {
    await connectDB()
    const { experiences } = await request.json()

    if (!Array.isArray(experiences) || experiences.length === 0) {
      return fail('Experiences array is required', 400)
    }

    const createdExperiences = await Experience.insertMany(experiences, { ordered: false })

    return ok(
      { experiences: createdExperiences },
      `${createdExperiences.length} experiences created successfully`,
      201
    )
  } catch (err) {
    if (err.name === 'ValidationError') return validationError(err)
    if (err.code === 11000) return fail('Some experiences already exist', 409)
    return fail(err.message, 500)
  }
}
