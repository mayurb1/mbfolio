import { NextResponse } from 'next/server'
import { verifyEdgeToken } from '@/lib/auth-edge'
import { COOKIE_NAME } from '@/lib/auth-constants'

// Server-side gate for the admin panel. Runs at the edge before any admin page
// renders: verifies the httpOnly `admin_token` cookie and redirects
// unauthenticated users to the login page (and authenticated users away from
// the login/register pages).

const AUTH_PAGES = new Set(['/admin/login', '/admin/register'])

export async function proxy(request) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get(COOKIE_NAME)?.value
  const payload = await verifyEdgeToken(token)
  const isAuthenticated = !!payload

  const isAuthPage = AUTH_PAGES.has(pathname)

  if (isAuthPage) {
    // Already logged in? Skip the login/register page.
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Any other /admin/* route requires authentication.
  if (!isAuthenticated) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
