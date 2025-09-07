import { useState, useCallback } from 'react'
import { useToast } from '../contexts/ToastContext'
import userService from '../services/userService'
import { FILE_SIZE_LIMITS, FILE_SIZE_LIMITS_MB, isValidPDFType } from '../../constants/fileConstants'

export const usePDFUpload = () => {
  const [uploadingPDFs, setUploadingPDFs] = useState({})
  const { showError, showSuccess } = useToast()

  const uploadPDF = useCallback(async (file, identifier = 'default') => {
    if (!file) return null

    // Validate file type
    if (!isValidPDFType(file.type)) {
      showError('Invalid file type', 'Please select a PDF file')
      return null
    }

    // Validate file size using constants
    const maxSize = FILE_SIZE_LIMITS.RESUME_PDF
    if (file.size > maxSize) {
      const maxSizeMB = FILE_SIZE_LIMITS_MB.RESUME_PDF
      showError('File too large', `Please select a PDF smaller than ${maxSizeMB}`)
      return null
    }

    try {
      setUploadingPDFs(prev => ({ ...prev, [identifier]: true }))
      
      const pdfUrl = await userService.uploadResume(file)
      
      showSuccess('PDF uploaded successfully')
      
      return pdfUrl
    } catch (error) {
      console.error('Error uploading PDF:', error)
      showError('Upload failed', error.message || 'Failed to upload PDF')
      return null
    } finally {
      setUploadingPDFs(prev => ({ ...prev, [identifier]: false }))
    }
  }, [showError, showSuccess])

  const isUploading = useCallback((identifier) => {
    return !!uploadingPDFs[identifier]
  }, [uploadingPDFs])

  const isAnyUploading = useCallback(() => {
    return Object.values(uploadingPDFs).some(Boolean)
  }, [uploadingPDFs])

  return {
    uploadPDF,
    uploadingPDFs,
    isUploading,
    isAnyUploading
  }
}