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
      <div 
        className="flex items-center justify-center min-h-screen px-4 text-center"
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black opacity-50" />
        
        {/* Modal */}
        <div className={`relative inline-block w-full ${sizes[size]} p-6 my-8 overflow-hidden text-left align-middle bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-slate-200 dark:border-slate-600`}>
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between mb-4">
              {title && (
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="mt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal