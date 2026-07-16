import { ok, fail } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { fileFromFormData, uploadLogo } from '@/lib/upload'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/auth/upload-logo (protected) - upload an SVG logo
export async function POST(request) {
  const limited = await rateLimit(request, 'upload')
  if (limited) return limited

  const auth = await authenticate(request)
  if (auth.error) return auth.error

  try {
    const formData = await request.formData()
    const file = await fileFromFormData(formData.get('file'))
    if (!file) {
      return fail('No file provided', 400)
    }

    const logoUrl = await uploadLogo(file, auth.user._id)
    return ok({ logoUrl }, 'Logo uploaded successfully', 200)
  } catch (error) {
    return fail(error.message, 400)
  }
}
