import { useDispatch, useSelector } from 'react-redux'
import { updateUserData } from '../../store/authSlice'
import { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useToast } from '../../contexts/ToastContext'
import Button from '../ui/Button'
import ImageUpload from '../ui/ImageUpload'
import { useImageUpload } from '../../hooks/useImageUpload'
import userService from '../../services/userService'
import authService from '../../services/authService'

const ProfileForm = ({ profile = null, onCancel, onSuccess }) => {
  const dispatch = useDispatch()
  const { user: currentUser, token } = useSelector(state => state.adminAuth)
  const { handleApiResponse, showError } = useToast()
  const { uploadImage, uploadingImages, isAnyUploading, isUploading } = useImageUpload('profile')

  // Use profile data or fallback to current user
  const userData = profile || currentUser

  // Form validation schema
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: Yup.string()
      .required('Email is required')
      .email('Must be a valid email address'),
    phone: Yup.string()
      .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Must be a valid phone number'),
    bio: Yup.string()
      .max(500, 'Bio cannot exceed 500 characters'),
    profileImage: Yup.string()
  })

  // Initial form values
  const initialValues = {
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    bio: userData?.bio || '',
    profileImage: userData?.profileImage || ''
  }

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Check if any images are still uploading
      if (isAnyUploading()) {
        setFieldError('general', 'Please wait for profile image upload to complete')
        return
      }

      // Check for any File objects that failed to upload
      if (values.profileImage instanceof File) {
        setFieldError('profileImage', 'Profile image upload failed. Please try uploading again.')
        return
      }

      // Prepare data for API
      const profileData = {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        bio: values.bio.trim(),
        profileImage: values.profileImage
      }

      // Remove empty fields (except profileImage which needs to be explicitly set to empty for removal)
      Object.keys(profileData).forEach(key => {
        if (!profileData[key] && key !== 'profileImage') {
          delete profileData[key]
        }
      })

      // Update profile
      const response = await userService.updateProfile(profileData)
      
      // Update Redux store with new user data
      dispatch(updateUserData(response.data.user))
      
      // Update localStorage with new user data (keep existing token)
      authService.storeAuth(token, response.data.user)
      
      handleApiResponse(response)
      
      // Call onSuccess callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      if (error.message.includes('email already exists')) {
        setFieldError('email', 'This email is already in use')
      } else {
        setFieldError('general', error.message)
      }
    } finally {
      setSubmitting(false)
    }
  }


  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ isSubmitting, errors, touched, values, setFieldValue }) => (
        <Form className="space-y-4 sm:space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
              <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Profile Image */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Profile Image
              </label>
              <div className="max-w-xs">
                <ImageUpload
                  value={values.profileImage}
                  onChange={async (file) => {
                    if (file) {
                      setFieldValue('profileImage', file)
                      try {
                        const uploadedUrl = await uploadImage(file, 'profileImage')
                        if (uploadedUrl) {
                          setFieldValue('profileImage', uploadedUrl)
                        }
                      } catch (error) {
                        console.error('Background upload failed:', error)
                      }
                    }
                  }}
                  onRemove={() => setFieldValue('profileImage', '')}
                  isUploading={isUploading('profileImage')}
                  placeholder="Select profile image"
                  maxSize="5MB"
                />
              </div>
              <ErrorMessage name="profileImage" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name *
              </label>
              <Field
                type="text"
                name="name"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name && touched.name
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="Enter your full name"
              />
              <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address *
              </label>
              <Field
                type="email"
                name="email"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email && touched.email
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="Enter your email address"
              />
              <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Phone Number
              </label>
              <Field
                type="tel"
                name="phone"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone && touched.phone
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="Enter your phone number"
              />
              <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Bio */}
            <div className="lg:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Bio
              </label>
              <Field
                as="textarea"
                name="bio"
                rows={4}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.bio && touched.bio
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none`}
                placeholder="Tell us about yourself (max 500 characters)"
              />
              <ErrorMessage name="bio" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white flex-shrink-0"></div>
              )}
              <span>
                {isSubmitting 
                  ? 'Updating...' 
                  : isAnyUploading()
                    ? 'Update Profile (Uploading...)'
                    : 'Update Profile'}
              </span>
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default ProfileForm