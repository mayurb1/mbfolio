'use client'

import { useCallback } from 'react'
import userService from '../services/userService'
import { FILE_SIZE_LIMITS, FILE_SIZE_LIMITS_MB, isValidPDFType } from '../../constants/fileConstants'
import { useFileUpload } from './useFileUpload'

export const usePDFUpload = () => {
  const uploadFn = useCallback(file => userService.uploadResume(file), [])

  const {
    upload: uploadPDF,
    uploading: uploadingPDFs,
    isUploading,
    isAnyUploading,
  } = useFileUpload({
    validate: isValidPDFType,
    invalidTypeMessage: 'Please select a PDF file',
    sizeLimit: FILE_SIZE_LIMITS.RESUME_PDF,
    sizeErrorMessage: `Please select a PDF smaller than ${FILE_SIZE_LIMITS_MB.RESUME_PDF}`,
    uploadFn,
    successMessage: 'PDF uploaded successfully',
    errorLogLabel: 'Error uploading PDF:',
    uploadErrorFallback: 'Failed to upload PDF',
  })

  return {
    uploadPDF,
    uploadingPDFs,
    isUploading,
    isAnyUploading
  }
}
