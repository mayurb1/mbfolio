import { createSlice } from '@reduxjs/toolkit'
import educationService from '../services/educationService'
import {
  createEntityThunks,
  makeModalReducers,
  baseEntityState,
  applyCrudCases,
} from './createEntitySlice'

const CFG = {
  collectionKey: 'education',
  itemKey: 'education',
  editingKey: 'editingEducation',
  deletingKey: 'deletingEducation',
}

const thunks = createEntityThunks('education', educationService, {
  methods: {
    getAll: 'getAllEducation',
    create: 'createEducation',
    update: 'updateEducation',
    remove: 'deleteEducation',
    toggleStatus: 'toggleEducationStatus',
  },
  updateArgKey: 'educationData',
})

export const fetchEducation = thunks.fetch
export const createEducation = thunks.create
export const updateEducation = thunks.update
export const deleteEducation = thunks.remove
export const toggleEducationStatus = thunks.toggleStatus

const educationSlice = createSlice({
  name: 'education',
  initialState: baseEntityState({
    ...CFG,
    limit: 10,
    extra: { filters: { searchTerm: '', typeFilter: '' } },
  }),
  reducers: {
    ...makeModalReducers(CFG),
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
  },
  extraReducers: (builder) => applyCrudCases(builder, thunks, CFG),
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
  clearError,
} = educationSlice.actions

export default educationSlice.reducer
