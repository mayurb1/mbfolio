import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { User, Mail, Calendar, Shield } from 'lucide-react'
import AdminLayout from '../components/layout/AdminLayout'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ProfileForm from '../components/forms/ProfileForm'
import ChangePasswordForm from '../components/forms/ChangePasswordForm'
import userService from '../services/userService'
import { useToast } from '../contexts/ToastContext'

const Profile = () => {
  const { user: currentUser } = useSelector(state => state.adminAuth)
  const { showError, showSuccess } = useToast()
  
  // State
  const [profile, setProfile] = useState(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setInitialLoading(true)
        const response = await userService.getProfile()
        console.log('Profile API response:', response) // Debug log
        setProfile(response.data?.user || response.data)
      } catch (error) {
        console.error('Error fetching profile:', error)
        showError('Failed to load profile', error.message)
        // Fallback to current user data
        setProfile(currentUser)
      } finally {
        setInitialLoading(false)
      }
    }

    fetchProfile()
  }, [currentUser, showError])

  // Modal handlers
  const handleEditProfile = () => setShowEditModal(true)
  const handleCloseEditModal = () => setShowEditModal(false)
  const handleChangePassword = () => setShowPasswordModal(true)
  const handleClosePasswordModal = () => setShowPasswordModal(false)

  // Success handlers
  const handleProfileUpdated = async () => {
    try {
      const response = await userService.getProfile()
      setProfile(response.data?.user || response.data)
      handleCloseEditModal()
    } catch (error) {
      console.error('Error refreshing profile:', error)
      handleCloseEditModal()
    }
  }

  const handlePasswordChanged = () => {
    showSuccess('Password changed successfully')
    handleClosePasswordModal()
  }

  if (initialLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-text">Profile</h1>
            <p className="text-text-secondary text-sm sm:text-base">
              Manage your account settings and profile information
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-border bg-slate-100 dark:bg-slate-800">
                {profile?.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name || profile.email}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-text">
                  {profile?.name || 'Admin User'}
                </h2>
                <p className="text-text-secondary flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {profile?.email || currentUser?.email}
                </p>
                {profile?.role && (
                  <p className="text-text-secondary flex items-center gap-2 mt-1">
                    <Shield className="w-4 h-4" />
                    <span className="capitalize">{profile.role}</span>
                  </p>
                )}
                {profile?.createdAt && (
                  <p className="text-text-secondary flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4" />
                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleEditProfile} className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Edit Profile
                </Button>
                <Button 
                  onClick={handleChangePassword} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Profile Info */}
        {profile && (
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Account Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                <p className="text-text">{profile.name || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                <p className="text-text">{profile.email}</p>
              </div>
              {profile.phone && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
                  <p className="text-text">{profile.phone}</p>
                </div>
              )}
              {profile.bio && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1">Bio</label>
                  <p className="text-text">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={showEditModal} onClose={handleCloseEditModal} title="Edit Profile">
        <ProfileForm 
          profile={profile}
          onSuccess={handleProfileUpdated} 
          onCancel={handleCloseEditModal} 
        />
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={showPasswordModal} onClose={handleClosePasswordModal} title="Change Password">
        <ChangePasswordForm 
          onSuccess={handlePasswordChanged} 
          onCancel={handleClosePasswordModal} 
        />
      </Modal>
    </AdminLayout>
  )
}

export default Profile