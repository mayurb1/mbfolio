import { getMasterData } from '@/lib/getMasterData'
import { ok, fail } from '@/lib/respond'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/master - Master data for the entire public website
export async function GET(request) {
  const limited = await rateLimit(request, 'public')
  if (limited) return limited

  try {
    const masterData = await getMasterData()
    if (!masterData) {
      return fail('User profile not found', 404)
    }
    return ok(masterData, 'Master data retrieved successfully', 200)
  } catch (err) {
    return fail(err.message, 500)
  }
}
