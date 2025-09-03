import { useState, useCallback } from 'react'
import { useToast } from '../contexts/ToastContext'
import projectService from '../services/projectService'

export const useImageUpload = () => {
  const [uploadingImages, setUploadingImages] = useState({})
  const { showError, showSuccess } = useToast()

  const uploadImage = useCallback(async (file, identifier = 'default') => {
    if (!file) return null

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError('Invalid file type', 'Please select an image file')
      return null
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    if (file.size > maxSize) {
      showError('File too large', 'Please select an image smaller than 10MB')
      return null
    }

    try {
      setUploadingImages(prev => ({ ...prev, [identifier]: true }))
      
      const imageUrl = await projectService.uploadImage(file)
      
      showSuccess('Image uploaded successfully')
      
      return imageUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      showError('Upload failed', error.message || 'Failed to upload image')
      return null
    } finally {
      setUploadingImages(prev => ({ ...prev, [identifier]: false }))
    }
  }, [showError, showSuccess])

  const uploadMultipleImages = useCallback(async (files, identifierPrefix = 'image') => {
    if (!files || files.length === 0) return []

    const uploadPromises = Array.from(files).map((file, index) => 
      uploadImage(file, `${identifierPrefix}_${index}`)
    )

    try {
      const results = await Promise.all(uploadPromises)
      return results.filter(url => url !== null) // Filter out failed uploads
    } catch (error) {
      console.error('Error uploading multiple images:', error)
      return []
    }
  }, [uploadImage])

  const isUploading = useCallback((identifier) => {
    return !!uploadingImages[identifier]
  }, [uploadingImages])

  const isAnyUploading = useCallback(() => {
    return Object.values(uploadingImages).some(Boolean)
  }, [uploadingImages])

  return {
    uploadImage,
    uploadMultipleImages,
    uploadingImages,
    isUploading,
    isAnyUploading
  }
}