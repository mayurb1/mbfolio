import { connectDB } from '@/lib/db'
import Users from '@/models/users'
import { ok, fail } from '@/lib/respond'
import { getTokenFromRequest, verifyToken } from '@/lib/auth-node'

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

    const updateData = {}
    if (name !== undefined) updateData.name = name
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
    return fail(err.message, 500)
  }
}
