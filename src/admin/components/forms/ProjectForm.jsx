import { useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useToast } from '../../contexts/ToastContext'
import Button from '../ui/Button'
import ImageUpload from '../ui/ImageUpload'
import MultiImageUpload from '../ui/MultiImageUpload'
import MultiSelect from '../ui/MultiSelect'
import { createProject, updateProject, fetchProjects } from '../../store/projectSlice'
import { useImageUpload } from '../../hooks/useImageUpload'
import categoriesService from '../../services/categoriesService'
import skillsService from '../../services/skillsService'
import { Plus, X } from 'lucide-react'

const ProjectForm = ({ project = null, onCancel, onSuccess }) => {
  const dispatch = useDispatch()
  const { handleApiResponse, showError } = useToast()
  const { uploadImage, uploadingImages, isAnyUploading, isUploading } = useImageUpload()
  const isEditing = !!project

  // State for dynamic data
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [skills, setSkills] = useState([])
  const [loadingSkills, setLoadingSkills] = useState(true)

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const response = await categoriesService.getAllCategories({ isActive: true, limit: 1000 })
        setCategories(response.data.categories || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
        showError('Failed to load categories', error.message)
        // Fallback to hardcoded categories if API fails
        setCategories([
          { _id: '1', name: 'Full-Stack' },
          { _id: '2', name: 'Frontend' },
          { _id: '3', name: 'Backend' },
          { _id: '4', name: 'Mobile' },
          { _id: '5', name: 'Data Science' },
          { _id: '6', name: 'DevOps' },
          { _id: '7', name: 'Other' }
        ])
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [showError])

  // Fetch skills on component mount
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoadingSkills(true)
        const response = await skillsService.getAllSkills({ isActive: true, limit: 100 })
        setSkills(response.data.skills || [])
      } catch (error) {
        console.error('Error fetching skills:', error)
        showError('Failed to load skills', error.message)
        setSkills([])
      } finally {
        setLoadingSkills(false)
      }
    }

    fetchSkills()
  }, [showError])

  // Form validation schema
  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .required('Title is required')
      .max(200, 'Title cannot exceed 200 characters'),
    description: Yup.string()
      .required('Description is required')
      .max(500, 'Description cannot exceed 500 characters'),
    fullDescription: Yup.string()
      .required('Full description is required')
      .max(2000, 'Full description cannot exceed 2000 characters'),
    category: Yup.string()
      .required('Category is required'),
    status: Yup.string()
      .oneOf(['completed', 'ongoing', 'planned', 'archived'])
      .default('completed'),
    type: Yup.string()
      .oneOf(['personal', 'organization', 'freelance', 'open-source'])
      .default('personal'),
    technologies: Yup.array().of(Yup.string()),
    highlights: Yup.array().of(Yup.string().max(500, 'Highlight too long')),
    images: Yup.array(),
    mainImage: Yup.string(),
    github: Yup.string().url('Must be a valid URL'),
    demo: Yup.string().url('Must be a valid URL'),
    duration: Yup.string().max(50, 'Duration too long'),
    team: Yup.string().max(100, 'Team info too long')
  })

  // Initial form values
  const initialValues = {
    title: project?.title || '',
    description: project?.description || '',
    fullDescription: project?.fullDescription || '',
    category: project?.category?._id || project?.category || '',  // Handle both populated and non-populated category
    status: project?.status || 'completed',
    type: project?.type || 'personal',
    technologies: project?.technologies?.map(tech => 
      typeof tech === 'object' && tech._id ? tech._id : tech  // Handle both populated objects and IDs
    ) || [],
    highlights: project?.highlights || [''],
    images: project?.images || [],
    mainImage: project?.mainImage || '',
    github: project?.github || '',
    demo: project?.demo || '',
    duration: project?.duration || '',
    team: project?.team || '',
    featured: project?.featured || false,
    isActive: project?.isActive !== false
  }

  // Static options
  const statuses = ['completed', 'ongoing', 'planned', 'archived']
  const types = ['personal', 'organization', 'freelance', 'open-source']

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Check if any images are still uploading
      if (isAnyUploading()) {
        setFieldError('general', 'Please wait for image uploads to complete')
        return
      }

      // Check for any File objects that failed to upload
      if (values.mainImage instanceof File) {
        setFieldError('mainImage', 'Main image upload failed. Please try uploading again.')
        return
      }

      for (let i = 0; i < values.images.length; i++) {
        if (values.images[i] instanceof File) {
          setFieldError('images', `Image ${i + 1} upload failed. Please try uploading again.`)
          return
        }
      }

      // Keep technology IDs as they are (no conversion needed)
      const technologyIds = values.technologies

      // Filter out empty strings from arrays
      const cleanedValues = {
        ...values,
        mainImage: values.mainImage,
        images: values.images.filter(img => img && img.trim() && typeof img === 'string'),
        technologies: technologyIds,
        highlights: values.highlights.filter(highlight => highlight.trim())
      }

      // Validate that at least one technology is provided
      if (cleanedValues.technologies.length === 0) {
        setFieldError('technologies', 'Please add at least one technology')
        return
      }

      let response
      if (isEditing) {
        response = await dispatch(updateProject({ id: project._id, projectData: cleanedValues })).unwrap()
      } else {
        response = await dispatch(createProject(cleanedValues)).unwrap()
      }
      
      handleApiResponse(response)
      
      // Call onSuccess callback to refresh project list
      if (onSuccess) {
        onSuccess()
      } else {
        // Fallback: dispatch fetchProjects if onSuccess not provided
        dispatch(fetchProjects({ page: 1, limit: 10 }))
      }
      
      // Always call onCancel to close the modal
      if (onCancel) {
        onCancel()
      }
    } catch (error) {
      if (error.includes('already exists')) {
        setFieldError('title', 'Project with this title already exists')
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
        <Form className="space-y-4 sm:space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
              <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Project Title *
              </label>
              <Field
                type="text"
                name="title"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title && touched.title
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="Enter project title"
              />
              <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
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
                disabled={loadingCategories}
              >
                {loadingCategories ? (
                  <option value="">Loading categories...</option>
                ) : categories.length === 0 ? (
                  <option value="">No categories available</option>
                ) : (
                  <>
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </>
                )}
              </Field>
              <ErrorMessage name="category" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <Field
                as="select"
                name="status"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.status && touched.status
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
              >
                {statuses.map(status => (
                  <option key={status} value={status} className="capitalize">{status}</option>
                ))}
              </Field>
              <ErrorMessage name="status" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Type
              </label>
              <Field
                as="select"
                name="type"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.type && touched.type
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
              >
                {types.map(type => (
                  <option key={type} value={type} className="capitalize">{type}</option>
                ))}
              </Field>
              <ErrorMessage name="type" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Duration
              </label>
              <Field
                type="text"
                name="duration"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.duration && touched.duration
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="e.g., 3 months, 2 weeks"
              />
              <ErrorMessage name="duration" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Team */}
            <div>
              <label htmlFor="team" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Team
              </label>
              <Field
                type="text"
                name="team"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.team && touched.team
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="e.g., Solo, Team of 4"
              />
              <ErrorMessage name="team" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* GitHub URL */}
            <div>
              <label htmlFor="github" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                GitHub URL
              </label>
              <Field
                type="url"
                name="github"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.github && touched.github
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="https://github.com/username/repo"
              />
              <ErrorMessage name="github" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Demo URL */}
            <div>
              <label htmlFor="demo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Demo URL
              </label>
              <Field
                type="url"
                name="demo"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.demo && touched.demo
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
                placeholder="https://demo.example.com"
              />
              <ErrorMessage name="demo" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Main Image Upload */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Main Project Image
              </label>
              <ImageUpload
                value={values.mainImage}
                onChange={async (file) => {
                  if (file) {
                    setFieldValue('mainImage', file)
                    try {
                      const uploadedUrl = await uploadImage(file, 'mainImage')
                      if (uploadedUrl) {
                        setFieldValue('mainImage', uploadedUrl)
                      }
                    } catch (error) {
                      console.error('Background upload failed:', error)
                    }
                  }
                }}
                onRemove={() => setFieldValue('mainImage', '')}
                isUploading={isUploading('mainImage')}
                placeholder="Select main project image"
              />
              <ErrorMessage name="mainImage" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Short Description */}
            <div className="lg:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Short Description *
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
                placeholder="Brief project description (max 500 characters)"
              />
              <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Full Description */}
            <div className="lg:col-span-2">
              <label htmlFor="fullDescription" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Description *
              </label>
              <Field
                as="textarea"
                name="fullDescription"
                rows={5}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.fullDescription && touched.fullDescription
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none`}
                placeholder="Detailed project description (max 2000 characters)"
              />
              <ErrorMessage name="fullDescription" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Technologies */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Technologies *
              </label>
              <Field name="technologies">
                {({ field, form }) => (
                  <MultiSelect
                    options={skills}
                    value={field.value}
                    onChange={(selectedValues) => form.setFieldValue('technologies', selectedValues)}
                    placeholder="Select technologies used in this project..."
                    loading={loadingSkills}
                    error={form.errors.technologies && form.touched.technologies}
                    searchable={true}
                    getOptionLabel={(skill) => skill.name}
                    getOptionValue={(skill) => skill._id}
                  />
                )}
              </Field>
              <ErrorMessage name="technologies" component="div" className="mt-1 text-sm text-red-600 dark:text-red-400" />
            </div>

            {/* Highlights */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Key Highlights
              </label>
              <FieldArray name="highlights">
                {({ push, remove }) => (
                  <div className="space-y-2">
                    {values.highlights.map((highlight, index) => (
                      <div key={index} className="flex gap-2">
                        <Field
                          as="textarea"
                          name={`highlights.${index}`}
                          rows={2}
                          className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
                          placeholder={`Highlight ${index + 1}`}
                        />
                        {values.highlights.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                            className="p-2 flex-shrink-0"
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
                      className="flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <Plus size={16} />
                      <span>Add Highlight</span>
                    </Button>
                  </div>
                )}
              </FieldArray>
            </div>

            {/* Additional Images */}
            <div className="lg:col-span-2">
              <MultiImageUpload
                images={values.images}
                onImagesChange={async (file, index, action = 'add', newImages = null) => {
                  if (action === 'remove') {
                    setFieldValue('images', newImages || [])
                  } else if (file) {
                    const updatedImages = [...values.images]
                    if (index >= updatedImages.length) {
                      updatedImages.push(file)
                    } else {
                      updatedImages[index] = file
                    }
                    setFieldValue('images', updatedImages)
                    
                    // Upload in background
                    try {
                      const uploadedUrl = await uploadImage(file, `image_${index}`)
                      if (uploadedUrl) {
                        const finalImages = [...updatedImages]
                        finalImages[index] = uploadedUrl
                        setFieldValue('images', finalImages)
                      }
                    } catch (error) {
                      console.error('Background upload failed:', error)
                    }
                  }
                }}
                isUploading={uploadingImages}
                maxImages={5}
              />
            </div>

            {/* Featured */}
            <div>
              <label className="flex items-center">
                <Field
                  type="checkbox"
                  name="featured"
                  className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-900"
                />
                <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Featured Project
                </span>
              </label>
            </div>

            {/* Active */}
            <div>
              <label className="flex items-center">
                <Field
                  type="checkbox"
                  name="isActive"
                  className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-900"
                />
                <span className="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Active (show this project in portfolio)
                </span>
              </label>
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
                  ? 'Saving...' 
                  : isAnyUploading()
                    ? `${isEditing ? 'Update' : 'Add'} Project (Uploading...)`
                    : isEditing 
                      ? 'Update Project' 
                      : 'Add Project'}
              </span>
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default ProjectForm