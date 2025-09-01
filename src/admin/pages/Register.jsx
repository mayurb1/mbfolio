import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { UserPlus, CheckCircle } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import RegisterForm from '../components/forms/RegisterForm'
import { registerAdmin, clearError } from '../store/authSlice'

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { handleApiResponse, handleApiError } = useToast()
  const { isAuthenticated, loading } = useSelector((state) => state.adminAuth)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)

  // Clear any previous errors when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const handleRegister = async (userData) => {
    try {
      const result = await dispatch(registerAdmin(userData)).unwrap()
      handleApiResponse(result)
      setRegistrationSuccess(true)
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/admin/login', { 
          state: { message: result.message }
        })
      }, 2000)
    } catch (error) {
      // Handle registration error with toast message
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
              <UserPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-slate-900 dark:text-white">
            Create Admin Account
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Set up your admin account to manage the portfolio
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700">
          {registrationSuccess ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Account Created Successfully!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Redirecting you to login page...
              </p>
            </div>
          ) : (
            <>
              <RegisterForm 
                onSubmit={handleRegister}
                isLoading={loading}
              />

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link 
                    to="/admin/login" 
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </>
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

export default Register