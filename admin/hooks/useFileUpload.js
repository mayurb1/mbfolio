'use client'

import { useState, useCallback } from 'react'
import { useToast } from '../contexts/ToastContext'

// Generic file-upload hook. Owns the uploading-state map and runs the shared
// validate -> size check -> upload -> toast -> clear flag flow. The image and
// PDF hooks configure it and re-expose their existing return API.
export const useFileUpload = ({
  validate,
  invalidTypeMessage,
  sizeLimit,
  sizeErrorMessage,
  uploadFn,
  successMessage,
  errorLogLabel,
  uploadErrorFallback,
}) => {
  const [uploading, setUploading] = useState({})
  const { showError, showSuccess } = useToast()

  const upload = useCallback(
    async (file, identifier = 'default') => {
      if (!file) return null

      // Validate file type
      if (!validate(file.type)) {
        showError('Invalid file type', invalidTypeMessage)
        return null
      }

      // Validate file size using constants
      if (file.size > sizeLimit) {
        showError('File too large', sizeErrorMessage)
        return null
      }

      try {
        setUploading(prev => ({ ...prev, [identifier]: true }))

        const url = await uploadFn(file)

        showSuccess(successMessage)

        return url
      } catch (error) {
        console.error(errorLogLabel, error)
        showError('Upload failed', error.message || uploadErrorFallback)
        return null
      } finally {
        setUploading(prev => ({ ...prev, [identifier]: false }))
      }
    },
    [
      validate,
      invalidTypeMessage,
      sizeLimit,
      sizeErrorMessage,
      uploadFn,
      successMessage,
      errorLogLabel,
      uploadErrorFallback,
      showError,
      showSuccess,
    ]
  )

  const isUploading = useCallback(
    identifier => {
      return !!uploading[identifier]
    },
    [uploading]
  )

  const isAnyUploading = useCallback(() => {
    return Object.values(uploading).some(Boolean)
  }, [uploading])

  return {
    upload,
    uploading,
    isUploading,
    isAnyUploading,
  }
}
