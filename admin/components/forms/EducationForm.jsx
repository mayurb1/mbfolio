'use client'

import { useDispatch } from 'react-redux'
import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { useToast } from '../../contexts/ToastContext'
import Button from '../ui/Button'
import DateRangePicker from '../ui/DateRangePicker'
import FormField from './fields/FormField'
import FormTextArea from './fields/FormTextArea'
import StringArrayField from './fields/StringArrayField'
import { endDateSchema, getInitialDateRange, serializeDateRange } from './fields/dateRangeValidation'
import { createEducation, updateEducation, fetchEducation } from '../../store/educationSlice'

const EducationForm = ({ education = null, onCancel }) => {
  const dispatch = useDispatch()
  const { handleApiResponse } = useToast()
  const isEditing = !!education

  // Get initial date values from the education data
  const { startDate, endDate } = getInitialDateRange(education)

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
    endDate: endDateSchema,
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
        ...serializeDateRange(values),
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
            <FormField
              name="institution"
              label="Institution"
              required
              placeholder="e.g., Silver Oak College of Engineering and Technology"
            />

            {/* Degree */}
            <FormField
              name="degree"
              label="Degree"
              required
              placeholder="e.g., B.Tech in Computer Science"
            />

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
            <FormField
              name="location"
              label="Location"
              required
              placeholder="e.g., Ahmedabad, India"
            />

            {/* GPA */}
            <FormField
              name="gpa"
              label="GPA/Grade"
              placeholder="e.g., CGPA: 8.00/10"
            />

            {/* Order */}
            <FormField
              name="order"
              label="Display Order"
              type="number"
              min="0"
              placeholder="0"
            />

            {/* Logo URL */}
            <FormField
              name="logo"
              label="Institution Logo URL"
              placeholder="https://example.com/logo.png"
            />

            {/* Website */}
            <FormField
              name="website"
              label="Institution Website"
              placeholder="https://institution.edu"
            />

            {/* Description */}
            <FormTextArea
              name="description"
              label="Description"
              required
              rows={4}
              placeholder="Describe your studies, projects, and academic focus..."
              wrapperClassName="md:col-span-2"
            />

            {/* Achievements */}
            <StringArrayField
              name="achievements"
              label="Key Achievements"
              addButtonText="Add Achievement"
              placeholder={index => `Achievement ${index + 1}`}
              wrapperClassName="md:col-span-2"
            />

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