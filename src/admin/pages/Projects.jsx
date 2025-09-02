import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Edit, Trash2, Search, Filter, ExternalLink, Github, Star, Eye } from 'lucide-react'
import AdminLayout from '../components/layout/AdminLayout'
import Button from '../components/ui/Button'
import ToggleSwitch from '../components/ui/ToggleSwitch'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import DataTable from '../components/ui/DataTable'
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

  // Table columns
  const columns = useMemo(
    () => [
      {
        header: 'Project',
        accessorKey: 'title',
        cell: ({ row }) => {
          const project = row.original
          return (
            <div className="flex items-center space-x-3">
              {project.mainImage && (
                <img 
                  src={project.mainImage} 
                  alt={project.title}
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              )}
              <div>
                <div className="font-semibold text-text">{project.title}</div>
                <div className="text-sm text-text-secondary truncate max-w-xs">
                  {project.description}
                </div>
              </div>
            </div>
          )
        }
      },
      {
        header: 'Category',
        accessorKey: 'category',
        cell: ({ getValue }) => {
          const category = getValue();
          return (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {category?.name || category}
            </span>
          )
        }
      },
      {
        header: 'Type',
        accessorKey: 'type',
        cell: ({ getValue }) => {
          const type = getValue()
          const colors = {
            personal: 'bg-blue-100 text-blue-800',
            organization: 'bg-green-100 text-green-800',
            freelance: 'bg-purple-100 text-purple-800',
            'open-source': 'bg-orange-100 text-orange-800'
          }
          return (
            <span className={`px-2 py-1 ${colors[type] || 'bg-gray-100 text-gray-800'} rounded-full text-xs font-medium capitalize`}>
              {type}
            </span>
          )
        }
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const status = getValue()
          const colors = {
            completed: 'bg-green-100 text-green-800',
            ongoing: 'bg-blue-100 text-blue-800',
            planned: 'bg-yellow-100 text-yellow-800',
            archived: 'bg-gray-100 text-gray-800'
          }
          return (
            <span className={`px-2 py-1 ${colors[status] || 'bg-gray-100 text-gray-800'} rounded-full text-xs font-medium capitalize`}>
              {status}
            </span>
          )
        }
      },
      {
        header: 'Links',
        cell: ({ row }) => {
          const project = row.original
          return (
            <div className="flex space-x-2">
              {project.github && (
                <a 
                  href={project.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1 text-text-secondary hover:text-text transition-colors"
                  title="GitHub"
                >
                  <Github size={16} />
                </a>
              )}
              {project.demo && (
                <a 
                  href={project.demo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1 text-text-secondary hover:text-text transition-colors"
                  title="Live Demo"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          )
        }
      },
      {
        header: 'Featured',
        cell: ({ row }) => {
          const project = row.original
          return (
            <button
              onClick={() => handleToggleFeatured(project)}
              className={`p-1 rounded transition-colors ${
                project.featured 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-300 hover:text-yellow-500'
              }`}
              title={project.featured ? 'Remove from featured' : 'Add to featured'}
            >
              <Star size={16} fill={project.featured ? 'currentColor' : 'none'} />
            </button>
          )
        }
      },
      {
        header: 'Active',
        cell: ({ row }) => {
          const project = row.original
          return (
            <ToggleSwitch
              checked={project.isActive}
              onChange={() => handleToggleProjectStatus(project)}
              size="sm"
            />
          )
        }
      },
      {
        header: 'Actions',
        cell: ({ row }) => {
          const project = row.original
          return (
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditProject(project)}
                className="p-2"
              >
                <Edit size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteProject(project)}
                className="p-2 text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          )
        }
      }
    ],
    [handleEditProject, handleDeleteProject, handleToggleProjectStatus, handleToggleFeatured]
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">Projects</h1>
            <p className="text-text-secondary">
              Manage your portfolio projects
            </p>
          </div>
          <Button onClick={handleAddProject} className="flex items-center space-x-2">
            <Plus size={20} />
            <span>Add Project</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Data Table */}
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <DataTable
            data={projects}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => fetchProjects(page)}
          />
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