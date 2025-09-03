import api from '../../services/api'

// Project service for project management APIs
class ProjectService {
  // Get all projects with optional filtering and pagination
  async getAllProjects(params = {}) {
    try {
      const response = await api.get('/projects', { params })
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch projects'
      )
    }
  }

  // Get project by ID
  async getProjectById(id) {
    try {
      const response = await api.get(`/projects/${id}`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to fetch project'
      )
    }
  }

  // Create new project
  async createProject(projectData) {
    try {
      const response = await api.post('/projects', projectData)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to create project'
      )
    }
  }

  // Update project
  async updateProject(id, projectData) {
    try {
      const response = await api.put(`/projects/${id}`, projectData)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to update project'
      )
    }
  }

  // Partial update project
  async patchProject(id, projectData) {
    try {
      const response = await api.patch(`/projects/${id}`, projectData)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to update project'
      )
    }
  }

  // Delete project
  async deleteProject(id) {
    try {
      const response = await api.delete(`/projects/${id}`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete project'
      )
    }
  }

  // Bulk operations
  async bulkCreateProjects(projectData) {
    try {
      const response = await api.post('/projects/bulk', { projects: projectData })
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to bulk create projects'
      )
    }
  }

  async bulkToggleActive(projectIds, isActive) {
    try {
      const response = await api.patch('/projects/bulk/toggle', { projectIds, isActive })
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to toggle project status'
      )
    }
  }

  // Toggle project status
  async toggleProjectStatus(id) {
    try {
      const response = await api.patch(`/projects/${id}/toggle-status`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to toggle project status'
      )
    }
  }

  // Toggle project featured status
  async toggleProjectFeatured(id) {
    try {
      const response = await api.patch(`/projects/${id}/toggle-featured`)
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to toggle project featured status'
      )
    }
  }

  // Generate file hash for deduplication
  async generateFileHash(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const buffer = e.target.result
          const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
          resolve(hashHex)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  }

  // Check if image with same hash exists in uploaded images cache
  checkImageCache(fileHash) {
    const imageCache = JSON.parse(localStorage.getItem('uploadedImagesCache') || '{}')
    return imageCache[fileHash] || null
  }

  // Save uploaded image hash and URL to cache
  saveToImageCache(fileHash, imageUrl, fileName) {
    const imageCache = JSON.parse(localStorage.getItem('uploadedImagesCache') || '{}')
    imageCache[fileHash] = {
      url: imageUrl,
      fileName,
      uploadedAt: new Date().toISOString()
    }
    // Keep only last 100 entries to prevent localStorage bloat
    const entries = Object.entries(imageCache)
    if (entries.length > 100) {
      const sortedEntries = entries.sort((a, b) => new Date(b[1].uploadedAt) - new Date(a[1].uploadedAt))
      const limitedCache = Object.fromEntries(sortedEntries.slice(0, 100))
      localStorage.setItem('uploadedImagesCache', JSON.stringify(limitedCache))
    } else {
      localStorage.setItem('uploadedImagesCache', JSON.stringify(imageCache))
    }
  }

  // Clear image cache (useful for testing or when needed)
  clearImageCache() {
    localStorage.removeItem('uploadedImagesCache')
  }

  // Get cache statistics for debugging
  getImageCacheStats() {
    const imageCache = JSON.parse(localStorage.getItem('uploadedImagesCache') || '{}')
    return {
      totalEntries: Object.keys(imageCache).length,
      oldestEntry: Object.values(imageCache).reduce((oldest, current) => 
        !oldest || new Date(current.uploadedAt) < new Date(oldest.uploadedAt) ? current : oldest, null),
      newestEntry: Object.values(imageCache).reduce((newest, current) => 
        !newest || new Date(current.uploadedAt) > new Date(newest.uploadedAt) ? current : newest, null)
    }
  }

  // Upload project image to Cloudinary with deduplication
  async uploadImage(file) {
    try {
      // Validate file
      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file')
      }

      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB')
      }

      // Generate file hash for deduplication
      const fileHash = await this.generateFileHash(file)
      
      // Check if this exact file has been uploaded before
      const cachedImage = this.checkImageCache(fileHash)
      if (cachedImage) {
        console.log('Image already exists, using cached URL:', cachedImage.url)
        return cachedImage.url
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'project_images') // Upload preset name
      formData.append('folder', 'portfolio/projects') // Optional: organize in folders
      
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      if (!cloudName) {
        throw new Error('Cloudinary configuration missing')
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        if (response.status === 400) {
          throw new Error(errorData.error?.message || 'Invalid upload parameters. Please check your Cloudinary configuration.')
        } else if (response.status === 401) {
          throw new Error('Upload preset "project_images" not found or not configured. Please create it in Cloudinary dashboard.')
        } else if (response.status === 413) {
          throw new Error('File too large. Maximum size is 10MB.')
        } else {
          throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`)
        }
      }
      
      const data = await response.json()
      
      if (!data.secure_url) {
        throw new Error('Upload completed but no URL returned')
      }

      // Cache the uploaded image to prevent future duplicates
      this.saveToImageCache(fileHash, data.secure_url, file.name)
      
      return data.secure_url
    } catch (error) {
      console.error('Cloudinary upload error:', error)
      throw new Error(
        error.message || 'Failed to upload image to Cloudinary'
      )
    }
  }

  // Delete image from Cloudinary
  async deleteImage(publicId) {
    try {
      const response = await api.post('/projects/delete-image', { publicId })
      return response.data
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          'Failed to delete image'
      )
    }
  }

  // Remove image URL from cache (when image is deleted)
  removeFromImageCache(imageUrl) {
    const imageCache = JSON.parse(localStorage.getItem('uploadedImagesCache') || '{}')
    // Find and remove the entry with matching URL
    for (const [hash, data] of Object.entries(imageCache)) {
      if (data.url === imageUrl) {
        delete imageCache[hash]
        localStorage.setItem('uploadedImagesCache', JSON.stringify(imageCache))
        break
      }
    }
  }
}

export default new ProjectService()