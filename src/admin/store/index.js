import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import skillsReducer from './skillsSlice'
import categoriesReducer from './categoriesSlice'
import experiencesReducer from './experiencesSlice'
import educationReducer from './educationSlice'

// Separate admin store - completely isolated from main web store
export const adminStore = configureStore({
  reducer: {
    adminAuth: authReducer, // Prefixed to avoid conflicts
    skills: skillsReducer,
    categories: categoriesReducer,
    experiences: experiencesReducer,
    education: educationReducer,
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