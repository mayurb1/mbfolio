import { connectDB } from '@/lib/db'
import Skills from '@/models/Skills'
import { ok, fail, validationError } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/skills/bulk - Bulk create skills (protected)
export async function POST(request) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  try {
    await connectDB()
    const { skills } = await request.json()

    if (!Array.isArray(skills) || skills.length === 0) {
      return fail('Skills array is required', 400)
    }

    const createdSkills = await Skills.insertMany(skills, { ordered: false })

    return ok(
      { skills: createdSkills },
      `${createdSkills.length} skills created successfully`,
      201
    )
  } catch (err) {
    if (err.name === 'ValidationError') return validationError(err)

    if (err.code === 11000) {
      return fail('Some skills already exist', 409)
    }

    return fail(err.message, 500)
  }
}
