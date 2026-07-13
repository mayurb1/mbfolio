import { connectDB } from '@/lib/db'
import Education from '@/models/Education'
import { ok, fail } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/education/bulk/toggle - Bulk toggle active status (protected)
export async function PATCH(request) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  try {
    await connectDB()
    const { educationIds, isActive } = await request.json()

    if (!Array.isArray(educationIds) || educationIds.length === 0) {
      return fail('Education IDs array is required', 400)
    }

    const result = await Education.updateMany(
      { _id: { $in: educationIds } },
      { $set: { isActive } }
    )

    return ok(
      {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      },
      `${result.modifiedCount} education records updated successfully`,
      200
    )
  } catch (err) {
    return fail(err.message, 500)
  }
}
