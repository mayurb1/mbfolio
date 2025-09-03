import { X } from 'lucide-react'

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true 
}) => {
  if (!isOpen) return null

  const sizes = {
    xs: 'max-w-sm',
    sm: 'max-w-md', 
    small: 'max-w-md',
    medium: 'max-w-2xl',
    large: 'max-w-4xl',
    xl: 'max-w-6xl'
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Mobile-first responsive container */}
      <div className="flex items-center justify-center min-h-full px-2 py-4 sm:px-4 sm:py-6">
        {/* Modal */}
        <div className={`relative inline-block w-full ${sizes[size]} bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-slate-200 dark:border-slate-600 z-10 max-h-[90vh] sm:max-h-[85vh] overflow-hidden`}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 sm:p-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              {title && (
                <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white pr-2">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors touch-manipulation"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)] sm:max-h-[calc(85vh-80px)]">
            <div className="p-4 sm:p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal