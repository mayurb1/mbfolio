import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import Users from '@/models/users'
import { connectDB } from '@/lib/db'
import { isBlacklisted } from '@/lib/token-blacklist'
import { fail } from '@/lib/respond'
import { COOKIE_NAME, TOKEN_TTL_SECONDS } from '@/lib/auth-constants'

// Node-runtime auth helpers (jsonwebtoken + bcrypt). Edge middleware uses jose
// separately (see lib/auth-edge.js).

export { COOKIE_NAME, TOKEN_TTL_SECONDS }

export function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

// Cookie attributes for the auth token.
export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_TTL_SECONDS,
  }
}

// Read the JWT from the Authorization header (Bearer) or the httpOnly cookie.
export async function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1]
  }
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value || null
}

/**
 * Authenticate a request. Returns { user, token, decoded } on success, or
 * { error } where error is a ready-to-return 401 NextResponse — mirroring the
 * Express authenticateToken middleware (blacklist check + user lookup).
 */
export async function authenticate(request) {
  const token = await getTokenFromRequest(request)

  if (!token) {
    return { error: fail('No token provided', 401) }
  }

  if (await isBlacklisted(token)) {
    return { error: fail('Token has been revoked', 401) }
  }

  try {
    const decoded = verifyToken(token)
    await connectDB()
    const user = await Users.findById(decoded.id).select('-password')
    if (!user) {
      return { error: fail('Invalid token', 401) }
    }
    return { user, token, decoded }
  } catch {
    return { error: fail('Invalid token', 401) }
  }
}
