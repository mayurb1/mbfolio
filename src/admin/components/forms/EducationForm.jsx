import { useDispatch } from 'react-redux'
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useToast } from '../../contexts/ToastContext'
import Button from '../ui/Button'
import DateRangePicker from '../ui/DateRangePicker'
import { createEducation, updateEducation, fetchEducation } from '../../store/educationSlice'
import { Plus, X } from 'lucide-react'

const EducationForm = ({ education = null, onCancel }) => {
  const dispatch = useDispatch()
  const { handleApiResponse } = useToast()
  const isEditing = !!education

  // Get initial date values from the education data
  const getInitialDates = () => {
    if (!education) return { startDate: '', endDate: '' }
    
    return {
      startDate: education.startDate ? new Date(education.startDate).toISOString().split('T')[0] : '',
      endDate: education.isOngoing ? 'Present' : (education.endDate ? new Date(education.endDate).toISOString().split('T')[0] : '')
    }
  }

  const { startDate, endDate } = getInitialDates()

  const initialValues = {
    institution: education?.institution || '',
    degree: education?.degree || '',
    startDate: startDate || '',
    endDate: endDate || '',
    location: education?.location || '',
    gpa: education?.gpa || '',
    logo: education?.logo || '',
    website: education?.website || '',
    description: education?.description || '',
    achievements: education?.achievements || [''],
    isActive: education?.isActive !== false,
    order: education?.order || 0
  }

  const validationSchema = Yup.object({
    institution: Yup.string()
      .min(2, 'Institution name must be at least 2 characters')
      .max(200, 'Institution name cannot exceed 200 characters')
      .required('Institution name is required'),
    degree: Yup.string()
      .min(2, 'Degree must be at least 2 characters')
      .max(200, 'Degree cannot exceed 200 characters')
      .required('Degree is required'),
    startDate: Yup.date()
      .required('Start date is required')
      .max(new Date(), 'Start date cannot be in the future'),
    endDate: Yup.mixed()
      .nullable()
      .test('is-date-or-present', 'End date must be a valid date or "Present"', function(value) {
        if (!value || value === '' || value === 'Present' || value.toLowerCase() === 'present') {
          return true
        }
        const date = new Date(value)
        return !isNaN(date.getTime())
      })
      .when('startDate', {
        is: (startDate) => startDate && startDate !== '',
        then: (schema) => schema.test('is-after-start', 'End date must be after start date', function(value) {
          if (!value || value === 'Present' || value.toLowerCase() === 'present') {
            return true
          }
          const startDate = new Date(this.parent.startDate)
          const endDate = new Date(value)
          return endDate >= startDate
        })
      })
      .test('not-future', 'End date cannot be in the future', function(value) {
        if (!value || value === 'Present' || value.toLowerCase() === 'present') {
          return true
        }
        const date = new Date(value)
        return date <= new Date()
      }),
    location: Yup.string()
      .min(2, 'Location must be at least 2 characters')
      .max(100, 'Location cannot exceed 100 characters')
      .required('Location is required'),
    gpa: Yup.string()
      .max(50, 'GPA cannot exceed 50 characters'),
    logo: Yup.string().url('Logo must be a valid URL'),
    website: Yup.string().url('Website must be a valid URL'),
    description: Yup.string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description cannot exceed 1000 characters')
      .required('Description is required'),
    achievements: Yup.array().of(
      Yup.string().max(500, 'Achievement cannot exceed 500 characters')
    ),
    isActive: Yup.boolean(),
    order: Yup.number().min(0, 'Order cannot be negative')
  })

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Filter out empty achievements
      const cleanValues = {
        ...values,
        startDate: values.startDate ? new Date(values.startDate) : null,
        endDate: values.endDate && values.endDate.toLowerCase() !== 'present' ? new Date(values.endDate) : null,
        isOngoing: values.endDate && values.endDate.toLowerCase() === 'present',
        achievements: values.achievements.filter(achievement => achievement.trim() !== '')
      }

      let response
      if (isEditing) {
        response = await dispatch(updateEducation({ id: education._id, educationData: cleanValues })).unwrap()
      } else {
        response = await dispatch(createEducation(cleanValues)).unwrap()
      }
      
      handleApiResponse(response)
      dispatch(fetchEducation({ page: 1, limit: 10 }))
      onCancel()
    } catch (error) {
      if (error.includes('already exists')) {
        setFieldError('institution', 'Education record with this institution and degree already exists')
      } else {
        setFieldError('general', error)
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
        <Form className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Institution */}
            <div>
              <label htmlFor="institution" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Institution *
              </label>
              <Field
                type="text"
                name="institution"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.institution && touched.institution
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="e.g., Silver Oak College of Engineering and Technology"
              />
              <ErrorMessage name="institution" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Degree */}
            <div>
              <label htmlFor="degree" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Degree *
              </label>
              <Field
                type="text"
                name="degree"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.degree && touched.degree
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="e.g., B.Tech in Computer Science"
              />
              <ErrorMessage name="degree" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Duration - Date Range Picker */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Duration *
              </label>
              <DateRangePicker
                startDate={values.startDate}
                endDate={values.endDate}
                onChange={(start, end) => {
                  setFieldValue('startDate', start)
                  setFieldValue('endDate', end)
                }}
                allowPresent={true}
                error={(errors.startDate && touched.startDate) || (errors.endDate && touched.endDate)}
                className=""
              />
              {errors.startDate && touched.startDate && (
                <div className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate}</div>
              )}
              {errors.endDate && touched.endDate && (
                <div className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate}</div>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Location *
              </label>
              <Field
                type="text"
                name="location"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.location && touched.location
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="e.g., Ahmedabad, India"
              />
              <ErrorMessage name="location" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* GPA */}
            <div>
              <label htmlFor="gpa" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                GPA/Grade
              </label>
              <Field
                type="text"
                name="gpa"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.gpa && touched.gpa
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="e.g., CGPA: 8.00/10"
              />
              <ErrorMessage name="gpa" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Order */}
            <div>
              <label htmlFor="order" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Display Order
              </label>
              <Field
                type="number"
                name="order"
                min="0"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.order && touched.order
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="0"
              />
              <ErrorMessage name="order" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Logo URL */}
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Institution Logo URL
              </label>
              <Field
                type="text"
                name="logo"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.logo && touched.logo
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="https://example.com/logo.png"
              />
              <ErrorMessage name="logo" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Institution Website
              </label>
              <Field
                type="text"
                name="website"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.website && touched.website
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="https://institution.edu"
              />
              <ErrorMessage name="website" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description *
              </label>
              <Field
                as="textarea"
                name="description"
                rows={4}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description && touched.description
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none`}
                placeholder="Describe your studies, projects, and academic focus..."
              />
              <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Achievements */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Key Achievements
              </label>
              <FieldArray name="achievements">
                {({ push, remove }) => (
                  <div className="space-y-2">
                    {values.achievements.map((achievement, index) => (
                      <div key={index} className="flex gap-2">
                        <Field
                          name={`achievements.${index}`}
                          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          placeholder={`Achievement ${index + 1}`}
                        />
                        {values.achievements.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                            className="p-2"
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => push('')}
                      className="flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add Achievement
                    </Button>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* Is Active */}
            <div className="md:col-span-2">
              <label className="flex items-center">
                <Field
                  type="checkbox"
                  name="isActive"
                  className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-900"
                />
                <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Active (show this education record in portfolio)
                </span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {isEditing ? 'Update Education' : 'Add Education'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default EducationForm