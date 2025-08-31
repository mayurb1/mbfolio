import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { checkAuth } from './store/authSlice'
import AdminProvider from './store/AdminProvider'
import authService from './services/authService'

// Components
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ui/ProtectedRoute'

const AdminContent = () => {
  const dispatch = useDispatch()
  const [registrationAllowed, setRegistrationAllowed] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing authentication on app load
    dispatch(checkAuth())
    
    // Check if registration is allowed
    const checkRegistrationStatus = async () => {
      try {
        const response = await authService.checkRegistrationStatus()
        setRegistrationAllowed(response.data.isRegistrationAllowed)
      } catch (error) {
        console.error('Failed to check registration status:', error)
        setRegistrationAllowed(false) // Default to not allowing registration
      } finally {
        setLoading(false)
      }
    }

    checkRegistrationStatus()
  }, [dispatch])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/admin/login" element={<Login />} />
      
      {/* Conditional registration route */}
      {registrationAllowed ? (
        <Route path="/admin/register" element={<Register />} />
      ) : (
        <Route path="/admin/register" element={<Navigate to="/admin/login" replace />} />
      )}
      
      {/* Protected routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Redirect /admin to /admin/dashboard */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      
      {/* Catch all admin routes */}
      <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  )
}

const AdminApp = () => {
  return (
    <AdminProvider>
      <AdminContent />
    </AdminProvider>
  )
}

export default AdminApp