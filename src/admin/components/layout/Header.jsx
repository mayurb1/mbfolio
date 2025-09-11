import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Menu, Moon, Sun, User, LogOut, ChevronDown } from 'lucide-react'
import { logoutAdmin } from '../../store/authSlice'
import { useTheme } from '../../../contexts/ThemeContext'
import { useToast } from '../../contexts/ToastContext'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

const Header = ({ onMenuClick, pageTitle = 'Dashboard' }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { handleApiError, handleApiResponse } = useToast()
  const { user } = useSelector(state => state.adminAuth)
  const { currentTheme, changeTheme } = useTheme()

  // Admin-specific theme toggle (only light/dark)
  const toggleAdminTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
    changeTheme(newTheme)
  }
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const result = await dispatch(logoutAdmin()).unwrap()
      handleApiResponse(result)
      // Navigation will happen automatically via the auth slice
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  const confirmLogout = () => {
    setShowLogoutModal(true)
    setShowUserMenu(false)
  }

  return (
    <>
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page title */}
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {/* Theme toggle */}
            <button
              onClick={toggleAdminTheme}
              className="p-2 rounded-md text-slate-600 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {currentTheme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.name || 'Profile'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">
                    {user?.name || 'Admin'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Administrator
                  </div>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {user?.name || 'Admin'}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 truncate mt-1">
                      {user?.email || 'admin@example.com'}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      navigate('/admin/profile')
                    }}
                    className="flex items-center w-full px-4 py-3 sm:py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 touch-manipulation"
                  >
                    <User className="w-4 h-4 mr-3 sm:mr-2 flex-shrink-0" />
                    <span>Profile Settings</span>
                  </button>

                  <button
                    onClick={confirmLogout}
                    className="flex items-center w-full px-4 py-3 sm:py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation"
                  >
                    <LogOut className="w-4 h-4 mr-3 sm:mr-2 flex-shrink-0" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Logout confirmation modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
        size="small"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>

          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Sign out of admin panel?
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
            You will be redirected to the login page and will need to sign in
            again to access the admin panel.
          </p>

          <div className="flex space-x-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => setShowLogoutModal(false)}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  )
}

export default Header
