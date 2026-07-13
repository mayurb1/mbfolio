import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyEdgeToken } from '@/lib/auth-edge'
import { COOKIE_NAME } from '@/lib/auth-constants'
import ProtectedRoute from '@/admin/components/ui/ProtectedRoute'

// Defense-in-depth: proxy.js already gates /admin/*, but the protected layout
// re-verifies the cookie server-side so protected pages never render without a
// valid session even if the matcher is ever bypassed. The client ProtectedRoute
// then waits for the session probe before revealing content.
export default async function ProtectedAdminLayout({ children }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const payload = await verifyEdgeToken(token)

  if (!payload) {
    redirect('/admin/login')
  }

  return <ProtectedRoute>{children}</ProtectedRoute>
}
