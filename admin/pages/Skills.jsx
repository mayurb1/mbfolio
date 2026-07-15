'use client'

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
import Pagination from '../components/ui/Pagination'
import EditableCell from '../components/ui/EditableCell'
import SkillForm from '../components/forms/SkillForm'
import {
  fetchSkills,
  fetchCategories,
  deleteSkill,
  inlineUpdateSkill,
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

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

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

  // Handle inline (single-field) skill update from a table cell. Rethrows so the
  // EditableCell can surface the error inline and stay open for correction.
  const handleInlineUpdate = useCallback(
    async (id, data) => {
      try {
        const response = await dispatch(inlineUpdateSkill({ id, data })).unwrap()
        handleApiResponse(response)
      } catch (error) {
        handleApiError({ message: error })
        throw new Error(typeof error === 'string' ? error : error?.message || 'Failed to update')
      }
    },
    [dispatch, handleApiResponse, handleApiError]
  )

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

  // Category dropdown options for inline editing (active categories from state).
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c, label: c })),
    [categories]
  )

  // Define table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Skill',
      cell: ({ row }) => {
        const skill = row.original
        return (
          <div className="space-y-1">
            <EditableCell
              value={skill.name}
              type="text"
              ariaLabel="skill name"
              inputProps={{ maxLength: 100 }}
              validate={(v) => {
                if (!v || v.length < 2) return 'Skill name must be at least 2 characters'
                if (v.length > 100) return 'Skill name cannot exceed 100 characters'
                return null
              }}
              onSave={(v) => handleInlineUpdate(skill._id, { name: v })}
              display={(v) => (
                <span className="text-sm font-medium text-slate-900 dark:text-white">{v}</span>
              )}
            />
            <EditableCell
              value={skill.description || ''}
              type="textarea"
              ariaLabel="description"
              inputProps={{ maxLength: 500, rows: 2 }}
              validate={(v) => (v.length > 500 ? 'Description cannot exceed 500 characters' : null)}
              onSave={(v) => handleInlineUpdate(skill._id, { description: v })}
              display={(v) =>
                v ? (
                  <span className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 max-w-xs">
                    {v}
                  </span>
                ) : (
                  <span className="text-sm italic text-slate-400 dark:text-slate-500">
                    Add description
                  </span>
                )
              }
            />
          </div>
        )
      }
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const skill = row.original
        return (
          <EditableCell
            value={skill.category}
            type="select"
            options={categoryOptions}
            ariaLabel="category"
            onSave={(v) => handleInlineUpdate(skill._id, { category: v })}
            display={(v) => (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                {v}
              </span>
            )}
          />
        )
      }
    },
    {
      accessorKey: 'proficiency',
      header: 'Proficiency',
      cell: ({ row }) => {
        const skill = row.original
        return (
          <EditableCell
            value={skill.proficiency}
            type="select"
            options={PROFICIENCY_LEVELS.map((p) => ({ value: p, label: p }))}
            ariaLabel="proficiency"
            onSave={(v) => handleInlineUpdate(skill._id, { proficiency: v })}
            display={(v) => (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProficiencyColor(v)}`}>
                {v}
              </span>
            )}
          />
        )
      }
    },
    {
      accessorKey: 'experience',
      header: 'Experience',
      cell: ({ row }) => {
        const skill = row.original
        return (
          <EditableCell
            value={skill.experience}
            type="number"
            ariaLabel="experience"
            inputProps={{ min: 0, max: 50, step: 0.1 }}
            validate={(v) => {
              if (Number.isNaN(v)) return 'Experience must be a number'
              if (v < 0) return 'Experience cannot be negative'
              if (v > 50) return 'Experience cannot exceed 50 years'
              return null
            }}
            onSave={(v) => handleInlineUpdate(skill._id, { experience: v })}
            display={(v) => (
              <span className="text-sm text-slate-900 dark:text-white">
                {v} {v === 1 ? 'year' : 'years'}
              </span>
            )}
          />
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
                aria-label={`Edit skill: ${skill.name}`}
                title="Edit skill"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteSkill(skill)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation flex-shrink-0"
                aria-label={`Delete skill: ${skill.name}`}
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
  ], [loading, handleInlineUpdate, categoryOptions])

  return (
    <AdminLayout pageTitle="Skills Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Skills
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
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
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
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
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            loading={loading}
            ariaCurrent={true}
            responsivePrevNext={true}
            styles={{
              container:
                'bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-3',
              inner: 'flex flex-col lg:flex-row items-center justify-between gap-4',
              leftGroup:
                'flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full lg:w-auto',
              resultsText:
                'text-xs sm:text-sm text-slate-700 dark:text-slate-300 text-center sm:text-left',
              showLabel: 'text-xs sm:text-sm text-slate-600 dark:text-slate-300',
              select:
                'text-xs sm:text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              entriesLabel: 'text-xs sm:text-sm text-slate-600 dark:text-slate-300',
              controls: 'flex items-center gap-1 overflow-x-auto',
              navButton:
                'px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation whitespace-nowrap',
              ellipsis:
                'px-2 sm:px-3 py-1 text-xs sm:text-sm text-slate-500 dark:text-slate-300',
              pageButtonBase:
                'px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md touch-manipulation',
              pageButtonActive: 'bg-blue-600 text-white',
              pageButtonInactive:
                'text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700',
              pageButtonDisabled: 'disabled:opacity-50 disabled:cursor-not-allowed'
            }}
          />
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