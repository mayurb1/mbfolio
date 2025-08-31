import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FolderOpen, 
  Mail, 
  Image, 
  Settings,
  Zap,
  Layers,
  X
} from 'lucide-react'

const Sidebar = ({ isOpen = true, onClose }) => {
  const menuItems = [
    { 
      name: 'Dashboard', 
      path: '/admin/dashboard', 
      icon: LayoutDashboard,
      description: 'Overview & stats'
    },
    { 
      name: 'Projects', 
      path: '/admin/projects', 
      icon: FolderOpen,
      description: 'Manage projects'
    },
    { 
      name: 'Skills', 
      path: '/admin/skills', 
      icon: Zap,
      description: 'Manage skills'
    },
    { 
      name: 'Categories', 
      path: '/admin/categories', 
      icon: Layers,
      description: 'Manage categories'
    },
    { 
      name: 'Contact Forms', 
      path: '/admin/contact', 
      icon: Mail,
      description: 'View submissions'
    },
    { 
      name: 'Media', 
      path: '/admin/media', 
      icon: Image,
      description: 'File management'
    },
    { 
      name: 'Settings', 
      path: '/admin/settings', 
      icon: Settings,
      description: 'Account & preferences'
    }
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 w-64 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50
        transform transition-transform duration-300 ease-in-out flex flex-col
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Admin Panel
              </h2>
            </div>
          </div>
          
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 px-3 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 group ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-r-2 border-blue-600'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                    onClick={() => {
                      // Close mobile sidebar on navigation
                      if (window.innerWidth < 1024) {
                        onClose()
                      }
                    }}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                        {item.description}
                      </div>
                    </div>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Portfolio Admin v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar