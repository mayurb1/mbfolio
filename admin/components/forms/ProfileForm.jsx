'use client'

import { useDispatch, useSelector } from 'react-redux'
import { updateUserData } from '../../store/authSlice'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useToast } from '../../contexts/ToastContext'
import Button from '../ui/Button'
import ImageUpload from '../ui/ImageUpload'
import PDFUpload from '../ui/PDFUpload'
import FormField from './fields/FormField'
import FormTextArea from './fields/FormTextArea'
import { useImageUpload } from '../../hooks/useImageUpload'
import { usePDFUpload } from '../../hooks/usePDFUpload'
import userService from '../../services/userService'
import { FILE_SIZE_LIMITS_MB } from '../../../constants/fileConstants'

const ProfileForm = ({ profile = null, onCancel, onSuccess }) => {
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector(state => state.adminAuth)
  const { handleApiResponse } = useToast()
  const { uploadImage, isAnyUploading: isAnyImageUploading, isUploading } = useImageUpload('profile')
  const { uploadPDF, isAnyUploading: isAnyPDFUploading, isUploading: isPDFUploading } = usePDFUpload()

  // Use profile data or fallback to current user
  const userData = profile || currentUser

  // Form validation schema
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    username: Yup.string()
      .required('Username is required')
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .matches(
        /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
        'Only lowercase letters, numbers and hyphens'
      ),
    email: Yup.string()
      .required('Email is required')
      .email('Must be a valid email address'),
    phone: Yup.string().matches(
      /^[\+]?[1-9][\d]{0,15}$/,
      'Must be a valid phone number'
    ),
    bio: Yup.string().max(1000, 'Bio cannot exceed 1000 characters'),
    profileImage: Yup.string(),
    linkedUrl: Yup.string().url('Must be a valid URL'),
    githubUrl: Yup.string()
      .url('Must be a valid URL')
      .matches(
        /^https?:\/\/(www\.)?github\.com\/.+/,
        'Must be a valid GitHub URL'
      ),
    location: Yup.object().shape({
      coordinates: Yup.object().shape({
        latitude: Yup.number()
          .min(-90, 'Latitude must be between -90 and 90')
          .max(90, 'Latitude must be between -90 and 90'),
        longitude: Yup.number()
          .min(-180, 'Longitude must be between -180 and 180')
          .max(180, 'Longitude must be between -180 and 180'),
      }),
      address: Yup.string().max(200, 'Address cannot exceed 200 characters'),
      city: Yup.string().max(100, 'City cannot exceed 100 characters'),
      state: Yup.string().max(100, 'State cannot exceed 100 characters'),
      country: Yup.string().max(100, 'Country cannot exceed 100 characters'),
      zipCode: Yup.string().max(20, 'Zip code cannot exceed 20 characters'),
    }),
    headline: Yup.string().max(200, 'Headline cannot exceed 200 characters'),
    availability: Yup.boolean(),
    resume: Yup.string(),
  })

  // Initial form values
  const initialValues = {
    name: userData?.name || '',
    username: userData?.username || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    bio: userData?.bio || '',
    profileImage: userData?.profileImage || '',
    linkedUrl: userData?.linkedUrl || '',
    githubUrl: userData?.githubUrl || '',
    location: {
      coordinates: {
        latitude: userData?.location?.coordinates?.latitude || '',
        longitude: userData?.location?.coordinates?.longitude || '',
      },
      address: userData?.location?.address || '',
      city: userData?.location?.city || '',
      state: userData?.location?.state || '',
      country: userData?.location?.country || '',
      zipCode: userData?.location?.zipCode || '',
    },
    headline: userData?.headline || '',
    availability: userData?.availability !== undefined ? userData.availability : true,
    resume: userData?.resume || '',
  }

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Check if any files are still uploading
      if (isAnyImageUploading() || isAnyPDFUploading()) {
        setFieldError(
          'general',
          'Please wait for file uploads to complete'
        )
        return
      }

      // Check for any File objects that failed to upload
      if (values.profileImage instanceof File) {
        setFieldError(
          'profileImage',
          'Profile image upload failed. Please try uploading again.'
        )
        return
      }

      if (values.resume instanceof File) {
        setFieldError(
          'resume',
          'Resume upload failed. Please try uploading again.'
        )
        return
      }

      // Prepare data for API
      const profileData = {
        name: values.name.trim(),
        username: values.username.trim().toLowerCase(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        bio: values.bio.trim(),
        profileImage: values.profileImage,
        linkedUrl: values.linkedUrl.trim(),
        githubUrl: values.githubUrl.trim(),
        location: {
          coordinates: {
            latitude: values.location.coordinates.latitude
              ? parseFloat(values.location.coordinates.latitude)
              : undefined,
            longitude: values.location.coordinates.longitude
              ? parseFloat(values.location.coordinates.longitude)
              : undefined,
          },
          address: values.location.address.trim(),
          city: values.location.city.trim(),
          state: values.location.state.trim(),
          country: values.location.country.trim(),
          zipCode: values.location.zipCode.trim(),
        },
        headline: values.headline.trim(),
        availability: values.availability,
        resume: values.resume,
      }

      // Remove empty fields (except profileImage, resume, and availability which need to be explicitly set)
      Object.keys(profileData).forEach(key => {
        if (!profileData[key] && key !== 'profileImage' && key !== 'resume' && key !== 'availability') {
          delete profileData[key]
        }
      })

      // Update profile
      const response = await userService.updateProfile(profileData)

      // Update Redux store with new user data
      dispatch(updateUserData(response.data.user))

      handleApiResponse(response)

      // Call onSuccess callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      if (error.message.includes('email already exists')) {
        setFieldError('email', 'This email is already in use')
      } else if (/username/i.test(error.message)) {
        setFieldError('username', error.message)
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
              <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">
                {errors.general}
              </p>
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
                  onChange={async file => {
                    if (file) {
                      setFieldValue('profileImage', file)
                      try {
                        const uploadedUrl = await uploadImage(
                          file,
                          'profileImage'
                        )
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
                  maxSize={FILE_SIZE_LIMITS_MB.PROFILE_IMAGE}
                />
              </div>
              <ErrorMessage
                name="profileImage"
                component="div"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>

            {/* Name */}
            <FormField
              name="name"
              label="Full Name"
              required
              placeholder="Enter your full name"
            />

            {/* Username */}
            <div>
              <FormField
                name="username"
                label="Username"
                required
                placeholder="your-username"
              />
              <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                Public URL: /profile/{values.username || 'username'}. Changing it
                will break existing links to your old URL.
              </p>
            </div>

            {/* Email */}
            <FormField
              name="email"
              label="Email Address"
              type="email"
              required
              placeholder="Enter your email address"
            />

            {/* Phone */}
            <FormField
              name="phone"
              label="Phone Number"
              type="tel"
              placeholder="Enter your phone number"
            />

            {/* Bio */}
            <FormTextArea
              name="bio"
              label="Bio"
              rows={4}
              placeholder="Tell us about yourself (max 1000 characters)"
              wrapperClassName="lg:col-span-2"
            />

            {/* Headline */}
            <FormField
              name="headline"
              label="Professional Headline"
              placeholder="e.g. Full Stack Developer | React & Node.js Expert"
              wrapperClassName="lg:col-span-2"
            />

            {/* Availability */}
            <div>
              <label
                htmlFor="availability"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Availability Status
              </label>
              <Field name="availability">
                {({ field, form }) => (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="availability"
                      checked={field.value}
                      onChange={(e) => form.setFieldValue('availability', e.target.checked)}
                      name="availability"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded"
                    />
                    <label
                      htmlFor="availability"
                      className="ml-2 text-sm text-slate-700 dark:text-slate-300"
                    >
                      Available for work/opportunities
                    </label>
                  </div>
                )}
              </Field>
              <ErrorMessage
                name="availability"
                component="div"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Resume (PDF)
              </label>
              <PDFUpload
                value={values.resume}
                onChange={async file => {
                  if (file) {
                    setFieldValue('resume', file)
                    try {
                      const uploadedUrl = await uploadPDF(file, 'resume')
                      if (uploadedUrl) {
                        setFieldValue('resume', uploadedUrl)
                      }
                    } catch (error) {
                      console.error('Background resume upload failed:', error)
                    }
                  }
                }}
                onRemove={() => setFieldValue('resume', '')}
                isUploading={isPDFUploading('resume')}
                placeholder="Select your resume (PDF)"
                maxSize={FILE_SIZE_LIMITS_MB.RESUME_PDF}
              />
              <ErrorMessage
                name="resume"
                component="div"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>

            {/* LinkedIn URL */}
            <FormField
              name="linkedUrl"
              label="LinkedIn URL"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
            />

            {/* GitHub URL */}
            <FormField
              name="githubUrl"
              label="GitHub URL"
              type="url"
              placeholder="https://github.com/yourusername"
            />

            {/* Location Section */}
            <div className="lg:col-span-2">
              <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-4">
                Location Information
              </h4>

              {/* Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <FormField
                  name="location.coordinates.latitude"
                  label="Latitude"
                  type="number"
                  step="any"
                  placeholder="40.7128"
                />

                <FormField
                  name="location.coordinates.longitude"
                  label="Longitude"
                  type="number"
                  step="any"
                  placeholder="-74.0060"
                />
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  name="location.address"
                  label="Address"
                  placeholder="123 Main Street"
                  wrapperClassName="sm:col-span-2"
                />

                <FormField
                  name="location.city"
                  label="City"
                  placeholder="New York"
                />

                <FormField
                  name="location.state"
                  label="State/Province"
                  placeholder="NY"
                />

                <FormField
                  name="location.country"
                  label="Country"
                  placeholder="United States"
                />

                <FormField
                  name="location.zipCode"
                  label="Zip/Postal Code"
                  placeholder="10001"
                />
              </div>
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
                  : isAnyImageUploading() || isAnyPDFUploading()
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