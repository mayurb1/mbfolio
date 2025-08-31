import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import Button from '../ui/Button'
import { createSkill, updateSkill, fetchSkills } from '../../store/skillsSlice'

const SkillForm = ({ skill = null, onCancel }) => {
  const dispatch = useDispatch()
  const { categories } = useSelector(state => state.skills)
  const isEditing = !!skill

  // Use dynamic categories from categories API or fallback
  const availableCategories = categories.length > 0 ? categories : [
    'Frontend', 'Backend', 'Database', 'DevOps', 
    'Mobile', 'Design', 'Tools', 'Other'
  ]

  const proficiencyLevels = [
    'Beginner', 'Intermediate', 'Advanced', 'Expert'
  ]

  const initialValues = {
    name: skill?.name || '',
    category: skill?.category || '',
    proficiency: skill?.proficiency || '',
    experience: skill?.experience || 0,
    description: skill?.description || '',
    icon: skill?.icon || '',
    color: skill?.color || '#3B82F6',
    isActive: skill?.isActive !== false,
    sortOrder: skill?.sortOrder || 0
  }

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Skill name must be at least 2 characters')
      .max(100, 'Skill name cannot exceed 100 characters')
      .required('Skill name is required'),
    category: Yup.string()
      .oneOf(availableCategories, 'Please select a valid category')
      .required('Category is required'),
    proficiency: Yup.string()
      .oneOf(proficiencyLevels, 'Please select a valid proficiency level')
      .required('Proficiency level is required'),
    experience: Yup.number()
      .min(0, 'Experience cannot be negative')
      .max(50, 'Experience cannot exceed 50 years'),
    description: Yup.string()
      .max(500, 'Description cannot exceed 500 characters'),
    icon: Yup.string(),
    color: Yup.string()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex color code'),
    isActive: Yup.boolean(),
    sortOrder: Yup.number()
      .integer('Sort order must be a whole number')
  })

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      if (isEditing) {
        await dispatch(updateSkill({ id: skill._id, skillData: values })).unwrap()
      } else {
        await dispatch(createSkill(values)).unwrap()
      }
      
      // Refresh skills list
      dispatch(fetchSkills({ page: 1, limit: 10 }))
    } catch (error) {
      // Handle validation errors from the server
      if (error.includes('already exists')) {
        setFieldError('name', 'A skill with this name already exists')
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
            {/* Skill Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Skill Name *
              </label>
              <Field
                type="text"
                name="name"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name && touched.name
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="e.g., React, Node.js, Python"
              />
              <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category *
              </label>
              <Field
                as="select"
                name="category"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.category && touched.category
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
              >
                <option value="">Select a category</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="category" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Proficiency */}
            <div>
              <label htmlFor="proficiency" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Proficiency Level *
              </label>
              <Field
                as="select"
                name="proficiency"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.proficiency && touched.proficiency
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
              >
                <option value="">Select proficiency level</option>
                {proficiencyLevels.map(level => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="proficiency" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Experience (years)
              </label>
              <Field
                type="number"
                name="experience"
                min="0"
                max="50"
                step="0.1"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.experience && touched.experience
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="0.0"
              />
              <ErrorMessage name="experience" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Color */}
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Color
              </label>
              <div className="flex items-center gap-2">
                <Field
                  type="color"
                  name="color"
                  className="w-12 h-10 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer"
                />
                <Field
                  type="text"
                  name="color"
                  className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.color && touched.color
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-slate-300 dark:border-slate-600'
                  } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                  placeholder="#3B82F6"
                />
              </div>
              <ErrorMessage name="color" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Icon */}
            <div>
              <label htmlFor="icon" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Icon (Emoji or Unicode)
              </label>
              <Field
                type="text"
                name="icon"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.icon && touched.icon
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="⚛️ 🚀 💻"
              />
              <ErrorMessage name="icon" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Sort Order */}
            <div>
              <label htmlFor="sortOrder" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Sort Order
              </label>
              <Field
                type="number"
                name="sortOrder"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.sortOrder && touched.sortOrder
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="0"
              />
              <ErrorMessage name="sortOrder" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <Field
                as="textarea"
                name="description"
                rows={3}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description && touched.description
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none`}
                placeholder="Brief description of your experience with this skill"
              />
              <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
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
                  Active (show this skill in portfolio)
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
              {isEditing ? 'Update Skill' : 'Add Skill'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default SkillForm