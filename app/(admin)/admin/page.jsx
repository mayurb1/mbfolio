import { redirect } from 'next/navigation'

// Bare /admin → dashboard. Unauthenticated users are bounced to /admin/login by
// proxy.js before this runs, so anyone reaching here has a valid session.
export default function AdminIndexPage() {
  redirect('/admin/dashboard')
}
