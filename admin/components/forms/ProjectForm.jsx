'use client'

import { useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useToast } from '../../contexts/ToastContext'
import Button from '../ui/Button'
import ImageUpload from '../ui/ImageUpload'
import MultiImageUpload from '../ui/MultiImageUpload'
import MultiSelect from '../ui/MultiSelect'
import FormField from './fields/FormField'
import FormSelect from './fields/FormSelect'
import FormTextArea from './fields/FormTextArea'
import StringArrayField from './fields/StringArrayField'
import {
  createProject,
  updateProject,
  fetchProjects,
} from '../../store/projectSlice'
import { useImageUpload } from '../../hooks/useImageUpload'
import categoriesService from '../../services/categoriesService'
import skillsService from '../../services/skillsService'

const ProjectForm = ({ project = null, onCancel, onSuccess }) => {
  const dispatch = useDispatch()
  const { handleApiResponse, showError } = useToast()
  const { uploadImage, uploadingImages, isAnyUploading, isUploading } =
    useImageUpload()
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
        const response = await categoriesService.getAllCategories({
          isActive: true,
          limit: 1000,
        })
        setCategories(response.data.categories || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
        showError('Failed to load categories', error.message)
        // Fallback to hardcoded categories if API fails
        setCategories([])
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
        const response = await skillsService.getAllSkills({
          isActive: true,
          limit: 100,
        })
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
    category: Yup.string().required('Category is required'),
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
    team: Yup.string().max(100, 'Team info too long'),
  })

  // Initial form values
  const initialValues = {
    title: project?.title || '',
    description: project?.description || '',
    fullDescription: project?.fullDescription || '',
    category: project?.category?._id || project?.category || '', // Handle both populated and non-populated category
    status: project?.status || 'completed',
    type: project?.type || 'personal',
    technologies:
      project?.technologies?.map(
        tech => (typeof tech === 'object' && tech._id ? tech._id : tech) // Handle both populated objects and IDs
      ) || [],
    highlights: project?.highlights || [''],
    images: project?.images || [],
    mainImage: project?.mainImage || '',
    github: project?.github || '',
    demo: project?.demo || '',
    duration: project?.duration || '',
    team: project?.team || '',
    featured: project?.featured || false,
    isActive: project?.isActive !== false,
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
        setFieldError(
          'mainImage',
          'Main image upload failed. Please try uploading again.'
        )
        return
      }

      for (let i = 0; i < values.images.length; i++) {
        if (values.images[i] instanceof File) {
          setFieldError(
            'images',
            `Image ${i + 1} upload failed. Please try uploading again.`
          )
          return
        }
      }

      // Keep technology IDs as they are (no conversion needed)
      const technologyIds = values.technologies

      // Filter out empty strings from arrays
      const cleanedValues = {
        ...values,
        mainImage: values.mainImage,
        images: values.images.filter(
          img => img && img.trim() && typeof img === 'string'
        ),
        technologies: technologyIds,
        highlights: values.highlights.filter(highlight => highlight.trim()),
      }

      // Validate that at least one technology is provided
      if (cleanedValues.technologies.length === 0) {
        setFieldError('technologies', 'Please add at least one technology')
        return
      }

      let response
      if (isEditing) {
        response = await dispatch(
          updateProject({ id: project._id, projectData: cleanedValues })
        ).unwrap()
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
              <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">
                {errors.general}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Title */}
            <FormField
              name="title"
              label="Project Title"
              required
              placeholder="Enter project title"
            />

            {/* Category */}
            <FormSelect
              name="category"
              label="Category"
              required
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
            </FormSelect>

            {/* Status */}
            <FormSelect name="status" label="Status">
              {statuses.map(status => (
                <option key={status} value={status} className="capitalize">
                  {status}
                </option>
              ))}
            </FormSelect>

            {/* Type */}
            <FormSelect name="type" label="Type">
              {types.map(type => (
                <option key={type} value={type} className="capitalize">
                  {type}
                </option>
              ))}
            </FormSelect>

            {/* Duration */}
            <FormField
              name="duration"
              label="Duration"
              placeholder="e.g., 3 months, 2 weeks"
            />

            {/* Team */}
            <FormField
              name="team"
              label="Team"
              placeholder="e.g., Solo, Team of 4"
            />

            {/* GitHub URL */}
            <FormField
              name="github"
              label="GitHub URL"
              type="url"
              placeholder="https://github.com/username/repo"
            />

            {/* Demo URL */}
            <FormField
              name="demo"
              label="Demo URL"
              type="url"
              placeholder="https://demo.example.com"
            />

            {/* Main Image Upload */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Main Project Image
              </label>
              <ImageUpload
                value={values.mainImage}
                onChange={async file => {
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
              <ErrorMessage
                name="mainImage"
                component="div"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>

            {/* Short Description */}
            <FormTextArea
              name="description"
              label="Short Description"
              required
              rows={3}
              placeholder="Brief project description (max 500 characters)"
              wrapperClassName="lg:col-span-2"
            />

            {/* Full Description */}
            <FormTextArea
              name="fullDescription"
              label="Full Description"
              required
              rows={5}
              placeholder="Detailed project description (max 2000 characters)"
              wrapperClassName="lg:col-span-2"
            />

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
                    onChange={selectedValues =>
                      form.setFieldValue('technologies', selectedValues)
                    }
                    placeholder="Select technologies used in this project..."
                    loading={loadingSkills}
                    error={
                      form.errors.technologies && form.touched.technologies
                    }
                    searchable={true}
                    getOptionLabel={skill => skill.name}
                    getOptionValue={skill => skill._id}
                  />
                )}
              </Field>
              <ErrorMessage
                name="technologies"
                component="div"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>

            {/* Highlights */}
            <StringArrayField
              name="highlights"
              label="Key Highlights"
              addButtonText="Add Highlight"
              placeholder={index => `Highlight ${index + 1}`}
              wrapperClassName="lg:col-span-2"
              as="textarea"
              rows={2}
              removeButtonClassName="p-2 flex-shrink-0"
              addButtonClassName="flex items-center gap-2 w-full sm:w-auto justify-center"
              spanAddText
            />

            {/* Additional Images */}
            <div className="lg:col-span-2">
              <MultiImageUpload
                images={values.images}
                onImagesChange={async (
                  file,
                  index,
                  action = 'add',
                  newImages = null
                ) => {
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
                      const uploadedUrl = await uploadImage(
                        file,
                        `image_${index}`
                      )
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