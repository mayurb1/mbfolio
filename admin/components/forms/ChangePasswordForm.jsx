'use client'

import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { useToast } from '../../contexts/ToastContext'
import Button from '../ui/Button'
import PasswordField from './fields/PasswordField'
import { changePassword } from '../../store/authSlice'

const ChangePasswordForm = ({ onCancel, onSuccess }) => {
  const dispatch = useDispatch()
  const { loading: isChangingPassword } = useSelector(state => state.adminAuth)
  const { handleApiResponse } = useToast()

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
      {({ isSubmitting, errors }) => (
        <Form className="space-y-4 sm:space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
              <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">{errors.general}</p>
            </div>
          )}

          {/* Current Password */}
          <PasswordField
            name="currentPassword"
            label="Current Password"
            required
            srLabel="current password"
            placeholder="Enter your current password"
          />

          {/* New Password */}
          <PasswordField
            name="newPassword"
            label="New Password"
            required
            srLabel="new password"
            placeholder="Enter your new password"
          >
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Password must contain at least 6 characters with uppercase, lowercase, and number
            </p>
          </PasswordField>

          {/* Confirm Password */}
          <PasswordField
            name="confirmPassword"
            label="Confirm New Password"
            required
            srLabel="confirm password"
            placeholder="Confirm your new password"
          />

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