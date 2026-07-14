import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import skillsReducer from './skillsSlice'
import categoriesReducer from './categoriesSlice'
import experiencesReducer from './experiencesSlice'
import educationReducer from './educationSlice'
import projectsReducer from './projectSlice'

// Factory for a fresh, isolated admin store. Under Next.js the app is rendered
// once on the server per request, so a module-level singleton would bleed state
// across requests — AdminProvider creates one instance per client mount instead.
export const makeAdminStore = () =>
  configureStore({
    reducer: {
      adminAuth: authReducer, // Prefixed to avoid conflicts with the web store
      skills: skillsReducer,
      categories: categoriesReducer,
      experiences: experiencesReducer,
      education: educationReducer,
      projects: projectsReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST'],
        },
      }),
    devTools: process.env.NODE_ENV !== 'production' && {
      name: 'Admin Store', // Different name in Redux DevTools
    },
  })

export default makeAdminStore
