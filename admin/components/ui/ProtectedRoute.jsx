'use client'

import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Thin client-side fallback gate. The real gate is `proxy.js` (edge middleware)
// plus the protected route-group layout, which both verify the httpOnly cookie
// server-side before this ever renders. Here we only wait for the client
// `checkAuth` probe (AuthBootstrap) to resolve and bounce to login in the edge
// case where the session probe fails after the page has already mounted.
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, authLoading } = useSelector((state) => state.adminAuth)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/admin/login')
    }
  }, [authLoading, isAuthenticated, router])

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute
