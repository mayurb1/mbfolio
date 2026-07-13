import { okMessage, fail } from '@/lib/respond'
import {
  getTokenFromRequest,
  verifyToken,
  authCookieOptions,
  COOKIE_NAME,
} from '@/lib/auth-node'
import { blacklistToken } from '@/lib/token-blacklist'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/auth/logout - Blacklist the token and clear the cookie
export async function POST(request) {
  try {
    const token = await getTokenFromRequest(request)

    if (!token) {
      return fail('No token provided', 401)
    }

    let decoded
    try {
      decoded = verifyToken(token)
    } catch {
      return fail('Invalid token', 401)
    }

    // Blacklist until the token's natural expiry (exp is in seconds).
    await blacklistToken(token, decoded.exp * 1000)

    const response = okMessage('Logout successful', 200)
    response.cookies.set(COOKIE_NAME, '', { ...authCookieOptions(), maxAge: 0 })
    return response
  } catch (err) {
    return fail(err.message, 500)
  }
}
