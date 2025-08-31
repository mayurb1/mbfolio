import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import categoriesService from '../services/categoriesService'

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await categoriesService.getAllCategories(params)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await categoriesService.createCategory(categoryData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const response = await categoriesService.updateCategory(id, categoryData)
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await categoriesService.deleteCategory(id)
      return id
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  categories: [],
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  },
  loading: false,
  error: null,
  // Modal states
  showAddModal: false,
  showEditModal: false,
  showDeleteModal: false,
  editingCategory: null,
  deletingCategory: null
}

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    // Modal actions
    openAddModal: (state) => {
      state.showAddModal = true
      state.editingCategory = null
    },
    closeAddModal: (state) => {
      state.showAddModal = false
    },
    openEditModal: (state, action) => {
      state.showEditModal = true
      state.editingCategory = action.payload
    },
    closeEditModal: (state) => {
      state.showEditModal = false
      state.editingCategory = null
    },
    openDeleteModal: (state, action) => {
      state.showDeleteModal = true
      state.deletingCategory = action.payload
    },
    closeDeleteModal: (state) => {
      state.showDeleteModal = false
      state.deletingCategory = null
    },
    closeAllModals: (state) => {
      state.showAddModal = false
      state.showEditModal = false
      state.showDeleteModal = false
      state.editingCategory = null
      state.deletingCategory = null
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload.data.categories
        state.pagination = action.payload.data.pagination
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false
        state.showAddModal = false
        // Add the new category to the list
        state.categories.push(action.payload.data.category)
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false
        state.showEditModal = false
        state.editingCategory = null
        // Update the category in the list
        const index = state.categories.findIndex(category => category._id === action.payload.data.category._id)
        if (index !== -1) {
          state.categories[index] = action.payload.data.category
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false
        state.showDeleteModal = false
        state.deletingCategory = null
        // Remove the category from the list
        state.categories = state.categories.filter(category => category._id !== action.payload)
      })
      .addCase(deleteCategory.rejected, (state, action) => {
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
  clearError
} = categoriesSlice.actions

export default categoriesSlice.reducer