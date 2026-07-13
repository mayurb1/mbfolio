import { connectDB } from '@/lib/db'
import Users from '@/models/users'
import { ok, fail } from '@/lib/respond'
import {
  signToken,
  comparePassword,
  authCookieOptions,
  COOKIE_NAME,
} from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/auth/login - Authenticate admin, set httpOnly cookie + return token
export async function POST(request) {
  const limited = await rateLimit(request, 'auth')
  if (limited) return limited

  try {
    await connectDB()
    const { email, password } = await request.json()

    const user = await Users.findOne({ email })
    if (!user) {
      return fail('Invalid credentials', 400)
    }

    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
      return fail('Invalid credentials', 400)
    }

    const token = signToken(user._id)
    const userResponse = await Users.findById(user._id).select('-password')

    // Token stays in the body for backward compatibility with existing admin
    // services; the httpOnly cookie is what middleware will rely on (Phase 3).
    const response = ok({ token, user: userResponse }, 'Login successful', 200)
    response.cookies.set(COOKIE_NAME, token, authCookieOptions())
    return response
  } catch (err) {
    return fail(err.message, 500)
  }
}
