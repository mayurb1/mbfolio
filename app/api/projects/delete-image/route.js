import { deleteFile } from '@/lib/upload'
import { okMessage, fail } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// DELETE /api/projects/delete-image - Delete project image (protected)
export async function DELETE(request) {
  const limited = await rateLimit(request, 'general')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  try {
    const { publicId } = await request.json()

    if (!publicId) {
      return fail('Public ID is required', 400)
    }

    await deleteFile(publicId, 'image')

    return okMessage('Project image deleted successfully', 200)
  } catch (error) {
    return fail(error.message, 400)
  }
}
