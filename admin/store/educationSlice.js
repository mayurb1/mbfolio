import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import educationService from '../services/educationService'

// Async thunks
export const fetchEducation = createAsyncThunk(
  'education/fetchEducation',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await educationService.getAllEducation(params)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createEducation = createAsyncThunk(
  'education/createEducation',
  async (educationData, { rejectWithValue }) => {
    try {
      const response = await educationService.createEducation(educationData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateEducation = createAsyncThunk(
  'education/updateEducation',
  async ({ id, educationData }, { rejectWithValue }) => {
    try {
      const response = await educationService.updateEducation(id, educationData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteEducation = createAsyncThunk(
  'education/deleteEducation',
  async (id, { rejectWithValue }) => {
    try {
      const response = await educationService.deleteEducation(id)
      return { ...response, deletedId: id }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const toggleEducationStatus = createAsyncThunk(
  'education/toggleEducationStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await educationService.toggleEducationStatus(id)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  education: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filters: {
    searchTerm: '',
    typeFilter: ''
  },
  loading: false,
  error: null,
  // Modal states
  showAddModal: false,
  showEditModal: false,
  showDeleteModal: false,
  editingEducation: null,
  deletingEducation: null
}

const educationSlice = createSlice({
  name: 'education',
  initialState,
  reducers: {
    // Modal actions
    openAddModal: (state) => {
      state.showAddModal = true
      state.editingEducation = null
    },
    closeAddModal: (state) => {
      state.showAddModal = false
    },
    openEditModal: (state, action) => {
      state.showEditModal = true
      state.editingEducation = action.payload
    },
    closeEditModal: (state) => {
      state.showEditModal = false
      state.editingEducation = null
    },
    openDeleteModal: (state, action) => {
      state.showDeleteModal = true
      state.deletingEducation = action.payload
    },
    closeDeleteModal: (state) => {
      state.showDeleteModal = false
      state.deletingEducation = null
    },
    closeAllModals: (state) => {
      state.showAddModal = false
      state.showEditModal = false
      state.showDeleteModal = false
      state.editingEducation = null
      state.deletingEducation = null
    },
    
    // Filter actions
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload
    },
    setTypeFilter: (state, action) => {
      state.filters.typeFilter = action.payload
    },
    clearFilters: (state) => {
      state.filters.searchTerm = ''
      state.filters.typeFilter = ''
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch education
      .addCase(fetchEducation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEducation.fulfilled, (state, action) => {
        state.loading = false
        state.education = action.payload.data.education
        state.pagination = action.payload.data.pagination
      })
      .addCase(fetchEducation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create education
      .addCase(createEducation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createEducation.fulfilled, (state, action) => {
        state.loading = false
        state.showAddModal = false
        // Optionally add the new education to the list if on first page
        if (state.pagination.page === 1) {
          state.education.unshift(action.payload.data.education)
        }
      })
      .addCase(createEducation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update education
      .addCase(updateEducation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateEducation.fulfilled, (state, action) => {
        state.loading = false
        state.showEditModal = false
        state.editingEducation = null
        // Update the education in the list
        const index = state.education.findIndex(edu => edu._id === action.payload.data.education._id)
        if (index !== -1) {
          state.education[index] = action.payload.data.education
        }
      })
      .addCase(updateEducation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete education
      .addCase(deleteEducation.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteEducation.fulfilled, (state, action) => {
        state.loading = false
        state.showDeleteModal = false
        state.deletingEducation = null
        // Remove the education from the list
        state.education = state.education.filter(edu => edu._id !== action.payload.deletedId)
      })
      .addCase(deleteEducation.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Toggle education status
      .addCase(toggleEducationStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(toggleEducationStatus.fulfilled, (state, action) => {
        state.loading = false
        // Update the education record in the list
        const index = state.education.findIndex(edu => edu._id === action.payload.data.education._id)
        if (index !== -1) {
          state.education[index] = action.payload.data.education
        }
      })
      .addCase(toggleEducationStatus.rejected, (state, action) => {
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
  setTypeFilter,
  clearFilters,
  clearError
} = educationSlice.actions

// Note: fetchEducation, createEducation, updateEducation, deleteEducation, toggleEducationStatus
// are already exported as individual const exports above

export default educationSlice.reducer