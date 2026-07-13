import AdminProviders from '@/admin/AdminProviders'

// Admin route-group root. Mounts the client provider stack (isolated Redux
// store, theme, toast, session probe) around every admin page — login,
// register, and the protected pages alike.
export const metadata = {
  title: 'Admin Panel - Portfolio',
}

export default function AdminRootLayout({ children }) {
  return <AdminProviders>{children}</AdminProviders>
}
