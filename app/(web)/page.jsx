import { redirect } from 'next/navigation'
import { getMasterData } from '@/lib/getMasterData'

// The root path has no portfolio of its own in the multi-user model. It sends
// visitors to the primary user's profile (PRIMARY_USERNAME env, else the first
// registered user). With no users yet, it points at admin registration.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let data = null
  try {
    data = await getMasterData()
  } catch {
    data = null
  }

  if (data?.user?.username) {
    redirect(`/profile/${data.user.username}`)
  }

  redirect('/admin/register')
}
