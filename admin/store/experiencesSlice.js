import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import experienceService from '../services/experienceService'
import {
  createEntityThunks,
  makeModalReducers,
  baseEntityState,
  applyCrudCases,
} from './createEntitySlice'

const CFG = {
  collectionKey: 'experiences',
  itemKey: 'experience',
  editingKey: 'editingExperience',
  deletingKey: 'deletingExperience',
}

const thunks = createEntityThunks('experiences', experienceService, {
  methods: {
    getAll: 'getAllExperiences',
    create: 'createExperience',
    update: 'updateExperience',
    remove: 'deleteExperience',
    toggleStatus: 'toggleExperienceStatus',
  },
  updateArgKey: 'experienceData',
})

export const fetchExperiences = thunks.fetch
export const createExperience = thunks.create
export const updateExperience = thunks.update
export const deleteExperience = thunks.remove
export const toggleExperienceStatus = thunks.toggleStatus

// Skills (dropdown source) — entity-specific secondary fetch.
export const fetchSkills = createAsyncThunk(
  'experiences/fetchSkills',
  async (_, { rejectWithValue }) => {
    try {
      return await experienceService.getSkills()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const experiencesSlice = createSlice({
  name: 'experiences',
  initialState: baseEntityState({
    ...CFG,
    limit: 10,
    extra: {
      skills: [],
      skillsLoading: false,
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
    builder
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
} = experiencesSlice.actions

export default experiencesSlice.reducer
