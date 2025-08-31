import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'

// Separate admin store - completely isolated from main web store
export const adminStore = configureStore({
  reducer: {
    adminAuth: authReducer, // Prefixed to avoid conflicts
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  // Ensure admin store is completely separate
  devTools: process.env.NODE_ENV !== 'production' && {
    name: 'Admin Store', // Different name in Redux DevTools
  },
})

export default adminStore