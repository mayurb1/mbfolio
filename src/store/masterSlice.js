import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import masterService from '../services/masterService'

// Async thunk to fetch master data
export const fetchMasterData = createAsyncThunk(
  'master/fetchMasterData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await masterService.getMasterData()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

const initialState = {
  // User data
  user: {
    name: '',
    email: '',
    phone: '',
    bio: '',
    profileImage: '',
    linkedinUrl: '',
    githubUrl: '',
    location: {
      full: null,
      city: '',
      state: '',
      country: '',
      address: '',
      coordinates: null
    }
  },
  // Stats data
  stats: {
    experience: {
      text: '',
      years: 0,
      months: 0,
      totalMonths: 0
    },
    projects: {
      completed: 0,
      total: 0
    },
    experiences: {
      count: 0
    }
  },
  // Skills highlights
  highlights: [],
  // Loading and error states
  loading: false,
  error: null,
  lastFetched: null,
  loadingStartTime: null,
  showSlowLoading: false
}

const masterSlice = createSlice({
  name: 'master',
  initialState,
  reducers: {
    // Clear error
    clearError: (state) => {
      state.error = null
    },
    // Reset master data
    resetMasterData: () => {
      return { ...initialState }
    },
    // Update user data manually (for optimistic updates)
    updateUserData: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    },
    // Set slow loading indicator
    setSlowLoading: (state, action) => {
      state.showSlowLoading = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterData.pending, (state) => {
        state.loading = true
        state.error = null
        state.loadingStartTime = Date.now()
        state.showSlowLoading = false
      })
      .addCase(fetchMasterData.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.user = action.payload.user
        state.stats = action.payload.stats
        state.highlights = action.payload.highlights
        state.lastFetched = new Date().toISOString()
        state.loadingStartTime = null
        state.showSlowLoading = false
      })
      .addCase(fetchMasterData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.loadingStartTime = null
        state.showSlowLoading = false
      })
  }
})

// Export actions
export const { clearError, resetMasterData, updateUserData, setSlowLoading } = masterSlice.actions

// Export selectors
export const selectMasterData = (state) => state.master
export const selectUser = (state) => state.master.user
export const selectStats = (state) => state.master.stats
export const selectHighlights = (state) => state.master.highlights
export const selectMasterLoading = (state) => state.master.loading
export const selectMasterError = (state) => state.master.error
export const selectLoadingStartTime = (state) => state.master.loadingStartTime
export const selectShowSlowLoading = (state) => state.master.showSlowLoading

// Export reducer
export default masterSlice.reducer