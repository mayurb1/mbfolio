import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import projectService from '../services/projectService'
import {
  createEntityThunks,
  makeModalReducers,
  baseEntityState,
  applyCrudCases,
  applyUpsertCases,
} from './createEntitySlice'

const CFG = {
  collectionKey: 'projects',
  itemKey: 'project',
  editingKey: 'editingProject',
  deletingKey: 'deletingProject',
}

const thunks = createEntityThunks('projects', projectService, {
  methods: {
    getAll: 'getAllProjects',
    create: 'createProject',
    update: 'updateProject',
    remove: 'deleteProject',
    toggleStatus: 'toggleProjectStatus',
  },
  updateArgKey: 'projectData',
})

export const fetchProjects = thunks.fetch
export const createProject = thunks.create
export const updateProject = thunks.update
export const deleteProject = thunks.remove
export const toggleProjectStatus = thunks.toggleStatus

// Featured toggle — behaves like toggle-status (updates the item in the list).
export const toggleProjectFeatured = createAsyncThunk(
  'projects/toggleProjectFeatured',
  async (id, { rejectWithValue }) => {
    try {
      return await projectService.toggleProjectFeatured(id)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const projectSlice = createSlice({
  name: 'projects',
  initialState: baseEntityState({
    ...CFG,
    limit: 10,
    extra: {
      filters: { searchTerm: '', categoryFilter: '', statusFilter: '', typeFilter: '' },
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
  },
  extraReducers: (builder) => {
    applyCrudCases(builder, thunks, CFG)
    applyUpsertCases(builder, toggleProjectFeatured, CFG)
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
  setStatusFilter,
  setTypeFilter,
  clearFilters,
  clearError,
} = projectSlice.actions

export default projectSlice.reducer
