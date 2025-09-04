import { useDispatch, useSelector } from 'react-redux'
import { updateUserData } from '../../store/authSlice'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useToast } from '../../contexts/ToastContext'
import Button from '../ui/Button'
import ImageUpload from '../ui/ImageUpload'
import { useImageUpload } from '../../hooks/useImageUpload'
import userService from '../../services/userService'
import authService from '../../services/authService'
import { FILE_SIZE_LIMITS_MB } from '../../../constants/fileConstants'

const ProfileForm = ({ profile = null, onCancel, onSuccess }) => {
  const dispatch = useDispatch()
  const { user: currentUser, token } = useSelector(state => state.adminAuth)
  const { handleApiResponse } = useToast()
  const { uploadImage, isAnyUploading, isUploading } = useImageUpload('profile')

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
  })

  // Initial form values
  const initialValues = {
    name: userData?.name || '',
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
  }

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Check if any images are still uploading
      if (isAnyUploading()) {
        setFieldError(
          'general',
          'Please wait for profile image upload to complete'
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

      // Prepare data for API
      const profileData = {
        name: values.name.trim(),
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
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
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
              <ErrorMessage
                name="name"
                component="div"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
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
              <ErrorMessage
                name="email"
                component="div"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
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
              <ErrorMessage
                name="phone"
                component="div"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>

            {/* Bio */}
            <div className="lg:col-span-2">
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
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
              <ErrorMessage
                name="bio"
                component="div"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>

            {/* LinkedIn URL */}
            <div>
              <label
                htmlFor="linkedUrl"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                LinkedIn URL
              </label>
              <Field
                type="url"
                name="linkedUrl"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.linkedUrl && touched.linkedUrl
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="https://linkedin.com/in/yourprofile"
              />
              <ErrorMessage
                name="linkedUrl"
                component="div"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>

            {/* GitHub URL */}
            <div>
              <label
                htmlFor="githubUrl"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                GitHub URL
              </label>
              <Field
                type="url"
                name="githubUrl"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.githubUrl && touched.githubUrl
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="https://github.com/yourusername"
              />
              <ErrorMessage
                name="githubUrl"
                component="div"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>

            {/* Location Section */}
            <div className="lg:col-span-2">
              <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-4">
                Location Information
              </h4>

              {/* Coordinates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="location.coordinates.latitude"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Latitude
                  </label>
                  <Field
                    type="number"
                    name="location.coordinates.latitude"
                    step="any"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location?.coordinates?.latitude &&
                      touched.location?.coordinates?.latitude
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-slate-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                    placeholder="40.7128"
                  />
                  <ErrorMessage
                    name="location.coordinates.latitude"
                    component="div"
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location.coordinates.longitude"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Longitude
                  </label>
                  <Field
                    type="number"
                    name="location.coordinates.longitude"
                    step="any"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location?.coordinates?.longitude &&
                      touched.location?.coordinates?.longitude
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-slate-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                    placeholder="-74.0060"
                  />
                  <ErrorMessage
                    name="location.coordinates.longitude"
                    component="div"
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="location.address"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Address
                  </label>
                  <Field
                    type="text"
                    name="location.address"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location?.address && touched.location?.address
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-slate-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                    placeholder="123 Main Street"
                  />
                  <ErrorMessage
                    name="location.address"
                    component="div"
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location.city"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    City
                  </label>
                  <Field
                    type="text"
                    name="location.city"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location?.city && touched.location?.city
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-slate-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                    placeholder="New York"
                  />
                  <ErrorMessage
                    name="location.city"
                    component="div"
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location.state"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    State/Province
                  </label>
                  <Field
                    type="text"
                    name="location.state"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location?.state && touched.location?.state
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-slate-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                    placeholder="NY"
                  />
                  <ErrorMessage
                    name="location.state"
                    component="div"
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location.country"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Country
                  </label>
                  <Field
                    type="text"
                    name="location.country"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location?.country && touched.location?.country
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-slate-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                    placeholder="United States"
                  />
                  <ErrorMessage
                    name="location.country"
                    component="div"
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location.zipCode"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                  >
                    Zip/Postal Code
                  </label>
                  <Field
                    type="text"
                    name="location.zipCode"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location?.zipCode && touched.location?.zipCode
                        ? 'border-red-300 dark:border-red-600'
                        : 'border-slate-300 dark:border-slate-600'
                    } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                    placeholder="10001"
                  />
                  <ErrorMessage
                    name="location.zipCode"
                    component="div"
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  />
                </div>
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
