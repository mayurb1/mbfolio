import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import projectService from '../services/projectService'

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await projectService.getAllProjects(params)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await projectService.createProject(projectData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      const response = await projectService.updateProject(id, projectData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id, { rejectWithValue }) => {
    try {
      const response = await projectService.deleteProject(id)
      return { ...response, deletedId: id }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const toggleProjectStatus = createAsyncThunk(
  'projects/toggleProjectStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await projectService.toggleProjectStatus(id)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const toggleProjectFeatured = createAsyncThunk(
  'projects/toggleProjectFeatured',
  async (id, { rejectWithValue }) => {
    try {
      const response = await projectService.toggleProjectFeatured(id)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  projects: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filters: {
    searchTerm: '',
    categoryFilter: '',
    statusFilter: '',
    typeFilter: ''
  },
  loading: false,
  error: null,
  // Modal states
  showAddModal: false,
  showEditModal: false,
  showDeleteModal: false,
  editingProject: null,
  deletingProject: null
}

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    // Modal actions
    openAddModal: (state) => {
      state.showAddModal = true
      state.editingProject = null
    },
    closeAddModal: (state) => {
      state.showAddModal = false
    },
    openEditModal: (state, action) => {
      state.showEditModal = true
      state.editingProject = action.payload
    },
    closeEditModal: (state) => {
      state.showEditModal = false
      state.editingProject = null
    },
    openDeleteModal: (state, action) => {
      state.showDeleteModal = true
      state.deletingProject = action.payload
    },
    closeDeleteModal: (state) => {
      state.showDeleteModal = false
      state.deletingProject = null
    },
    closeAllModals: (state) => {
      state.showAddModal = false
      state.showEditModal = false
      state.showDeleteModal = false
      state.editingProject = null
      state.deletingProject = null
    },
    
    // Filter actions
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload
    },
    setCategoryFilter: (state, action) => {
      state.filters.categoryFilter = action.payload
    },
    setStatusFilter: (state, action) => {
      state.filters.statusFilter = action.payload
    },
    setTypeFilter: (state, action) => {
      state.filters.typeFilter = action.payload
    },
    clearFilters: (state) => {
      state.filters.searchTerm = ''
      state.filters.categoryFilter = ''
      state.filters.statusFilter = ''
      state.filters.typeFilter = ''
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false
        state.projects = action.payload.data.projects
        state.pagination = action.payload.data.pagination
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create project
      .addCase(createProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false
        state.showAddModal = false
        // Optionally add the new project to the list if on first page
        if (state.pagination.page === 1) {
          state.projects.unshift(action.payload.data.project)
        }
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false
        state.showEditModal = false
        state.editingProject = null
        // Update the project in the list
        const index = state.projects.findIndex(project => project._id === action.payload.data.project._id)
        if (index !== -1) {
          state.projects[index] = action.payload.data.project
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false
        state.showDeleteModal = false
        state.deletingProject = null
        // Remove the project from the list
        state.projects = state.projects.filter(project => project._id !== action.payload.deletedId)
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Toggle project status
      .addCase(toggleProjectStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(toggleProjectStatus.fulfilled, (state, action) => {
        state.loading = false
        // Update the project record in the list
        const index = state.projects.findIndex(project => project._id === action.payload.data.project._id)
        if (index !== -1) {
          state.projects[index] = action.payload.data.project
        }
      })
      .addCase(toggleProjectStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Toggle project featured
      .addCase(toggleProjectFeatured.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(toggleProjectFeatured.fulfilled, (state, action) => {
        state.loading = false
        // Update the project record in the list
        const index = state.projects.findIndex(project => project._id === action.payload.data.project._id)
        if (index !== -1) {
          state.projects[index] = action.payload.data.project
        }
      })
      .addCase(toggleProjectFeatured.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const {
  openAddModal,
  closeAddModal,
  openEditModal,
  closeEditModal,
  openDeleteModal,
  closeDeleteModal,
  closeAllModals,
  setSearchTerm,
  setCategoryFilter,
  setStatusFilter,
  setTypeFilter,
  clearFilters,
  clearError
} = projectSlice.actions

export default projectSlice.reducer