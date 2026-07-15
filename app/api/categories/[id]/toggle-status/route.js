import Category from '@/models/Category'
import { makeToggle } from '@/lib/crud'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PATCH /api/categories/:id/toggle-status - Toggle active status (protected)
export const PATCH = makeToggle(Category, {
  key: 'category',
  notFound: 'Category not found',
  labels: { noun: 'Category', on: 'activated', off: 'deactivated' },
})
