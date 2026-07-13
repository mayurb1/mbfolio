import { okMessage, fail } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { deleteFile } from '@/lib/upload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// DELETE /api/auth/delete-profile-image (protected)
export async function DELETE(request) {
  const auth = await authenticate(request)
  if (auth.error) return auth.error

  try {
    const { publicId } = await request.json()
    if (!publicId) {
      return fail('Public ID is required', 400)
    }

    await deleteFile(publicId, 'image')
    return okMessage('Profile image deleted successfully', 200)
  } catch (error) {
    return fail(error.message, 400)
  }
}
