import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Eye, EyeOff } from 'lucide-react'
import { useToast } from '../../contexts/ToastContext'
import Button from '../ui/Button'
import { changePassword } from '../../store/authSlice'

const ChangePasswordForm = ({ onCancel, onSuccess }) => {
  const dispatch = useDispatch()
  const { loading: isChangingPassword } = useSelector(state => state.adminAuth)
  const { handleApiResponse } = useToast()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form validation schema
  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string()
      .required('Current password is required'),
    newPassword: Yup.string()
      .required('New password is required')
      .min(6, 'Password must be at least 6 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: Yup.string()
      .required('Please confirm your new password')
      .oneOf([Yup.ref('newPassword')], 'Passwords must match')
  })

  // Initial form values
  const initialValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }

  const handleSubmit = async (values, { setSubmitting, setFieldError, resetForm }) => {
    try {
      const passwordData = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      }

      const response = await dispatch(changePassword(passwordData)).unwrap()
      
      handleApiResponse(response)
      
      // Clear form on success
      resetForm()
      
      // Call onSuccess callback only on successful password change
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      // Keep modal open on error
      if (error.includes('current password') || error.includes('incorrect')) {
        setFieldError('currentPassword', 'Current password is incorrect')
      } else {
        setFieldError('general', error)
      }
      // Don't call onSuccess on error - modal stays open
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-4 sm:space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
              <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">{errors.general}</p>
            </div>
          )}

          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Current Password *
            </label>
            <div className="relative">
              <Field
                type={showCurrentPassword ? 'text' : 'password'}
                name="currentPassword"
                className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.currentPassword && touched.currentPassword
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="Enter your current password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-600" />
                ) : (
                  <Eye className="h-5 w-5 text-slate-500 hover:text-slate-600" />
                )}
              </button>
            </div>
            <ErrorMessage name="currentPassword" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              New Password *
            </label>
            <div className="relative">
              <Field
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.newPassword && touched.newPassword
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="Enter your new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-600" />
                ) : (
                  <Eye className="h-5 w-5 text-slate-500 hover:text-slate-600" />
                )}
              </button>
            </div>
            <ErrorMessage name="newPassword" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Password must contain at least 6 characters with uppercase, lowercase, and number
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Confirm New Password *
            </label>
            <div className="relative">
              <Field
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.confirmPassword && touched.confirmPassword
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-slate-500 hover:text-slate-600" />
                ) : (
                  <Eye className="h-5 w-5 text-slate-500 hover:text-slate-600" />
                )}
              </button>
            </div>
            <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isChangingPassword || isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isChangingPassword || isSubmitting}
              className="flex items-center justify-center gap-2 w-full sm:w-auto order-1 sm:order-2"
            >
              {(isChangingPassword || isSubmitting) && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white flex-shrink-0"></div>
              )}
              <span>
                {(isChangingPassword || isSubmitting) ? 'Changing Password...' : 'Change Password'}
              </span>
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default ChangePasswordForm