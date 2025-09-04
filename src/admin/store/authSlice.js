import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../services/authService'

// Async thunk for registration
export const registerAdmin = createAsyncThunk(
  'adminAuth/registerAdmin',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authService.register(userData)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Async thunk for login
export const loginAdmin = createAsyncThunk(
  'adminAuth/loginAdmin',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      const { token, user } = response.data // Extract from response.data
      
      // Store auth data using service
      authService.storeAuth(token, user)
      
      // Return the complete response so handleApiResponse can access the message
      return { ...response, authData: { token, user } }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Async thunk for logout
export const logoutAdmin = createAsyncThunk(
  'adminAuth/logoutAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.logout()
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Check existing auth from localStorage
export const checkAuth = createAsyncThunk(
  'adminAuth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const storedAuth = authService.getStoredAuth()
      return storedAuth
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Verify token with server
export const verifyToken = createAsyncThunk(
  'adminAuth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.verifyToken()
      return response.data // Extract from response.data
    } catch (error) {
      // Clear invalid auth data
      authService.clearStoredAuth()
      return rejectWithValue(error.message)
    }
  }
)

// Refresh auth token
export const refreshAuthToken = createAsyncThunk(
  'adminAuth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.refreshToken()
      const { token, user } = data
      
      // Update stored auth data
      authService.storeAuth(token, user)
      
      return { token, user }
    } catch (error) {
      // Clear invalid auth data on refresh failure
      authService.clearStoredAuth()
      return rejectWithValue(error.message)
    }
  }
)

// Change password
export const changePassword = createAsyncThunk(
  'adminAuth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const data = await authService.changePassword(passwordData)
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const authSlice = createSlice({
  name: 'adminAuth', // Prefixed to differentiate from web auth
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    authLoading: true, // For authentication checks only
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    resetAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      state.loading = false
      state.authLoading = false
    },
    updateUserData: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    }
  },
  extraReducers: (builder) => {
    builder
      // Registration cases
      .addCase(registerAdmin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        // Don't auto-login after registration, redirect to login
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      // Login cases
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.authData.user
        state.token = action.payload.authData.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
      
      // Logout cases
      .addCase(logoutAdmin.pending, (state) => {
        state.loading = true
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = null
        state.loading = false
      })
      .addCase(logoutAdmin.rejected, (state, action) => {
        // Even if logout fails, clear local state
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.loading = false
        state.error = action.payload
      })
      
      // Check auth cases
      .addCase(checkAuth.pending, (state) => {
        state.authLoading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.authLoading = false
        state.loading = false
        if (action.payload) {
          state.user = action.payload.user
          state.token = action.payload.token
          state.isAuthenticated = true
        } else {
          state.isAuthenticated = false
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.authLoading = false
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
      })
      
      // Verify token cases
      .addCase(verifyToken.pending, (state) => {
        // Don't show loading for token verification
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        // Token is valid, update user data if needed
        if (action.payload.user) {
          state.user = action.payload.user
        }
      })
      .addCase(verifyToken.rejected, (state) => {
        // Token invalid, clear auth state
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
      
      // Refresh token cases
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(refreshAuthToken.rejected, (state) => {
        // Refresh failed, clear auth state
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
      
      // Change password cases
      .addCase(changePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, resetAuth, updateUserData } = authSlice.actions
export default authSlice.reducer