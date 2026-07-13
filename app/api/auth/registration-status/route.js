import { connectDB } from '@/lib/db'
import Users from '@/models/users'
import { ok, fail } from '@/lib/respond'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/auth/registration-status - Is one-time admin registration allowed?
export async function GET() {
  try {
    await connectDB()
    const existingAdminCount = await Users.countDocuments({})
    const isRegistrationAllowed = existingAdminCount === 0

    return ok(
      {
        isRegistrationAllowed,
        adminExists: existingAdminCount > 0,
      },
      isRegistrationAllowed
        ? 'Registration is allowed'
        : 'Registration is closed - admin already exists',
      200
    )
  } catch (err) {
    return fail(err.message, 500)
  }
}
