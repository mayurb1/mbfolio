import { useState, useId } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Button from './Button'

const ImageUpload = ({
  value,
  onChange,
  onRemove,
  isUploading = false,
  placeholder = "Click to upload image",
  className = "",
  maxSize = "10MB",
  accept = "image/*"
}) => {
  const [dragOver, setDragOver] = useState(false)
  const uploadId = useId()

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && onChange) {
      onChange(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && onChange) {
      onChange(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const getImageSrc = () => {
    if (!value) return null
    // Handle File objects (newly selected files)
    if (value instanceof File) {
      return URL.createObjectURL(value)
    }
    // Handle URLs (existing uploaded images)
    return value
  }

  return (
    <div className={`relative ${className}`}>
      {value ? (
        <div className="relative group">
          <img
            src={getImageSrc()}
            alt="Uploaded image"
            className="w-full h-48 object-cover rounded-lg border border-slate-300 dark:border-slate-600"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center space-x-3">
            <label
              htmlFor={`image-upload-${uploadId}`}
              className="px-4 py-2 bg-white text-black rounded-lg cursor-pointer text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Change
            </label>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`image-upload-${uploadId}`}
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
              <p className="text-sm text-slate-600 dark:text-slate-400">Uploading image...</p>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{placeholder}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
                PNG, JPG, GIF up to {maxSize}
              </p>
              <label
                htmlFor={`image-upload-select-${uploadId}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Select Image
              </label>
              <input
                type="file"
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
                id={`image-upload-select-${uploadId}`}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default ImageUpload