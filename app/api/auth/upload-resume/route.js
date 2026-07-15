import { ok, fail } from '@/lib/respond'
import { authenticate } from '@/lib/auth-node'
import { fileFromFormData, uploadResume } from '@/lib/upload'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/auth/upload-resume (protected)
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

    const resumeUrl = await uploadResume(file, auth.user._id)
    return ok({ resumeUrl }, 'Resume uploaded successfully', 200)
  } catch (error) {
    return fail(error.message, 400)
  }
}
