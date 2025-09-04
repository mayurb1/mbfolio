import { useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  Award,
  Filter,
} from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import AdminLayout from '../components/layout/AdminLayout'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import ToggleSwitch from '../components/ui/ToggleSwitch'
import EducationForm from '../components/forms/EducationForm'
import {
  fetchEducation,
  deleteEducation,
  toggleEducationStatus,
  openAddModal,
  closeAddModal,
  openEditModal,
  closeEditModal,
  openDeleteModal,
  closeDeleteModal,
  setSearchTerm,
  setTypeFilter,
  clearError,
} from '../store/educationSlice'

const Education = () => {
  const dispatch = useDispatch()
  const { handleApiResponse, handleApiError } = useToast()

  const {
    education,
    pagination,
    filters,
    loading,
    showAddModal,
    showEditModal,
    showDeleteModal,
    editingEducation,
    deletingEducation,
  } = useSelector(state => state.education)

  // Debounced search function
  const debouncedFetchEducation = useCallback(
    (() => {
      let timeoutId
      return (searchTerm, typeFilter) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          const params = {
            page: 1,
            limit: pagination.limit,
            ...(typeFilter && { type: typeFilter }),
            ...(searchTerm && { search: searchTerm }),
          }
          dispatch(fetchEducation(params))
        }, 300)
      }
    })(),
    [dispatch, pagination.limit]
  )

  const isInitialMount = useRef(true)
  const searchRef = useRef('')

  // Load education on component mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
    }

    const params = {
      page: 1,
      limit: pagination.limit,
      ...(filters.typeFilter && { type: filters.typeFilter }),
    }
    dispatch(fetchEducation(params))
  }, [dispatch, filters.typeFilter, pagination.limit])

  // Debounced search when search term changes
  useEffect(() => {
    if (!isInitialMount.current && filters.searchTerm) {
      debouncedFetchEducation(filters.searchTerm, filters.typeFilter)
    } else if (!filters.searchTerm && !isInitialMount.current) {
      // When search is cleared, fetch without search term
      const params = {
        page: 1,
        limit: pagination.limit,
        ...(filters.typeFilter && { type: filters.typeFilter }),
      }
      dispatch(fetchEducation(params))
    }
  }, [
    filters.searchTerm,
    debouncedFetchEducation,
    filters.typeFilter,
    dispatch,
    pagination.limit,
  ])

  // Handle search input change
  const handleSearch = e => {
    const searchTerm = e.target.value
    searchRef.current = searchTerm
    dispatch(setSearchTerm(searchTerm))
  }

  // Handle type filter change
  const handleTypeFilter = e => {
    dispatch(setTypeFilter(e.target.value))
  }

  // Handle add education
  const handleAddEducation = () => {
    dispatch(openAddModal())
  }

  // Handle edit education
  const handleEditEducation = educationRecord => {
    dispatch(openEditModal(educationRecord))
  }

  // Handle delete education
  const handleDeleteEducation = educationRecord => {
    dispatch(openDeleteModal(educationRecord))
  }

  // Handle toggle education status
  const handleToggleEducationStatus = async education => {
    try {
      const response = await dispatch(
        toggleEducationStatus(education._id)
      ).unwrap()
      handleApiResponse(response)
    } catch (error) {
      handleApiError({ message: error })
    }
  }

  // Confirm delete education
  const confirmDeleteEducation = async () => {
    if (deletingEducation) {
      try {
        const response = await dispatch(
          deleteEducation(deletingEducation._id)
        ).unwrap()
        handleApiResponse(response)
      } catch (error) {
        handleApiError({ message: error })
      }
    }
  }

  // Handle pagination
  const handlePageChange = newPage => {
    const params = {
      page: newPage,
      limit: pagination.limit,
      ...(filters.typeFilter && { type: filters.typeFilter }),
      ...(searchRef.current && { search: searchRef.current }),
    }
    dispatch(fetchEducation(params))
  }

  // Handle limit change
  const handleLimitChange = newLimit => {
    const params = {
      page: 1,
      limit: newLimit,
      ...(filters.typeFilter && { type: filters.typeFilter }),
      ...(searchRef.current && { search: searchRef.current }),
    }
    dispatch(fetchEducation(params))
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

  // Format date range for display
  const formatDateRange = (startDate, endDate, isOngoing) => {
    if (!startDate) return 'No dates specified'
    
    const start = new Date(startDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    })
    
    if (isOngoing || !endDate) {
      return `${start} – Present`
    }
    
    const end = new Date(endDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    })
    
    return `${start} – ${end}`
  }

  return (
    <AdminLayout pageTitle="Education Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Education
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your educational background and qualifications
            </p>
          </div>
          <Button
            onClick={handleAddEducation}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search education..."
                value={filters.searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={filters.typeFilter}
                onChange={handleTypeFilter}
                className="pl-10 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="Degree">Degree</option>
                <option value="Certification">Certification</option>
                <option value="Course">Course</option>
                <option value="Diploma">Diploma</option>
                <option value="Training">Training</option>
              </select>
            </div>
          </div>
        </div>

        {/* Education Cards */}
        <div className="space-y-4">
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
          ) : education.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center">
              <div className="text-slate-400 dark:text-slate-500 mb-2">
                <Search className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium">No education records found</p>
                <p className="text-sm">Start by adding your first educational qualification.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {education.map((educationRecord) => (
                <div key={educationRecord._id} className="bg-surface border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 group">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {educationRecord.logo && (
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
                        <img
                          src={educationRecord.logo}
                          alt={`${educationRecord.institution} logo`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors truncate">
                        {educationRecord.institution}
                      </h3>
                      <p className="text-text-secondary text-sm font-medium truncate">
                        {educationRecord.degree}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <ToggleSwitch
                        checked={educationRecord.isActive}
                        onChange={() => handleToggleEducationStatus(educationRecord)}
                        size="sm"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Duration and Location */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>{formatDateRange(educationRecord.startDate, educationRecord.endDate, educationRecord.isOngoing)}</span>
                    </div>
                    {educationRecord.location && (
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <span className="truncate">{educationRecord.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Grade/GPA */}
                  {educationRecord.gpa && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-text">
                          Grade: {educationRecord.gpa}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Field of Study */}
                  {educationRecord.fieldOfStudy && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {educationRecord.fieldOfStudy}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {educationRecord.description && (
                    <div className="mb-4">
                      <p className="text-sm text-text-secondary line-clamp-2">
                        {educationRecord.description}
                      </p>
                    </div>
                  )}

                  {/* Status and Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      educationRecord.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {educationRecord.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditEducation(educationRecord)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 touch-manipulation"
                        title="Edit education"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEducation(educationRecord)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation"
                        title="Delete education"
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
            <div className="bg-surface border border-border rounded-lg px-6 py-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="text-xs sm:text-sm text-text-secondary">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{' '}
                    of {pagination.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">
                      Show:
                    </span>
                    <select
                      value={pagination.limit}
                      onChange={e =>
                        handleLimitChange(parseInt(e.target.value))
                      }
                      className="text-sm border border-border rounded-md bg-background text-text px-2 py-1 focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={loading}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-text-secondary">
                      entries
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                    className="px-3 py-1 text-sm font-medium text-text-secondary border border-border rounded-md hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {getPageNumbers().map((pageNum, index) => {
                    if (pageNum === '...') {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-3 py-1 text-sm text-text-secondary"
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
                            ? 'bg-primary text-white'
                            : 'text-text-secondary border border-border hover:bg-surface'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={
                      pagination.page === pagination.totalPages || loading
                    }
                    className="px-3 py-1 text-sm font-medium text-text-secondary border border-border rounded-md hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Education Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => dispatch(closeAddModal())}
        title="Add New Education"
        size="xl"
      >
        <EducationForm onCancel={() => dispatch(closeAddModal())} />
      </Modal>

      {/* Edit Education Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => dispatch(closeEditModal())}
        title="Edit Education"
        size="xl"
      >
        <EducationForm
          education={editingEducation}
          onCancel={() => dispatch(closeEditModal())}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => dispatch(closeDeleteModal())}
        onConfirm={confirmDeleteEducation}
        title="Delete Education"
        message={`Are you sure you want to delete the education record from "${deletingEducation?.institution}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loading}
      />
    </AdminLayout>
  )
}

export default Education
