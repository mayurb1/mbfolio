import { useState, useId } from 'react'
import { Upload, FileText, Trash2, Download } from 'lucide-react'
import { FILE_SIZE_LIMITS_MB } from '../../../constants/fileConstants'

const PDFUpload = ({
  value,
  onChange,
  onRemove,
  isUploading = false,
  placeholder = 'Click to upload PDF',
  className = '',
  maxSize = FILE_SIZE_LIMITS_MB.RESUME_PDF,
  accept = 'application/pdf',
}) => {
  const [dragOver, setDragOver] = useState(false)
  const uploadId = useId()

  const handleFileChange = e => {
    const file = e.target.files[0]
    if (file && onChange) {
      onChange(file)
    }
  }

  const handleDrop = e => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && onChange) {
      onChange(file)
    }
  }

  const handleDragOver = e => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = e => {
    e.preventDefault()
    setDragOver(false)
  }

  const getFileName = () => {
    if (!value) return null
    // Handle File objects (newly selected files)
    if (value instanceof File) {
      return value.name
    }
    // Handle URLs (existing uploaded files) - extract filename from URL
    const urlParts = value.split('/')
    return urlParts[urlParts.length - 1] || 'resume.pdf'
  }

  return (
    <div className={`relative ${className}`}>
      {value ? (
        <div className="relative group">
          <div className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 flex items-center space-x-4">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {getFileName()}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                PDF Document
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {/* View/Download button for uploaded files */}
              {typeof value === 'string' && (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  title="View PDF"
                >
                  <Download size={16} />
                </a>
              )}
              <label
                htmlFor={`pdf-upload-${uploadId}`}
                className="p-2 bg-gray-600 text-white rounded cursor-pointer hover:bg-gray-700 transition-colors"
                title="Replace PDF"
              >
                <Upload size={16} />
              </label>
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  aria-label="Remove PDF"
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  title="Remove PDF"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`pdf-upload-${uploadId}`}
            disabled={isUploading}
          />
          {value instanceof File && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
              Ready to upload
            </div>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'
          } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Uploading PDF...
              </p>
            </div>
          ) : (
            <>
              <FileText className="mx-auto h-12 w-12 text-slate-500 mb-4" />
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                {placeholder}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                PDF files up to {maxSize}
              </p>
              <label
                htmlFor={`pdf-upload-select-${uploadId}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Select PDF
              </label>
              <input
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
                id={`pdf-upload-select-${uploadId}`}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default PDFUpload