import { connectDB } from '@/lib/db'
import Experience from '@/models/Experience'
import { ok, fail } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/experience/bulk/toggle - Bulk toggle active status (protected)
export async function PATCH(request) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  try {
    await connectDB()
    const { experienceIds, isActive } = await request.json()

    if (!Array.isArray(experienceIds) || experienceIds.length === 0) {
      return fail('Experience IDs array is required', 400)
    }

    const result = await Experience.updateMany(
      { _id: { $in: experienceIds } },
      { $set: { isActive } }
    )

    return ok(
      {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      },
      `${result.modifiedCount} experiences updated successfully`,
      200
    )
  } catch (err) {
    return fail(err.message, 500)
  }
}
