'use client'

import AdminProvider from './store/AdminProvider'
import { ThemeProvider } from '../contexts/ThemeContext'
import ToastProvider from './contexts/ToastContext'
import AuthBootstrap from './AuthBootstrap'

// Client provider stack for the whole admin route group (login/register +
// protected pages): isolated Redux store → theme → toast, plus a one-shot
// session probe. Mounted from the admin route-group layout.
const AdminProviders = ({ children }) => {
  return (
    <AdminProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthBootstrap />
          {children}
        </ToastProvider>
      </ThemeProvider>
    </AdminProvider>
  )
}

export default AdminProviders
