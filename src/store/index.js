import { configureStore } from '@reduxjs/toolkit'
import masterReducer from './masterSlice'

// Main web store for public website
export const webStore = configureStore({
  reducer: {
    master: masterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production' && {
    name: 'Web Store',
  },
})

export default webStore