import { useState } from 'react'
import { Upload, X, Plus, Image as ImageIcon, Trash2 } from 'lucide-react'
import Button from './Button'

const MultiImageUpload = ({
  images = [],
  onImagesChange,
  isUploading = {},
  maxImages = 5,
  className = ""
}) => {
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (e, index = null) => {
    const file = e.target.files[0]
    if (file && onImagesChange) {
      if (index !== null) {
        // Replace existing image
        onImagesChange(file, index)
      } else {
        // Add new image
        onImagesChange(file, images.length)
      }
    }
  }

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    if (onImagesChange) {
      onImagesChange(null, index, 'remove', newImages)
    }
  }

  const handleAddImage = () => {
    if (images.length < maxImages) {
      document.getElementById(`multi-image-upload-new`)?.click()
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > 0 && onImagesChange && images.length < maxImages) {
      onImagesChange(files[0], images.length)
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

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Additional Images ({images.length}/{maxImages})
        </label>
        {images.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddImage}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Image
          </Button>
        )}
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2 transition-colors hover:border-blue-400">
                {image ? (
                  <div className="relative">
                    <img
                      src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                      alt={`Additional image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center space-x-2">
                      <label
                        htmlFor={`multi-image-upload-${index}`}
                        className="p-2 bg-white text-black rounded cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <ImageIcon size={16} />
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {image instanceof File && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Ready to upload
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ImageIcon className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="text-xs text-slate-500 mt-1">Click to upload</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, index)}
                  className="hidden"
                  id={`multi-image-upload-${index}`}
                  disabled={isUploading[`image_${index}`]}
                />
              </div>
              {isUploading[`image_${index}`] && (
                <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <ImageIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            No additional images yet
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-4">
            Click "Add Image" to start adding gallery images
          </p>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e)}
        className="hidden"
        id="multi-image-upload-new"
      />
    </div>
  )
}

export default MultiImageUpload