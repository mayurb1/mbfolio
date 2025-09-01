import { useEffect, useCallback, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Edit, Trash2, Search, Calendar, MapPin } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import AdminLayout from '../components/layout/AdminLayout'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import DataTable from '../components/ui/DataTable'
import ToggleSwitch from '../components/ui/ToggleSwitch'
import ExperienceForm from '../components/forms/ExperienceForm'
import {
  fetchExperiences,
  fetchSkills,
  deleteExperience,
  toggleExperienceStatus,
  openAddModal,
  closeAddModal,
  openEditModal,
  closeEditModal,
  openDeleteModal,
  closeDeleteModal,
  setSearchTerm,
  clearError
} from '../store/experiencesSlice'

const Experiences = () => {
  const dispatch = useDispatch()
  const { handleApiResponse, handleApiError } = useToast()
  
  const {
    experiences,
    skills,
    pagination,
    filters,
    loading,
    showAddModal,
    showEditModal,
    showDeleteModal,
    editingExperience,
    deletingExperience
  } = useSelector(state => state.experiences)

  // Debounced search function
  const debouncedFetchExperiences = useCallback(
    (() => {
      let timeoutId
      return (searchTerm) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          const params = {
            page: 1,
            limit: pagination.limit,
            ...(searchTerm && { search: searchTerm })
          }
          dispatch(fetchExperiences(params))
        }, 300)
      }
    })(),
    [dispatch, pagination.limit]
  )

  const isInitialMount = useRef(true)
  const searchRef = useRef('')

  // Load experiences and skills on component mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      // Fetch skills on initial load for form use
      dispatch(fetchSkills())
      
      const params = {
        page: 1,
        limit: pagination.limit
      }
      dispatch(fetchExperiences(params))
    }
  }, [dispatch, pagination.limit])

  // Handle search input change
  const handleSearch = (e) => {
    const searchTerm = e.target.value
    searchRef.current = searchTerm
    dispatch(setSearchTerm(searchTerm))
    
    if (!searchTerm) {
      // When search is cleared, fetch without search term
      const params = {
        page: 1,
        limit: pagination.limit
      }
      dispatch(fetchExperiences(params))
    } else {
      debouncedFetchExperiences(searchTerm)
    }
  }

  // Handle add experience
  const handleAddExperience = () => {
    dispatch(openAddModal())
  }

  // Handle edit experience
  const handleEditExperience = (experience) => {
    dispatch(openEditModal(experience))
  }

  // Handle delete experience
  const handleDeleteExperience = (experience) => {
    dispatch(openDeleteModal(experience))
  }

  // Handle toggle experience status
  const handleToggleExperienceStatus = async (experience) => {
    try {
      const response = await dispatch(toggleExperienceStatus(experience._id)).unwrap()
      handleApiResponse(response)
    } catch (error) {
      handleApiError({ message: error })
    }
  }

  // Confirm delete experience
  const confirmDeleteExperience = async () => {
    if (deletingExperience) {
      try {
        const response = await dispatch(deleteExperience(deletingExperience._id)).unwrap()
        handleApiResponse(response)
      } catch (error) {
        handleApiError({ message: error })
      }
    }
  }

  // Handle pagination
  const handlePageChange = (newPage) => {
    const params = {
      page: newPage,
      limit: pagination.limit,
      ...(searchRef.current && { search: searchRef.current })
    }
    dispatch(fetchExperiences(params))
  }

  // Handle limit change
  const handleLimitChange = (newLimit) => {
    const params = {
      page: 1,
      limit: newLimit,
      ...(searchRef.current && { search: searchRef.current })
    }
    dispatch(fetchExperiences(params))
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const { page, totalPages } = pagination
    const pages = []
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        if (totalPages > 6) pages.push('...')
        pages.push(totalPages)
      } else if (page >= totalPages - 3) {
        pages.push(1)
        if (totalPages > 6) pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = page - 1; i <= page + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  // Clear error when component unmounts to prevent stale errors
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  // Format duration for display - parse duration string
  const formatDuration = (durationString) => {
    if (!durationString) return 'Not specified'
    
    // If it's already in the correct format, return as is
    if (typeof durationString === 'string') {
      return durationString
    }
    
    return 'Not specified'
  }

  // Define table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'company',
      header: 'Company/Position',
      cell: ({ getValue, row }) => {
        const company = getValue()
        const experience = row.original
        return (
          <div className="flex items-center gap-3">
            {experience.logo && (
              <img
                src={experience.logo}
                alt={`${company} logo`}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            )}
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">
                {company}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {experience.position}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'startDate',
      header: 'Duration',
      cell: ({ row }) => {
        const experience = row.original
        return (
          <div className="text-sm">
            <div className="flex items-center gap-1 text-slate-900 dark:text-white">
              <Calendar size={12} />
              {formatDuration(experience.duration)}
            </div>
            {experience.location && (
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <MapPin size={12} />
                {experience.location}
              </div>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => {
        const type = getValue()
        const colors = {
          'Full-time': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          'Part-time': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          'Contract': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          'Internship': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
          'Freelance': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
        }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}`}>
            {type}
          </span>
        )
      }
    },
    {
      accessorKey: 'skills',
      header: 'Skills',
      cell: ({ getValue }) => {
        const skills = getValue()
        
        if (!skills || skills.length === 0) {
          return (
            <span className="text-sm text-slate-400 dark:text-slate-500 italic">
              No skills listed
            </span>
          )
        }
        
        return (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
              >
                {typeof skill === 'string' ? skill : skill.name}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                +{skills.length - 3} more
              </span>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ getValue }) => {
        const isActive = getValue()
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isActive 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        )
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const experience = row.original
        return (
          <div className="flex items-center justify-end gap-2">
            <ToggleSwitch
              checked={experience.isActive}
              onChange={() => handleToggleExperienceStatus(experience)}
              size="sm"
              disabled={loading}
            />
            <button
              onClick={() => handleEditExperience(experience)}
              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
              title="Edit experience"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteExperience(experience)}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Delete experience"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )
      }
    }
  ], [loading])

  return (
    <AdminLayout pageTitle="Experience Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Experience
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your professional experience and work history
            </p>
          </div>
          <Button onClick={handleAddExperience} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Experience
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search experiences..."
              value={filters.searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Experience Table */}
        <div className="space-y-4">
          <DataTable
            data={experiences}
            columns={columns}
            loading={loading}
            pageCount={pagination.totalPages}
            pageIndex={pagination.page - 1}
            pageSize={pagination.limit}
            manualPagination={true}
            onPaginationChange={(updater) => {
              const newPagination = typeof updater === 'function' 
                ? updater({ pageIndex: pagination.page - 1, pageSize: pagination.limit })
                : updater
              handlePageChange(newPagination.pageIndex + 1)
            }}
            emptyMessage="No experiences found"
            showPagination={false}
          />

          {/* Custom Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-6 py-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Show:</span>
                    <select
                      value={pagination.limit}
                      onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                      className="text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-slate-600 dark:text-slate-400">entries</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                    className="px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {getPageNumbers().map((pageNum, index) => {
                    if (pageNum === '...') {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-3 py-1 text-sm text-slate-400 dark:text-slate-500"
                        >
                          ...
                        </span>
                      )
                    }
                    
                    const isCurrentPage = pageNum === pagination.page
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                          isCurrentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages || loading}
                    className="px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Experience Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => dispatch(closeAddModal())}
        title="Add New Experience"
        size="xl"
      >
        <ExperienceForm onCancel={() => dispatch(closeAddModal())} />
      </Modal>

      {/* Edit Experience Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => dispatch(closeEditModal())}
        title="Edit Experience"
        size="xl"
      >
        <ExperienceForm 
          experience={editingExperience}
          onCancel={() => dispatch(closeEditModal())} 
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => dispatch(closeDeleteModal())}
        onConfirm={confirmDeleteExperience}
        title="Delete Experience"
        message={`Are you sure you want to delete the experience at "${deletingExperience?.company}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loading}
      />
    </AdminLayout>
  )
}

export default Experiences