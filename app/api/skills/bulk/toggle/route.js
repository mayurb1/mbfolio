import { connectDB } from '@/lib/db'
import Skills from '@/models/Skills'
import { ok, fail } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/skills/bulk/toggle - Bulk toggle active status (protected)
export async function PATCH(request) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  try {
    await connectDB()
    const { skillIds, isActive } = await request.json()

    if (!Array.isArray(skillIds) || skillIds.length === 0) {
      return fail('Skill IDs array is required', 400)
    }

    const result = await Skills.updateMany(
      { _id: { $in: skillIds } },
      { $set: { isActive } }
    )

    return ok(
      {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      },
      `${result.modifiedCount} skills updated successfully`,
      200
    )
  } catch (err) {
    return fail(err.message, 500)
  }
}
