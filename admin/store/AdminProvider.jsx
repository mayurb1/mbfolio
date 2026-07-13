'use client'

import { useState } from 'react'
import { Provider } from 'react-redux'
import { makeAdminStore } from './index'

// Per-instance admin store provider (isolated from the web store). Creates the
// store lazily once per mount so server renders never share state across requests.
const AdminProvider = ({ children }) => {
  const [store] = useState(() => makeAdminStore())

  return <Provider store={store}>{children}</Provider>
}

export default AdminProvider
