import { connectDB } from '@/lib/db'
import Users from '@/models/users'
import { ok, fail } from '@/lib/respond'
import { hashPassword } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/auth/register - One-time admin registration
export async function POST(request) {
  const limited = await rateLimit(request, 'auth')
  if (limited) return limited

  try {
    await connectDB()
    const { name, email, password } = await request.json()

    const existingAdminCount = await Users.countDocuments({})
    if (existingAdminCount > 0) {
      return fail('Admin user already exists. Only one admin is allowed.', 403)
    }

    const existingUser = await Users.findOne({ email })
    if (existingUser) {
      return fail('User already exists', 400)
    }

    const hashedPassword = await hashPassword(password)
    const user = new Users({ name, email, password: hashedPassword })
    await user.save()

    const userResponse = await Users.findById(user._id).select('-password')

    return ok(userResponse, 'Admin user registered successfully', 201)
  } catch (err) {
    return fail(err.message, 500)
  }
}
