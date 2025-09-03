import { useEffect, useCallback, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import AdminLayout from '../components/layout/AdminLayout'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmModal from '../components/ui/ConfirmModal'
import DataTable from '../components/ui/DataTable'
import ToggleSwitch from '../components/ui/ToggleSwitch'
import CategoryForm from '../components/forms/CategoryForm'
import {
  fetchCategories,
  deleteCategory,
  toggleCategoryStatus,
  openAddModal,
  closeAddModal,
  openEditModal,
  closeEditModal,
  openDeleteModal,
  closeDeleteModal,
  clearError
} from '../store/categoriesSlice'

const Categories = () => {
  const dispatch = useDispatch()
  const { handleApiResponse, handleApiError } = useToast()
  
  const {
    categories,
    pagination,
    loading,
    showAddModal,
    showEditModal,
    showDeleteModal,
    editingCategory,
    deletingCategory
  } = useSelector(state => state.categories)

  // Debounced search function
  const debouncedFetchCategories = useCallback(
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
          dispatch(fetchCategories(params))
        }, 300)
      }
    })(),
    [dispatch, pagination.limit]
  )

  const isInitialMount = useRef(true)
  const searchRef = useRef('')

  // Load categories on component mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      const params = {
        page: 1,
        limit: pagination.limit
      }
      dispatch(fetchCategories(params))
    }
  }, [dispatch, pagination.limit])

  // Handle search input change
  const handleSearch = (e) => {
    const searchTerm = e.target.value
    searchRef.current = searchTerm
    
    if (!searchTerm) {
      // When search is cleared, fetch without search term
      const params = {
        page: 1,
        limit: pagination.limit
      }
      dispatch(fetchCategories(params))
    } else {
      debouncedFetchCategories(searchTerm)
    }
  }

  // Handle add category
  const handleAddCategory = () => {
    dispatch(openAddModal())
  }

  // Handle edit category
  const handleEditCategory = (category) => {
    dispatch(openEditModal(category))
  }

  // Handle delete category
  const handleDeleteCategory = (category) => {
    dispatch(openDeleteModal(category))
  }

  // Handle toggle category status
  const handleToggleCategoryStatus = async (category) => {
    try {
      const response = await dispatch(toggleCategoryStatus(category._id)).unwrap()
      handleApiResponse(response)
    } catch (error) {
      handleApiError({ message: error })
    }
  }

  // Confirm delete category
  const confirmDeleteCategory = async () => {
    if (deletingCategory) {
      try {
        const response = await dispatch(deleteCategory(deletingCategory._id)).unwrap()
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
    dispatch(fetchCategories(params))
  }

  // Handle limit change
  const handleLimitChange = (newLimit) => {
    const params = {
      page: 1,
      limit: newLimit,
      ...(searchRef.current && { search: searchRef.current })
    }
    dispatch(fetchCategories(params))
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

  // Define table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Category Name',
      cell: ({ getValue }) => (
        <div className="text-sm font-medium text-slate-900 dark:text-white">
          {getValue()}
        </div>
      )
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
        const category = row.original
        return (
          <div className="flex items-center justify-end gap-1 min-w-[160px]">
            <div className="flex-shrink-0">
              <ToggleSwitch
                checked={category.isActive}
                onChange={() => handleToggleCategoryStatus(category)}
                size="sm"
                disabled={loading}
              />
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => handleEditCategory(category)}
                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 touch-manipulation flex-shrink-0"
                title="Edit category"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteCategory(category)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation flex-shrink-0"
                title="Delete category"
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
    <AdminLayout pageTitle="Categories Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Categories
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage skill categories and organization
            </p>
          </div>
          <Button onClick={handleAddCategory} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search categories..."
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>


        {/* Categories Table */}
        <div className="space-y-4">
          <DataTable
            data={categories}
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
            emptyMessage="No categories found"
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

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => dispatch(closeAddModal())}
        title="Add New Category"
        size="lg"
      >
        <CategoryForm onCancel={() => dispatch(closeAddModal())} />
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => dispatch(closeEditModal())}
        title="Edit Category"
        size="lg"
      >
        <CategoryForm 
          category={editingCategory}
          onCancel={() => dispatch(closeEditModal())} 
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => dispatch(closeDeleteModal())}
        onConfirm={confirmDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loading}
      />
    </AdminLayout>
  )
}

export default Categories