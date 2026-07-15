import { connectDB } from '@/lib/db'
import Users from '@/models/users'
import { ok, fail } from '@/lib/respond'
import { isValidUsername } from '@/lib/username'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/auth/registration-status
//
// Registration is always open in the multi-user model. This endpoint now
// doubles as an availability checker: pass ?username= or ?email= to learn
// whether a value is free (and, for usernames, structurally valid).
export async function GET(request) {
  try {
    await connectDB()
    const sp = request.nextUrl.searchParams
    const username = sp.get('username')
    const email = sp.get('email')

    const payload = { isRegistrationAllowed: true }

    if (username !== null) {
      const u = String(username).toLowerCase().trim()
      const valid = isValidUsername(u)
      const taken = valid
        ? !!(await Users.findOne({ username: u }).select('_id').lean())
        : false
      payload.username = { value: u, valid, available: valid && !taken }
    }

    if (email !== null) {
      const taken = !!(await Users.findOne({ email }).select('_id').lean())
      payload.email = { value: email, available: !taken }
    }

    return ok(payload, 'Registration is open', 200)
  } catch (err) {
    return fail(err.message, 500)
  }
}
