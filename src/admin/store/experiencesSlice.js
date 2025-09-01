import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import experienceService from '../services/experienceService'

// Async thunks
export const fetchExperiences = createAsyncThunk(
  'experiences/fetchExperiences',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await experienceService.getAllExperiences(params)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createExperience = createAsyncThunk(
  'experiences/createExperience',
  async (experienceData, { rejectWithValue }) => {
    try {
      const response = await experienceService.createExperience(experienceData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateExperience = createAsyncThunk(
  'experiences/updateExperience',
  async ({ id, experienceData }, { rejectWithValue }) => {
    try {
      const response = await experienceService.updateExperience(id, experienceData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteExperience = createAsyncThunk(
  'experiences/deleteExperience',
  async (id, { rejectWithValue }) => {
    try {
      const response = await experienceService.deleteExperience(id)
      return { ...response, deletedId: id }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const toggleExperienceStatus = createAsyncThunk(
  'experiences/toggleExperienceStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await experienceService.toggleExperienceStatus(id)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchSkills = createAsyncThunk(
  'experiences/fetchSkills',
  async (_, { rejectWithValue }) => {
    try {
      const response = await experienceService.getSkills()
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  experiences: [],
  skills: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  filters: {
    searchTerm: '',
    categoryFilter: ''
  },
  loading: false,
  skillsLoading: false,
  error: null,
  // Modal states
  showAddModal: false,
  showEditModal: false,
  showDeleteModal: false,
  editingExperience: null,
  deletingExperience: null
}

const experiencesSlice = createSlice({
  name: 'experiences',
  initialState,
  reducers: {
    // Modal actions
    openAddModal: (state) => {
      state.showAddModal = true
      state.editingExperience = null
    },
    closeAddModal: (state) => {
      state.showAddModal = false
    },
    openEditModal: (state, action) => {
      state.showEditModal = true
      state.editingExperience = action.payload
    },
    closeEditModal: (state) => {
      state.showEditModal = false
      state.editingExperience = null
    },
    openDeleteModal: (state, action) => {
      state.showDeleteModal = true
      state.deletingExperience = action.payload
    },
    closeDeleteModal: (state) => {
      state.showDeleteModal = false
      state.deletingExperience = null
    },
    closeAllModals: (state) => {
      state.showAddModal = false
      state.showEditModal = false
      state.showDeleteModal = false
      state.editingExperience = null
      state.deletingExperience = null
    },
    
    // Filter actions
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload
    },
    setCategoryFilter: (state, action) => {
      state.filters.categoryFilter = action.payload
    },
    clearFilters: (state) => {
      state.filters.searchTerm = ''
      state.filters.categoryFilter = ''
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch experiences
      .addCase(fetchExperiences.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchExperiences.fulfilled, (state, action) => {
        state.loading = false
        state.experiences = action.payload.data.experiences
        state.pagination = action.payload.data.pagination
      })
      .addCase(fetchExperiences.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create experience
      .addCase(createExperience.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createExperience.fulfilled, (state, action) => {
        state.loading = false
        state.showAddModal = false
        // Optionally add the new experience to the list if on first page
        if (state.pagination.page === 1) {
          state.experiences.unshift(action.payload.data.experience)
        }
      })
      .addCase(createExperience.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update experience
      .addCase(updateExperience.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateExperience.fulfilled, (state, action) => {
        state.loading = false
        state.showEditModal = false
        state.editingExperience = null
        // Update the experience in the list
        const index = state.experiences.findIndex(exp => exp._id === action.payload.data.experience._id)
        if (index !== -1) {
          state.experiences[index] = action.payload.data.experience
        }
      })
      .addCase(updateExperience.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete experience
      .addCase(deleteExperience.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteExperience.fulfilled, (state, action) => {
        state.loading = false
        state.showDeleteModal = false
        state.deletingExperience = null
        // Remove the experience from the list
        state.experiences = state.experiences.filter(exp => exp._id !== action.payload.deletedId)
      })
      .addCase(deleteExperience.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch skills
      .addCase(fetchSkills.pending, (state) => {
        state.skillsLoading = true
      })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.skillsLoading = false
        state.skills = action.payload.data.skills
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.skillsLoading = false
        state.error = action.payload
      })

      // Toggle experience status
      .addCase(toggleExperienceStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(toggleExperienceStatus.fulfilled, (state, action) => {
        state.loading = false
        // Update the experience in the list
        const index = state.experiences.findIndex(experience => experience._id === action.payload.data.experience._id)
        if (index !== -1) {
          state.experiences[index] = action.payload.data.experience
        }
      })
      .addCase(toggleExperienceStatus.rejected, (state, action) => {
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
  clearFilters,
  clearError
} = experiencesSlice.actions

// Note: fetchExperiences, fetchSkills, createExperience, updateExperience, deleteExperience 
// are already exported as individual const exports above

export default experiencesSlice.reducer