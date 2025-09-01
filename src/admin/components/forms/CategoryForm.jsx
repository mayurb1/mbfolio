import { useDispatch } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useToast } from '../../contexts/ToastContext'
import Button from '../ui/Button'
import { createCategory, updateCategory, fetchCategories } from '../../store/categoriesSlice'

const CategoryForm = ({ category = null, onCancel }) => {
  const dispatch = useDispatch()
  const { handleApiResponse } = useToast()
  const isEditing = !!category

  const initialValues = {
    name: category?.name || '',
    isActive: category?.isActive !== false
  }

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Category name must be at least 2 characters')
      .max(50, 'Category name cannot exceed 50 characters')
      .required('Category name is required'),
    isActive: Yup.boolean()
  })

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      let response
      if (isEditing) {
        response = await dispatch(updateCategory({ id: category._id, categoryData: values })).unwrap()
      } else {
        response = await dispatch(createCategory(values)).unwrap()
      }
      
      // Show toast message based on API response status
      handleApiResponse(response)
      
      // Refresh categories list
      dispatch(fetchCategories({ page: 1, limit: 50 }))
      onCancel() // Close the modal
    } catch (error) {
      // Handle validation errors from the server
      if (error.includes('already exists')) {
        setFieldError('name', 'A category with this name already exists')
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
      {({ isSubmitting, errors, touched }) => (
        <Form className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Category Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Category Name *
              </label>
              <Field
                type="text"
                name="name"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name && touched.name
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="e.g., Frontend, Backend, DevOps"
              />
              <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Is Active */}
            <div>
              <label className="flex items-center">
                <Field
                  type="checkbox"
                  name="isActive"
                  className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-900"
                />
                <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Active (show this category in skills selection)
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
              {isEditing ? 'Update Category' : 'Add Category'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default CategoryForm