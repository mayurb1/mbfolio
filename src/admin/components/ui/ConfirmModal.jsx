import { AlertTriangle } from 'lucide-react'
import Button from './Button'
import Modal from './Modal'

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger', 'warning', 'info'
  loading = false
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'text-red-600 dark:text-red-400',
          iconBg: 'bg-red-100 dark:bg-red-900/20',
          confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        }
      case 'warning':
        return {
          icon: 'text-yellow-600 dark:text-yellow-400',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        }
      case 'info':
        return {
          icon: 'text-blue-600 dark:text-blue-400',
          iconBg: 'bg-blue-100 dark:bg-blue-900/20',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }
      default:
        return {
          icon: 'text-red-600 dark:text-red-400',
          iconBg: 'bg-red-100 dark:bg-red-900/20',
          confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        }
    }
  }

  const styles = getVariantStyles()

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xs" showCloseButton={false}>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mx-auto sm:mx-0 ${styles.iconBg}`}>
            <AlertTriangle className={`w-6 h-6 sm:w-5 sm:h-5 ${styles.icon}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h3 className="text-lg sm:text-base font-semibold text-slate-900 dark:text-white mb-2 sm:mb-1">
              {title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 sm:mb-4">
              {message}
            </p>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-center sm:justify-end space-y-reverse space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={`w-full sm:w-auto px-4 py-2.5 sm:py-2 text-sm font-medium text-white rounded-md focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation ${styles.confirmBtn}`}
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-3 sm:w-3 border-b-2 border-white mr-2 inline-block"></div>
                )}
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmModal