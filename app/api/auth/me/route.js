import { connectDB } from '@/lib/db'
import Users from '@/models/users'
import { ok, fail } from '@/lib/respond'
import { getTokenFromRequest, verifyToken } from '@/lib/auth-node'
import { isValidUsername, RESERVED_USERNAMES } from '@/lib/username'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// NOTE: like the original Express handlers, /me GET+PUT verify the JWT inline
// and do NOT consult the logout blacklist (preserved behavior).

// GET /api/auth/me - Current user profile
export async function GET(request) {
  const token = await getTokenFromRequest(request)
  if (!token) {
    return fail('No token provided', 401)
  }

  try {
    await connectDB()
    const decoded = verifyToken(token)
    const user = await Users.findById(decoded.id).select('-password')
    return ok({ user }, 'User data retrieved successfully', 200)
  } catch {
    return fail('Invalid token', 401)
  }
}

// PUT /api/auth/me - Update current user profile
export async function PUT(request) {
  const token = await getTokenFromRequest(request)
  if (!token) {
    return fail('No token provided', 401)
  }

  try {
    await connectDB()
    const decoded = verifyToken(token)
    const body = await request.json()
    const {
      name,
      username,
      email,
      phone,
      bio,
      profileImage,
      linkedUrl,
      githubUrl,
      location,
      headline,
      availability,
      resume,
      highlights,
      logo,
    } = body

    // Email uniqueness check (excluding the current user)
    if (email) {
      const existingUser = await Users.findOne({
        email,
        _id: { $ne: decoded.id },
      })
      if (existingUser) {
        return fail('Email already in use by another user', 400)
      }
    }

    // Username change: validate, reject reserved, and enforce uniqueness.
    // NOTE: changing the username breaks existing /profile/{old} links.
    let normalizedUsername
    if (username !== undefined) {
      normalizedUsername = String(username).toLowerCase().trim()
      if (!isValidUsername(normalizedUsername)) {
        return fail(
          RESERVED_USERNAMES.has(normalizedUsername)
            ? 'That username is reserved. Please choose another.'
            : 'Username must be 3-30 chars: lowercase letters, numbers, hyphens.',
          400
        )
      }
      const usernameTaken = await Users.findOne({
        username: normalizedUsername,
        _id: { $ne: decoded.id },
      }).select('_id').lean()
      if (usernameTaken) {
        return fail('That username is already taken', 409)
      }
    }

    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (normalizedUsername !== undefined) updateData.username = normalizedUsername
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (bio !== undefined) updateData.bio = bio
    if (profileImage !== undefined) updateData.profileImage = profileImage
    if (linkedUrl !== undefined) updateData.linkedUrl = linkedUrl
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl
    if (location !== undefined) updateData.location = location
    if (headline !== undefined) updateData.headline = headline
    if (availability !== undefined) updateData.availability = availability
    if (resume !== undefined) updateData.resume = resume
    if (logo !== undefined) updateData.logo = logo
    if (highlights !== undefined) {
      updateData.highlights = Array.isArray(highlights)
        ? highlights.map(h => String(h).trim()).filter(Boolean)
        : []
    }

    const user = await Users.findByIdAndUpdate(decoded.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password')

    if (!user) {
      return fail('User not found', 404)
    }

    return ok({ user }, 'Profile updated successfully', 200)
  } catch (err) {
    if (err.name === 'ValidationError') {
      return fail(err.message, 400)
    }
    if (err.name === 'JsonWebTokenError') {
      return fail('Invalid token', 401)
    }
    if (err?.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field'
      return fail(`That ${field} is already taken`, 409)
    }
    return fail(err.message, 500)
  }
}
