import { connectDB } from '@/lib/db'
import Education from '@/models/Education'
import { ok, fail, validationError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/education/bulk - Bulk create education records (protected)
export async function POST(request) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  try {
    await connectDB()
    const { education } = await request.json()

    if (!Array.isArray(education) || education.length === 0) {
      return fail('Education array is required', 400)
    }

    const createdEducation = await Education.insertMany(education, {
      ordered: false,
    })

    return ok(
      { education: createdEducation },
      `${createdEducation.length} education records created successfully`,
      201
    )
  } catch (err) {
    if (err.name === 'ValidationError') return validationError(err)
    if (err.code === 11000) {
      return fail('Some education records already exist', 409)
    }
    return fail(err.message, 500)
  }
}
