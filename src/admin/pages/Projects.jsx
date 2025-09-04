import { useState, useEffect, useCallback } from 'react'
import { Plus, Edit, Trash2, Search, ExternalLink, Github, Star } from 'lucide-react'
import AdminLayout from '../components/layout/AdminLayout'
import Button from '../components/ui/Button'
import ToggleSwitch from '../components/ui/ToggleSwitch'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import ProjectForm from '../components/forms/ProjectForm'
import projectService from '../services/projectService'

const Projects = () => {
  // State management
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [deletingProject, setDeletingProject] = useState(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Categories and types for filters
  const categories = ['Full-Stack', 'Frontend', 'Backend', 'Mobile', 'Data Science', 'DevOps', 'Other']
  const types = ['personal', 'organization', 'freelance', 'open-source']
  const statuses = ['completed', 'ongoing', 'planned', 'archived']

  // Fetch projects with filters
  const fetchProjects = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(typeFilter && { type: typeFilter }),
        ...(statusFilter && { status: statusFilter })
      }
      
      const response = await projectService.getAllProjects(params)
      
      setProjects(response.data.projects)
      setPagination(response.data.pagination)
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError(err.message)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [searchTerm, categoryFilter, typeFilter, statusFilter, pagination.limit])

  // Debounced search
  const debouncedFetchProjects = useCallback(
    (() => {
      let timeoutId
      return (page = 1) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fetchProjects(page), 300)
      }
    })(),
    [fetchProjects]
  )

  // Effects
  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    debouncedFetchProjects(1)
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [searchTerm, categoryFilter, typeFilter, statusFilter, debouncedFetchProjects])

  // Modal handlers
  const handleAddProject = () => setShowAddModal(true)
  const handleCloseAddModal = () => setShowAddModal(false)
  
  const handleEditProject = (project) => {
    setEditingProject(project)
    setShowEditModal(true)
  }
  const handleCloseEditModal = () => {
    setEditingProject(null)
    setShowEditModal(false)
  }
  
  const handleDeleteProject = (project) => {
    setDeletingProject(project)
    setShowDeleteModal(true)
  }
  const handleCloseDeleteModal = () => {
    setDeletingProject(null)
    setShowDeleteModal(false)
  }

  // CRUD operations
  const handleProjectAdded = async () => {
    await fetchProjects(pagination.page)
    handleCloseAddModal()
  }

  const handleProjectUpdated = async () => {
    await fetchProjects(pagination.page)
    handleCloseEditModal()
  }

  const confirmDeleteProject = async () => {
    if (!deletingProject) return
    
    try {
      setLoading(true)
      await projectService.deleteProject(deletingProject._id)
      
      // If current page becomes empty after deletion, go to previous page
      if (projects.length === 1 && pagination.page > 1) {
        await fetchProjects(pagination.page - 1)
      } else {
        await fetchProjects(pagination.page)
      }
      
      handleCloseDeleteModal()
    } catch (err) {
      console.error('Error deleting project:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleProjectStatus = useCallback(async (project) => {
    try {
      await projectService.toggleProjectStatus(project._id)
      await fetchProjects(pagination.page)
    } catch (err) {
      console.error('Error toggling project status:', err)
      setError(err.message)
    }
  }, [fetchProjects, pagination.page])

  const handleToggleFeatured = useCallback(async (project) => {
    try {
      await projectService.toggleProjectFeatured(project._id)
      await fetchProjects(pagination.page)
    } catch (err) {
      console.error('Error toggling featured status:', err)
      setError(err.message)
    }
  }, [fetchProjects, pagination.page])

  // Note: Columns removed as we're now using card view instead of table

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-text">Projects</h1>
            <p className="text-text-secondary text-sm sm:text-base">
              Manage your portfolio projects
            </p>
          </div>
          <Button onClick={handleAddProject} className="flex items-center justify-center space-x-2 w-full sm:w-auto">
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span>Add Project</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type} className="capitalize">{type}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status} className="capitalize">{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Project Cards */}
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>

          ) : projects.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center">
              <div className="text-slate-400 dark:text-slate-500 mb-2">
                <Search className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium">No projects found</p>
                <p className="text-sm">Start by creating your first project.</p>
              </div>
            </div>

          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project._id} className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 group">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {project.mainImage ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
                        <img
                          src={project.mainImage}
                          alt={project.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-border flex-shrink-0">
                        <div className="w-6 h-6 text-slate-400">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                          </svg>
                        </div>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors truncate">
                        {project.title}
                      </h3>
                      <p className="text-text-secondary text-sm font-medium truncate">
                        {project.category?.name || project.category}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <ToggleSwitch
                        checked={project.isActive}
                        onChange={() => handleToggleProjectStatus(project)}
                        size="sm"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <p className="text-sm text-text-secondary line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {/* Type */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      project.type === 'personal' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      project.type === 'organization' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      project.type === 'freelance' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                      project.type === 'open-source' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {project.type}
                    </span>

                    {/* Status */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      project.status === 'ongoing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      project.status === 'planned' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      project.status === 'archived' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {project.status}
                    </span>

                    {/* Featured Badge */}
                    {project.featured && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                        <Star size={12} fill="currentColor" className="mr-1" />
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                          >
                            {tech.name || tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            +{project.technologies.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Links and Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex gap-2">
                      {project.github && (
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors touch-manipulation"
                          title="View on GitHub"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {project.demo && (
                        <a
                          href={project.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors touch-manipulation"
                          title="View live demo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleToggleFeatured(project)}
                        className={`p-2 rounded-lg transition-colors touch-manipulation ${
                          project.featured 
                            ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' 
                            : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                        }`}
                        title={project.featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <Star className="w-4 h-4" fill={project.featured ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditProject(project)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 touch-manipulation"
                        title="Edit project"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation"
                        title="Delete project"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-surface border border-border rounded-lg">
              <div className="text-xs sm:text-sm text-text-secondary text-center sm:text-left">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} projects
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchProjects(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                  className="px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">‹</span>
                </Button>
                
                <div className="flex items-center gap-1">
                  {/* Show fewer pages on mobile */}
                  {pagination.totalPages <= 5 ? (
                    // Show all pages if 5 or fewer
                    Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                      <Button
                        key={page}
                        variant={page === pagination.page ? "primary" : "outline"}
                        size="sm"
                        onClick={() => fetchProjects(page)}
                        disabled={loading}
                        className="min-w-[32px] sm:min-w-[40px] px-2 sm:px-3"
                      >
                        {page}
                      </Button>
                    ))
                  ) : (
                    // Show smart pagination for many pages
                    <>
                      {pagination.page > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchProjects(1)}
                          disabled={loading}
                          className="min-w-[32px] sm:min-w-[40px] px-2 sm:px-3"
                        >
                          1
                        </Button>
                      )}
                      {pagination.page > 3 && (
                        <span className="px-1 text-text-secondary">...</span>
                      )}
                      {pagination.page > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchProjects(pagination.page - 1)}
                          disabled={loading}
                          className="min-w-[32px] sm:min-w-[40px] px-2 sm:px-3"
                        >
                          {pagination.page - 1}
                        </Button>
                      )}
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={loading}
                        className="min-w-[32px] sm:min-w-[40px] px-2 sm:px-3"
                      >
                        {pagination.page}
                      </Button>
                      {pagination.page < pagination.totalPages && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchProjects(pagination.page + 1)}
                          disabled={loading}
                          className="min-w-[32px] sm:min-w-[40px] px-2 sm:px-3"
                        >
                          {pagination.page + 1}
                        </Button>
                      )}
                      {pagination.page < pagination.totalPages - 2 && (
                        <span className="px-1 text-text-secondary">...</span>
                      )}
                      {pagination.page < pagination.totalPages - 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchProjects(pagination.totalPages)}
                          disabled={loading}
                          className="min-w-[32px] sm:min-w-[40px] px-2 sm:px-3"
                        >
                          {pagination.totalPages}
                        </Button>
                      )}
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchProjects(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || loading}
                  className="px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">›</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Project Modal */}
      <Modal isOpen={showAddModal} onClose={handleCloseAddModal} title="Add New Project">
        <ProjectForm onSuccess={handleProjectAdded} onCancel={handleCloseAddModal} />
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={showEditModal} onClose={handleCloseEditModal} title="Edit Project">
        <ProjectForm 
          project={editingProject}
          onSuccess={handleProjectUpdated} 
          onCancel={handleCloseEditModal} 
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.title}"? This action cannot be undone.`}
        confirmButtonText="Delete"
        isDestructive
      />
    </AdminLayout>
  )
}

export default Projects