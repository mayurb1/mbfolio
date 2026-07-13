import { connectDB } from '@/lib/db'
import Skills from '@/models/Skills'
import { ok, fail } from '@/lib/respond'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/skills/categories - Get all skill categories (public)
export async function GET(request) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  try {
    await connectDB()
    const categories = await Skills.distinct('category', { isActive: true })

    return ok({ categories }, 'Categories retrieved successfully', 200)
  } catch (err) {
    return fail(err.message, 500)
  }
}
