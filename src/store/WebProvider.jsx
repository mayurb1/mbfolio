import React from 'react'
import { Provider } from 'react-redux'
import webStore from './index'

const WebProvider = ({ children }) => {
  return (
    <Provider store={webStore}>
      {children}
    </Provider>
  )
}

export default WebProvider