import { fileFromFormData, uploadProjectImage } from '@/lib/upload'
import { ok, fail } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/projects/upload-image - Upload project image (protected)
export async function POST(request) {
  const limited = await rateLimit(request, 'upload')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  try {
    const formData = await request.formData()
    const entry = formData.get('file')
    const file = await fileFromFormData(entry)
    if (!file) return fail('No file provided', 400)

    const imageUrl = await uploadProjectImage(file)

    return ok({ imageUrl }, 'Project image uploaded successfully', 200)
  } catch (error) {
    return fail(error.message, 400)
  }
}
