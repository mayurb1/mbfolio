import { connectDB } from '@/lib/db'
import Project from '@/models/Project'
import { ok, fail } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/projects/bulk/toggle - Bulk toggle active status (protected)
export async function PATCH(request) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  try {
    await connectDB()
    const { projectIds, isActive } = await request.json()

    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return fail('Project IDs array is required', 400)
    }

    const result = await Project.updateMany(
      { _id: { $in: projectIds } },
      { $set: { isActive } }
    )

    return ok(
      {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      },
      `${result.modifiedCount} projects updated successfully`,
      200
    )
  } catch (err) {
    return fail(err.message, 500)
  }
}
