import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import skillsService from '../services/skillsService'
import {
  createEntityThunks,
  makeModalReducers,
  baseEntityState,
  applyCrudCases,
  applyInlineUpdateCase,
} from './createEntitySlice'

const CFG = {
  collectionKey: 'skills',
  itemKey: 'skill',
  editingKey: 'editingSkill',
  deletingKey: 'deletingSkill',
}

const thunks = createEntityThunks('skills', skillsService, {
  methods: {
    getAll: 'getAllSkills',
    create: 'createSkill',
    update: 'updateSkill',
    patch: 'patchSkill',
    remove: 'deleteSkill',
    toggleStatus: 'toggleSkillStatus',
  },
  updateArgKey: 'skillData',
})

export const fetchSkills = thunks.fetch
export const createSkill = thunks.create
export const updateSkill = thunks.update
export const inlineUpdateSkill = thunks.inlineUpdate
export const deleteSkill = thunks.remove
export const toggleSkillStatus = thunks.toggleStatus

// Skill categories (dropdown source) — entity-specific secondary fetch.
export const fetchCategories = createAsyncThunk(
  'skills/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await skillsService.getCategories()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const skillsSlice = createSlice({
  name: 'skills',
  initialState: baseEntityState({
    ...CFG,
    limit: 10,
    extra: {
      categories: [],
      categoriesLoading: false,
      filters: { searchTerm: '', categoryFilter: '' },
    },
  }),
  reducers: {
    ...makeModalReducers(CFG),
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
  },
  extraReducers: (builder) => {
    applyCrudCases(builder, thunks, CFG)
    applyInlineUpdateCase(builder, thunks.inlineUpdate, CFG)
    builder
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
  },
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
  clearError,
} = skillsSlice.actions

export default skillsSlice.reducer
