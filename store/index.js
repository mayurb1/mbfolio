import { configureStore } from '@reduxjs/toolkit'
import masterReducer from './masterSlice'

// Factory so each request/client can get its own store instance preloaded with
// server-fetched master data (SSR hydration).
export const makeStore = (preloadedState) =>
  configureStore({
    reducer: {
      master: masterReducer,
    },
    preloadedState,
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

// Singleton kept for any non-SSR usage / devtools.
export const webStore = makeStore()

export default webStore
