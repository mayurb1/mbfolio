import { connectDB } from '@/lib/db'
import Users from '@/models/users'
import { okMessage, fail } from '@/lib/respond'
import {
  getTokenFromRequest,
  verifyToken,
  comparePassword,
  hashPassword,
} from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/auth/change-password - Change the admin password (inline verify)
export async function PATCH(request) {
  const limited = await rateLimit(request, 'strict')
  if (limited) return limited

  const token = await getTokenFromRequest(request)
  if (!token) {
    return fail('No token provided', 401)
  }

  try {
    await connectDB()
    const decoded = verifyToken(token)
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return fail('Current password and new password are required', 400)
    }

    if (newPassword.length < 6) {
      return fail('New password must be at least 6 characters long', 400)
    }

    const user = await Users.findById(decoded.id)
    if (!user) {
      return fail('User not found', 404)
    }

    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.password
    )
    if (!isCurrentPasswordValid) {
      return fail('Current password is incorrect', 400)
    }

    const hashedNewPassword = await hashPassword(newPassword)
    await Users.findByIdAndUpdate(decoded.id, { password: hashedNewPassword })

    return okMessage('Password changed successfully', 200)
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return fail('Invalid token', 401)
    }
    return fail(err.message, 500)
  }
}
