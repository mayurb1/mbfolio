import { useEffect, useCallback, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import AdminLayout from '../components/layout/AdminLayout'
import Button from '../components/ui/Button'
import ToggleSwitch from '../components/ui/ToggleSwitch'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import DataTable from '../components/ui/DataTable'
import SkillForm from '../components/forms/SkillForm'
import {
  fetchSkills,
  fetchCategories,
  deleteSkill,
  toggleSkillStatus,
  openAddModal,
  closeAddModal,
  openEditModal,
  closeEditModal,
  openDeleteModal,
  closeDeleteModal,
  setSearchTerm,
  setCategoryFilter,
  clearError
} from '../store/skillsSlice'

const Skills = () => {
  const dispatch = useDispatch()
  const { handleApiResponse, handleApiError } = useToast()
  
  const {
    skills,
    categories,
    pagination,
    filters,
    loading,
    showAddModal,
    showEditModal,
    showDeleteModal,
    editingSkill,
    deletingSkill
  } = useSelector(state => state.skills)

  // Debounced search function
  const debouncedFetchSkills = useCallback(
    (() => {
      let timeoutId
      return (searchTerm, categoryFilter) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          const params = {
            page: 1,
            limit: pagination.limit,
            ...(categoryFilter && { category: categoryFilter }),
            ...(searchTerm && { search: searchTerm })
          }
          dispatch(fetchSkills(params))
        }, 300) // 300ms debounce delay
      }
    })(),
    [dispatch, pagination.limit]
  )

  const isInitialMount = useRef(true)

  // Load skills and categories on component mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      // Fetch categories on initial load
      dispatch(fetchCategories())
    }
    
    const params = {
      page: 1,
      limit: pagination.limit,
      ...(filters.categoryFilter && { category: filters.categoryFilter })
    }
    dispatch(fetchSkills(params))
  }, [dispatch, filters.categoryFilter, pagination.limit])

  // Debounced search when search term changes (but not on category changes)
  useEffect(() => {
    if (!isInitialMount.current && filters.searchTerm) {
      debouncedFetchSkills(filters.searchTerm, filters.categoryFilter)
    } else if (!filters.searchTerm && !isInitialMount.current) {
      // When search is cleared, fetch without search term
      const params = {
        page: 1,
        limit: pagination.limit,
        ...(filters.categoryFilter && { category: filters.categoryFilter })
      }
      dispatch(fetchSkills(params))
    }
  }, [filters.searchTerm, debouncedFetchSkills, filters.categoryFilter, dispatch, pagination.limit])

  // Handle search input change
  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value))
  }

  // Handle category filter change
  const handleCategoryFilter = (e) => {
    dispatch(setCategoryFilter(e.target.value))
  }

  // Handle add skill
  const handleAddSkill = () => {
    dispatch(openAddModal())
  }

  // Handle edit skill
  const handleEditSkill = (skill) => {
    dispatch(openEditModal(skill))
  }

  // Handle delete skill
  const handleDeleteSkill = (skill) => {
    dispatch(openDeleteModal(skill))
  }

  // Confirm delete skill
  const confirmDeleteSkill = async () => {
    if (deletingSkill) {
      try {
        const response = await dispatch(deleteSkill(deletingSkill._id)).unwrap()
        handleApiResponse(response)
      } catch (error) {
        handleApiError({ message: error })
      }
    }
  }

  // Handle toggle skill status
  const handleToggleSkillStatus = async (skillId) => {
    try {
      const response = await dispatch(toggleSkillStatus(skillId)).unwrap()
      handleApiResponse(response)
    } catch (error) {
      handleApiError({ message: error })
    }
  }

  // Handle pagination
  const handlePageChange = (newPage) => {
    const params = {
      page: newPage,
      limit: pagination.limit,
      ...(filters.categoryFilter && { category: filters.categoryFilter }),
      ...(filters.searchTerm && { search: filters.searchTerm })
    }
    dispatch(fetchSkills(params))
  }

  // Handle limit change
  const handleLimitChange = (newLimit) => {
    const params = {
      page: 1, // Reset to first page when changing limit
      limit: newLimit,
      ...(filters.categoryFilter && { category: filters.categoryFilter }),
      ...(filters.searchTerm && { search: filters.searchTerm })
    }
    dispatch(fetchSkills(params))
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const { page, totalPages } = pagination
    const pages = []
    
    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show smart pagination with ellipsis
      if (page <= 4) {
        // Show first 5 pages + ellipsis + last page
        for (let i = 1; i <= 5; i++) pages.push(i)
        if (totalPages > 6) pages.push('...')
        pages.push(totalPages)
      } else if (page >= totalPages - 3) {
        // Show first page + ellipsis + last 5 pages
        pages.push(1)
        if (totalPages > 6) pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
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

  // Get proficiency badge color
  const getProficiencyColor = (proficiency) => {
    const colors = {
      'Beginner': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      'Intermediate': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'Advanced': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'Expert': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    }
    return colors[proficiency] || 'bg-gray-100 text-gray-800'
  }

  // Define table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Skill',
      cell: ({ row }) => {
        const skill = row.original
        return (
          <div>
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              {skill.name}
            </div>
            {skill.description && (
              <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">
                {skill.description}
              </div>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ getValue }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          {getValue()}
        </span>
      )
    },
    {
      accessorKey: 'proficiency',
      header: 'Proficiency',
      cell: ({ getValue }) => {
        const proficiency = getValue()
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProficiencyColor(proficiency)}`}>
            {proficiency}
          </span>
        )
      }
    },
    {
      accessorKey: 'experience',
      header: 'Experience',
      cell: ({ getValue }) => {
        const experience = getValue()
        return (
          <span className="text-sm text-slate-900 dark:text-white">
            {experience} {experience === 1 ? 'year' : 'years'}
          </span>
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
      size: 180, // Fixed width for actions column
      cell: ({ row }) => {
        const skill = row.original
        return (
          <div className="flex items-center justify-end gap-1 min-w-[160px]">
            <div className="flex-shrink-0">
              <ToggleSwitch
                checked={skill.isActive}
                onChange={() => handleToggleSkillStatus(skill._id)}
                size="sm"
                disabled={loading}
              />
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => handleEditSkill(skill)}
                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 touch-manipulation flex-shrink-0"
                title="Edit skill"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteSkill(skill)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation flex-shrink-0"
                title="Delete skill"
                disabled={loading}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      }
    }
  ], [loading])

  return (
    <AdminLayout pageTitle="Skills Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Skills
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Manage your skills and proficiency levels
            </p>
          </div>
          <Button onClick={handleAddSkill} className="flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
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
                placeholder="Search skills..."
                value={filters.searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Category Filter */}
            <div className="relative sm:min-w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={filters.categoryFilter}
                onChange={handleCategoryFilter}
                className="w-full pl-10 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>


        {/* Skills Table */}
        <div className="space-y-4">
          {/* DataTable */}
          <DataTable
            data={skills}
            columns={columns}
            loading={loading}
            pageCount={pagination.totalPages}
            pageIndex={pagination.page - 1} // Convert to 0-based
            pageSize={pagination.limit}
            manualPagination={true}
            onPaginationChange={(updater) => {
              const newPagination = typeof updater === 'function' 
                ? updater({ pageIndex: pagination.page - 1, pageSize: pagination.limit })
                : updater
              handlePageChange(newPagination.pageIndex + 1) // Convert back to 1-based
            }}
            emptyMessage="No skills found"
            showPagination={false} // We'll handle pagination manually with our custom UI
          />

          {/* Custom Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                {/* Results info and limit selector */}
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto">
                  <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 text-center sm:text-left">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Show:</span>
                    <select
                      value={pagination.limit}
                      onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                      className="text-xs sm:text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">entries</span>
                  </div>
                </div>

                {/* Pagination controls */}
                <div className="flex items-center gap-1 overflow-x-auto">
                  {/* Previous button */}
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">‹</span>
                  </button>

                  {/* Page numbers */}
                  {getPageNumbers().map((pageNum, index) => {
                    if (pageNum === '...') {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-slate-400 dark:text-slate-500"
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
                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md touch-manipulation ${
                          isCurrentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  {/* Next button */}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages || loading}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation whitespace-nowrap"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">›</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Skill Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => dispatch(closeAddModal())}
        title="Add New Skill"
        size="lg"
      >
        <SkillForm onCancel={() => dispatch(closeAddModal())} />
      </Modal>

      {/* Edit Skill Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => dispatch(closeEditModal())}
        title="Edit Skill"
        size="lg"
      >
        <SkillForm 
          skill={editingSkill}
          onCancel={() => dispatch(closeEditModal())} 
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => dispatch(closeDeleteModal())}
        onConfirm={confirmDeleteSkill}
        title="Delete Skill"
        message={`Are you sure you want to delete "${deletingSkill?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loading}
      />
    </AdminLayout>
  )
}

export default Skills