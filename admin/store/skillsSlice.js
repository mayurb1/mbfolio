import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import skillsService from '../services/skillsService'

// Async thunks
export const fetchSkills = createAsyncThunk(
  'skills/fetchSkills',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await skillsService.getAllSkills(params)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createSkill = createAsyncThunk(
  'skills/createSkill',
  async (skillData, { rejectWithValue }) => {
    try {
      const response = await skillsService.createSkill(skillData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateSkill = createAsyncThunk(
  'skills/updateSkill',
  async ({ id, skillData }, { rejectWithValue }) => {
    try {
      const response = await skillsService.updateSkill(id, skillData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteSkill = createAsyncThunk(
  'skills/deleteSkill',
  async (id, { rejectWithValue }) => {
    try {
      const response = await skillsService.deleteSkill(id)
      return { ...response, deletedId: id }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const toggleSkillStatus = createAsyncThunk(
  'skills/toggleSkillStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await skillsService.toggleSkillStatus(id)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchCategories = createAsyncThunk(
  'skills/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await skillsService.getCategories()
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  skills: [],
  categories: [],
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
  categoriesLoading: false,
  error: null,
  // Modal states
  showAddModal: false,
  showEditModal: false,
  showDeleteModal: false,
  editingSkill: null,
  deletingSkill: null
}

const skillsSlice = createSlice({
  name: 'skills',
  initialState,
  reducers: {
    // Modal actions
    openAddModal: (state) => {
      state.showAddModal = true
      state.editingSkill = null
    },
    closeAddModal: (state) => {
      state.showAddModal = false
    },
    openEditModal: (state, action) => {
      state.showEditModal = true
      state.editingSkill = action.payload
    },
    closeEditModal: (state) => {
      state.showEditModal = false
      state.editingSkill = null
    },
    openDeleteModal: (state, action) => {
      state.showDeleteModal = true
      state.deletingSkill = action.payload
    },
    closeDeleteModal: (state) => {
      state.showDeleteModal = false
      state.deletingSkill = null
    },
    closeAllModals: (state) => {
      state.showAddModal = false
      state.showEditModal = false
      state.showDeleteModal = false
      state.editingSkill = null
      state.deletingSkill = null
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
      // Fetch skills
      .addCase(fetchSkills.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSkills.fulfilled, (state, action) => {
        state.loading = false
        state.skills = action.payload.data.skills
        state.pagination = action.payload.data.pagination
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create skill
      .addCase(createSkill.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSkill.fulfilled, (state, action) => {
        state.loading = false
        state.showAddModal = false
        // Optionally add the new skill to the list if on first page
        if (state.pagination.page === 1) {
          state.skills.unshift(action.payload.data.skill)
        }
      })
      .addCase(createSkill.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update skill
      .addCase(updateSkill.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSkill.fulfilled, (state, action) => {
        state.loading = false
        state.showEditModal = false
        state.editingSkill = null
        // Update the skill in the list
        const index = state.skills.findIndex(skill => skill._id === action.payload.data.skill._id)
        if (index !== -1) {
          state.skills[index] = action.payload.data.skill
        }
      })
      .addCase(updateSkill.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete skill
      .addCase(deleteSkill.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteSkill.fulfilled, (state, action) => {
        state.loading = false
        state.showDeleteModal = false
        state.deletingSkill = null
        // Remove the skill from the list
        state.skills = state.skills.filter(skill => skill._id !== action.payload.deletedId)
      })
      .addCase(deleteSkill.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false
        state.categories = action.payload.data.categories
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false
        state.error = action.payload
      })

      // Toggle skill status
      .addCase(toggleSkillStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(toggleSkillStatus.fulfilled, (state, action) => {
        state.loading = false
        // Update the skill in the list
        const index = state.skills.findIndex(skill => skill._id === action.payload.data.skill._id)
        if (index !== -1) {
          state.skills[index] = action.payload.data.skill
        }
      })
      .addCase(toggleSkillStatus.rejected, (state, action) => {
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
} = skillsSlice.actions

// Note: fetchSkills, fetchCategories, createSkill, updateSkill, deleteSkill 
// are already exported as individual const exports above

export default skillsSlice.reducer