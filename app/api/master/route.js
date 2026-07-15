import { getMasterData } from '@/lib/getMasterData'
import { ok, fail } from '@/lib/respond'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/master - Master data for a user's public website.
// Scope with ?username= (preferred) or ?userId=. With neither, falls back to
// the configured primary user so the legacy single-site behavior is preserved.
export async function GET(request) {
  const limited = await rateLimit(request, 'public')
  if (limited) return limited

  try {
    const sp = request.nextUrl.searchParams
    const username = sp.get('username')
    const userId = sp.get('userId')

    const masterData = await getMasterData(
      username ? { username } : userId ? { userId } : {}
    )
    if (!masterData) {
      return fail('User profile not found', 404)
    }
    return ok(masterData, 'Master data retrieved successfully', 200)
  } catch (err) {
    return fail(err.message, 500)
  }
}
