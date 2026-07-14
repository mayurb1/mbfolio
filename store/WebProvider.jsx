'use client'

import { useState } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from './index'
import { buildMasterState } from './masterSlice'

// Creates a per-instance store preloaded with server-fetched master data so the
// public site renders with real content (SSR) and the client hydrates without a
// refetch flash.
const WebProvider = ({ children, initialData }) => {
  const [store] = useState(() => {
    const preloaded = initialData
      ? { master: buildMasterState(initialData) }
      : undefined
    return makeStore(preloaded)
  })

  return <Provider store={store}>{children}</Provider>
}

export default WebProvider
