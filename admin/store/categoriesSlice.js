import { createSlice } from '@reduxjs/toolkit'
import categoriesService from '../services/categoriesService'
import {
  createEntityThunks,
  makeModalReducers,
  baseEntityState,
  applyCrudCases,
  applyInlineUpdateCase,
} from './createEntitySlice'

const CFG = {
  collectionKey: 'categories',
  itemKey: 'category',
  editingKey: 'editingCategory',
  deletingKey: 'deletingCategory',
}

const thunks = createEntityThunks('categories', categoriesService, {
  methods: {
    getAll: 'getAllCategories',
    create: 'createCategory',
    update: 'updateCategory',
    patch: 'patchCategory',
    remove: 'deleteCategory',
    toggleStatus: 'toggleCategoryStatus',
  },
  updateArgKey: 'categoryData',
})

export const fetchCategories = thunks.fetch
export const createCategory = thunks.create
export const updateCategory = thunks.update
export const inlineUpdateCategory = thunks.inlineUpdate
export const deleteCategory = thunks.remove
export const toggleCategoryStatus = thunks.toggleStatus

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: baseEntityState({ ...CFG, limit: 50 }),
  reducers: makeModalReducers(CFG),
  extraReducers: (builder) => {
    applyCrudCases(builder, thunks, { ...CFG, createStrategy: 'push' })
    applyInlineUpdateCase(builder, thunks.inlineUpdate, CFG)
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
  clearError,
} = categoriesSlice.actions

export default categoriesSlice.reducer
