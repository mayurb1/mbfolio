import { connectDB } from '@/lib/db'
import Users from '@/models/users'
import { ok, fail } from '@/lib/respond'
import { hashPassword } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'
import {
  isValidUsername,
  ensureUniqueUsername,
  RESERVED_USERNAMES,
} from '@/lib/username'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/auth/register - Register a new user (open, multi-user)
export async function POST(request) {
  const limited = await rateLimit(request, 'auth')
  if (limited) return limited

  try {
    await connectDB()
    const { name, email, password, username } = await request.json()

    if (!name || !email || !password) {
      return fail('Name, email and password are required', 400)
    }

    const existingUser = await Users.findOne({ email })
    if (existingUser) {
      return fail('User with this email already exists', 400)
    }

    // Resolve the username: use the requested one (validated + must be free),
    // otherwise derive a unique slug from the name.
    let finalUsername
    if (username) {
      const requested = String(username).toLowerCase().trim()
      if (!isValidUsername(requested)) {
        return fail(
          RESERVED_USERNAMES.has(requested)
            ? 'That username is reserved. Please choose another.'
            : 'Username must be 3-30 chars: lowercase letters, numbers, hyphens.',
          400
        )
      }
      const taken = await Users.findOne({ username: requested }).select('_id').lean()
      if (taken) return fail('That username is already taken', 409)
      finalUsername = requested
    } else {
      finalUsername = await ensureUniqueUsername(name)
    }

    const hashedPassword = await hashPassword(password)
    const user = new Users({
      name,
      email,
      username: finalUsername,
      password: hashedPassword,
    })
    await user.save()

    const userResponse = await Users.findById(user._id).select('-password')

    return ok(userResponse, 'User registered successfully', 201)
  } catch (err) {
    if (err?.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field'
      return fail(`That ${field} is already taken`, 409)
    }
    if (err?.name === 'ValidationError') {
      return fail(err.message, 400)
    }
    return fail(err.message, 500)
  }
}
