'use client'

import { useCallback } from 'react'
import projectService from '../services/projectService'
import userService from '../services/userService'
import { FILE_SIZE_LIMITS, FILE_SIZE_LIMITS_MB, isValidImageType, isValidLogoType } from '../../constants/fileConstants'
import { useFileUpload } from './useFileUpload'

export const useImageUpload = (serviceType = 'project') => {
  const isLogo = serviceType === 'logo'
  const sizeType = isLogo
    ? 'LOGO'
    : serviceType === 'profile'
      ? 'PROFILE_IMAGE'
      : 'PROJECT_IMAGE'

  const uploadFn = useCallback(
    file => {
      if (isLogo) return userService.uploadLogo(file)
      return serviceType === 'profile'
        ? userService.uploadProfileImage(file)
        : projectService.uploadImage(file)
    },
    [serviceType, isLogo]
  )

  const {
    upload: uploadImage,
    uploading: uploadingImages,
    isUploading,
    isAnyUploading,
  } = useFileUpload({
    validate: isLogo ? isValidLogoType : isValidImageType,
    invalidTypeMessage: isLogo
      ? 'Please select an SVG file'
      : 'Please select an image file',
    sizeLimit: FILE_SIZE_LIMITS[sizeType],
    sizeErrorMessage: isLogo
      ? `Please select an SVG smaller than ${FILE_SIZE_LIMITS_MB[sizeType]}`
      : `Please select an image smaller than ${FILE_SIZE_LIMITS_MB[sizeType]}`,
    uploadFn,
    successMessage: isLogo ? 'Logo uploaded successfully' : 'Image uploaded successfully',
    errorLogLabel: isLogo ? 'Error uploading logo:' : 'Error uploading image:',
    uploadErrorFallback: isLogo ? 'Failed to upload logo' : 'Failed to upload image',
  })

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

  return {
    uploadImage,
    uploadMultipleImages,
    uploadingImages,
    isUploading,
    isAnyUploading
  }
}
