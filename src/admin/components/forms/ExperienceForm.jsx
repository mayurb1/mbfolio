import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useToast } from '../../contexts/ToastContext'
import Button from '../ui/Button'
import MultiSelect from '../ui/MultiSelect'
import DateRangePicker from '../ui/DateRangePicker'
import { createExperience, updateExperience, fetchExperiences, fetchSkills } from '../../store/experiencesSlice'
import { Plus, X } from 'lucide-react'

const ExperienceForm = ({ experience = null, onCancel }) => {
  const dispatch = useDispatch()
  const { handleApiResponse } = useToast()
  const { skills, skillsLoading } = useSelector(state => state.experiences)
  const isEditing = !!experience

  useEffect(() => {
    dispatch(fetchSkills())
  }, [dispatch])

  const employmentTypes = [
    'Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'
  ]

  // Parse duration for date range picker
  const parseDuration = (duration) => {
    if (!duration) return { startDate: null, endDate: null }
    
    if (duration.toLowerCase().includes('present')) {
      const parts = duration.split('–')
      if (parts.length === 2) {
        const startPart = parts[0].trim()
        return { startDate: startPart, endDate: 'Present' }
      }
    }
    
    const parts = duration.split('–')
    if (parts.length === 2) {
      return { startDate: parts[0].trim(), endDate: parts[1].trim() }
    }
    
    return { startDate: duration, endDate: null }
  }

  const { startDate, endDate } = parseDuration(experience?.duration)

  const initialValues = {
    company: experience?.company || '',
    position: experience?.position || '',
    startDate: startDate || null,
    endDate: endDate || null,
    location: experience?.location || '',
    type: experience?.type || 'Full-time',
    logo: experience?.logo || '',
    website: experience?.website || '',
    description: experience?.description || '',
    achievements: experience?.achievements || [''],
    skills: experience?.skills?.map(skill => skill._id) || [],
    highlights: experience?.highlights || [{ metric: '', description: '' }],
    isActive: experience?.isActive !== false,
    order: experience?.order || 0
  }

  const validationSchema = Yup.object({
    company: Yup.string()
      .min(2, 'Company name must be at least 2 characters')
      .max(200, 'Company name cannot exceed 200 characters')
      .required('Company name is required'),
    position: Yup.string()
      .min(2, 'Position must be at least 2 characters')
      .max(200, 'Position cannot exceed 200 characters')
      .required('Position is required'),
    startDate: Yup.string()
      .required('Start date is required'),
    endDate: Yup.string()
      .nullable(),
    location: Yup.string()
      .min(2, 'Location must be at least 2 characters')
      .max(100, 'Location cannot exceed 100 characters')
      .required('Location is required'),
    type: Yup.string()
      .oneOf(employmentTypes, 'Please select a valid employment type'),
    logo: Yup.string().url('Logo must be a valid URL'),
    website: Yup.string().url('Website must be a valid URL'),
    description: Yup.string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description cannot exceed 1000 characters')
      .required('Description is required'),
    achievements: Yup.array().of(
      Yup.string().max(500, 'Achievement cannot exceed 500 characters')
    ),
    skills: Yup.array().of(
      Yup.string().required('Skill selection is required')
    ),
    highlights: Yup.array().of(
      Yup.object().shape({
        metric: Yup.string().max(50, 'Metric cannot exceed 50 characters'),
        description: Yup.string().max(100, 'Description cannot exceed 100 characters')
      })
    ),
    isActive: Yup.boolean(),
    order: Yup.number().min(0, 'Order cannot be negative')
  })

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Format duration from date range
      let duration = ''
      if (values.startDate) {
        const startDate = new Date(values.startDate)
        const startStr = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        
        if (values.endDate && values.endDate.toLowerCase() === 'present') {
          duration = `${startStr} – Present`
        } else if (values.endDate) {
          const endDate = new Date(values.endDate)
          const endStr = endDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          duration = `${startStr} – ${endStr}`
        } else {
          duration = startStr
        }
      }

      // Filter out empty achievements and technologies
      const cleanValues = {
        ...values,
        duration,
        achievements: values.achievements.filter(achievement => achievement.trim() !== ''),
        skills: values.skills,
        highlights: values.highlights.filter(highlight => highlight.metric.trim() !== '' && highlight.description.trim() !== '')
      }
      
      // Remove date fields as they're converted to duration string
      delete cleanValues.startDate
      delete cleanValues.endDate

      let response
      if (isEditing) {
        response = await dispatch(updateExperience({ id: experience._id, experienceData: cleanValues })).unwrap()
      } else {
        response = await dispatch(createExperience(cleanValues)).unwrap()
      }
      
      handleApiResponse(response)
      dispatch(fetchExperiences({ page: 1, limit: 10 }))
      onCancel()
    } catch (error) {
      if (error.includes('already exists')) {
        setFieldError('company', 'Experience with this company and position already exists')
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
            {/* Company */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Company *
              </label>
              <Field
                type="text"
                name="company"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.company && touched.company
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="e.g., IndiaNIC Infotech Limited"
              />
              <ErrorMessage name="company" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Position */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Position *
              </label>
              <Field
                type="text"
                name="position"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.position && touched.position
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="e.g., Software Engineer"
              />
              <ErrorMessage name="position" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
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

            {/* Employment Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Employment Type
              </label>
              <Field
                as="select"
                name="type"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {employmentTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Field>
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
                Company Logo URL
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
                Company Website
              </label>
              <Field
                type="text"
                name="website"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.website && touched.website
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="https://company.com"
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
                placeholder="Describe your role and responsibilities..."
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

            {/* Skills */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Skills Used *
              </label>
              <Field name="skills">
                {({ field, form }) => (
                  <MultiSelect
                    options={skills}
                    value={field.value}
                    onChange={(selectedValues) => form.setFieldValue('skills', selectedValues)}
                    placeholder="Select skills used in this experience..."
                    loading={skillsLoading}
                    error={form.errors.skills && form.touched.skills}
                    searchable={true}
                    getOptionLabel={(skill) => skill.name}
                    getOptionValue={(skill) => skill._id}
                  />
                )}
              </Field>
              <ErrorMessage name="skills" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Highlights */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Highlights
              </label>
              <FieldArray name="highlights">
                {({ push, remove }) => (
                  <div className="space-y-3">
                    {values.highlights.map((highlight, index) => (
                      <div key={index} className="flex gap-2">
                        <Field
                          name={`highlights.${index}.metric`}
                          className="w-32 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          placeholder="Metric"
                        />
                        <Field
                          name={`highlights.${index}.description`}
                          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          placeholder="Description"
                        />
                        {values.highlights.length > 1 && (
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
                      onClick={() => push({ metric: '', description: '' })}
                      className="flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add Highlight
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
                  Active (show this experience in portfolio)
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
              {isEditing ? 'Update Experience' : 'Add Experience'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default ExperienceForm