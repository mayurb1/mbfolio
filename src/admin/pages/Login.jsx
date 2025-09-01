import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Link, useLocation } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import LoginForm from '../components/forms/LoginForm'
import { loginAdmin, clearError } from '../store/authSlice'
import authService from '../services/authService'

const Login = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { showToastByStatus, handleApiResponse, handleApiError } = useToast()
  const { isAuthenticated, loading } = useSelector(state => state.adminAuth)
  const [registrationAllowed, setRegistrationAllowed] = useState(false)

  // Show success message from navigation state and check registration status on mount
  useEffect(() => {
    const successMessage = location.state?.message
    if (successMessage) {
      showToastByStatus(200, successMessage)
    }

    dispatch(clearError())

    // Check if registration is allowed
    const checkRegistrationStatus = async () => {
      try {
        const response = await authService.checkRegistrationStatus()
        setRegistrationAllowed(response.data.isRegistrationAllowed)
      } catch (error) {
        console.error('Failed to check registration status:', error)
        setRegistrationAllowed(false)
      }
    }

    checkRegistrationStatus()
  }, [dispatch, location.state?.message, showToastByStatus])

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const handleLogin = async credentials => {
    try {
      const result = await dispatch(loginAdmin(credentials)).unwrap()
      handleApiResponse(result)
    } catch (error) {
      // Handle login error with toast message
      handleApiError({ message: error })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-slate-900 dark:text-white">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700">
          <LoginForm onSubmit={handleLogin} isLoading={loading} />

          {/* Conditional Register Link */}
          {registrationAllowed && (
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Don&apos;t have an account?{' '}
                <Link
                  to="/admin/register"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Create one here
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © 2024 Portfolio Admin. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
