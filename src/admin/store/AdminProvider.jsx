import { Provider } from 'react-redux'
import { adminStore } from './index'

// Separate provider for admin store to ensure complete isolation
const AdminProvider = ({ children }) => {
  return (
    <Provider store={adminStore}>
      {children}
    </Provider>
  )
}

export default AdminProvider