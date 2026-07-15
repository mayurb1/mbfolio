import { createAsyncThunk } from '@reduxjs/toolkit'

// Shared building blocks for the entity CRUD slices. Every entity slice used to
// repeat the same 5 async thunks, the same modal reducers, the same
// initialState shape and the same 5 blocks of extraReducers — these helpers
// generate all of that from a small config while leaving each slice free to add
// its own filters / extra thunks.

/**
 * Build the 5 standard CRUD thunks for an entity.
 * @param {string} name    slice name, e.g. 'categories' (used as the action-type prefix)
 * @param {object} service the entity service
 * @param {object} opts
 * @param {{getAll,create,update,remove,toggleStatus,patch?}} opts.methods service method names
 * @param {string} opts.updateArgKey key on the update() arg holding the payload, e.g. 'categoryData'
 * @returns {{fetch,create,update,remove,toggleStatus,inlineUpdate?}}
 */
export function createEntityThunks(name, service, { methods, updateArgKey }) {
  const wrap = (fn) => async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }

  return {
    fetch: createAsyncThunk(
      `${name}/fetch`,
      wrap((params = {}) => service[methods.getAll](params))
    ),
    create: createAsyncThunk(`${name}/create`, wrap((data) => service[methods.create](data))),
    update: createAsyncThunk(
      `${name}/update`,
      wrap((arg) => service[methods.update](arg.id, arg[updateArgKey]))
    ),
    // Partial single-field update for inline table editing. Separate from
    // `update` so its reducer can upsert the row WITHOUT flipping the global
    // `loading` flag (which would blank the whole DataTable on every save).
    inlineUpdate: methods.patch
      ? createAsyncThunk(
          `${name}/inlineUpdate`,
          wrap((arg) => service[methods.patch](arg.id, arg.data))
        )
      : undefined,
    remove: createAsyncThunk(`${name}/remove`, async (id, { rejectWithValue }) => {
      try {
        const response = await service[methods.remove](id)
        return { ...response, deletedId: id }
      } catch (error) {
        return rejectWithValue(error.message)
      }
    }),
    toggleStatus: createAsyncThunk(
      `${name}/toggleStatus`,
      wrap((id) => service[methods.toggleStatus](id))
    ),
  }
}

// The 7 modal reducers + clearError, keyed by the entity's editing/deleting keys.
export function makeModalReducers({ editingKey, deletingKey }) {
  return {
    openAddModal: (state) => {
      state.showAddModal = true
      state[editingKey] = null
    },
    closeAddModal: (state) => {
      state.showAddModal = false
    },
    openEditModal: (state, action) => {
      state.showEditModal = true
      state[editingKey] = action.payload
    },
    closeEditModal: (state) => {
      state.showEditModal = false
      state[editingKey] = null
    },
    openDeleteModal: (state, action) => {
      state.showDeleteModal = true
      state[deletingKey] = action.payload
    },
    closeDeleteModal: (state) => {
      state.showDeleteModal = false
      state[deletingKey] = null
    },
    closeAllModals: (state) => {
      state.showAddModal = false
      state.showEditModal = false
      state.showDeleteModal = false
      state[editingKey] = null
      state[deletingKey] = null
    },
    clearError: (state) => {
      state.error = null
    },
  }
}

// The common initialState; `extra` is merged in for entity-specific fields
// (filters, secondary collections, etc.).
export function baseEntityState({ collectionKey, editingKey, deletingKey, limit = 10, extra = {} }) {
  return {
    [collectionKey]: [],
    pagination: { page: 1, limit, total: 0, totalPages: 0 },
    loading: false,
    error: null,
    showAddModal: false,
    showEditModal: false,
    showDeleteModal: false,
    [editingKey]: null,
    [deletingKey]: null,
    ...extra,
  }
}

/**
 * Attach the standard pending/fulfilled/rejected cases for the 5 CRUD thunks.
 * @param {string} [opts.createStrategy] 'push' (append always) or
 *   'unshiftFirstPage' (prepend only when on page 1). Default 'unshiftFirstPage'.
 */
export function applyCrudCases(
  builder,
  thunks,
  { collectionKey, itemKey, editingKey, deletingKey, createStrategy = 'unshiftFirstPage' }
) {
  const startLoading = (state) => {
    state.loading = true
    state.error = null
  }
  const setError = (state, action) => {
    state.loading = false
    state.error = action.payload
  }
  const upsert = (state, item) => {
    const index = state[collectionKey].findIndex((x) => x._id === item._id)
    if (index !== -1) state[collectionKey][index] = item
  }

  builder
    .addCase(thunks.fetch.pending, startLoading)
    .addCase(thunks.fetch.fulfilled, (state, action) => {
      state.loading = false
      state[collectionKey] = action.payload.data[collectionKey]
      state.pagination = action.payload.data.pagination
    })
    .addCase(thunks.fetch.rejected, setError)

    .addCase(thunks.create.pending, startLoading)
    .addCase(thunks.create.fulfilled, (state, action) => {
      state.loading = false
      state.showAddModal = false
      const item = action.payload.data[itemKey]
      if (createStrategy === 'push') {
        state[collectionKey].push(item)
      } else if (state.pagination.page === 1) {
        state[collectionKey].unshift(item)
      }
    })
    .addCase(thunks.create.rejected, setError)

    .addCase(thunks.update.pending, startLoading)
    .addCase(thunks.update.fulfilled, (state, action) => {
      state.loading = false
      state.showEditModal = false
      state[editingKey] = null
      upsert(state, action.payload.data[itemKey])
    })
    .addCase(thunks.update.rejected, setError)

    .addCase(thunks.remove.pending, startLoading)
    .addCase(thunks.remove.fulfilled, (state, action) => {
      state.loading = false
      state.showDeleteModal = false
      state[deletingKey] = null
      state[collectionKey] = state[collectionKey].filter(
        (x) => x._id !== action.payload.deletedId
      )
    })
    .addCase(thunks.remove.rejected, setError)

    .addCase(thunks.toggleStatus.pending, startLoading)
    .addCase(thunks.toggleStatus.fulfilled, (state, action) => {
      state.loading = false
      upsert(state, action.payload.data[itemKey])
    })
    .addCase(thunks.toggleStatus.rejected, setError)
}

// Attach pending/fulfilled/rejected for an extra "update this item in the list"
// thunk (e.g. project toggle-featured).
export function applyUpsertCases(builder, thunk, { collectionKey, itemKey }) {
  builder
    .addCase(thunk.pending, (state) => {
      state.loading = true
      state.error = null
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state.loading = false
      const item = action.payload.data[itemKey]
      const index = state[collectionKey].findIndex((x) => x._id === item._id)
      if (index !== -1) state[collectionKey][index] = item
    })
    .addCase(thunk.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload
    })
}

// Attach cases for the inline (partial) update thunk. Unlike the other CRUD
// cases this deliberately does NOT touch `state.loading` — inline edits keep
// the table rendered and track their own per-cell saving state — it only
// upserts the returned row on success and records the error on failure.
export function applyInlineUpdateCase(builder, thunk, { collectionKey, itemKey }) {
  builder
    .addCase(thunk.fulfilled, (state, action) => {
      const item = action.payload.data[itemKey]
      const index = state[collectionKey].findIndex((x) => x._id === item._id)
      if (index !== -1) state[collectionKey][index] = item
    })
    .addCase(thunk.rejected, (state, action) => {
      state.error = action.payload
    })
}
