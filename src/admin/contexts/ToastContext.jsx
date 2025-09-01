import { createContext, useContext, useState, useCallback, useRef } from 'react'
import Toast from '../../web/ui/Toast'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const toastTimeouts = useRef(new Map())
  const recentToasts = useRef(new Map()) // For rate limiting

  const showToast = useCallback(toast => {
    const id = Date.now() + Math.random()
    
    // Rate limiting: check for duplicate messages within 1 second
    const messageKey = `${toast.title || ''}-${toast.description || ''}-${toast.variant || 'info'}`
    const now = Date.now()
    
    if (recentToasts.current.has(messageKey)) {
      const lastShown = recentToasts.current.get(messageKey)
      if (now - lastShown < 1000) { // 1 second cooldown
        return // Ignore duplicate toast
      }
    }
    
    recentToasts.current.set(messageKey, now)
    
    // Clean up old rate limiting entries (older than 5 seconds)
    setTimeout(() => {
      recentToasts.current.delete(messageKey)
    }, 5000)

    const newToast = {
      id,
      open: true,
      duration: 4000,
      persistent: false,
      ...toast,
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove after duration (unless persistent)
    if (!newToast.persistent) {
      const timeoutId = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
        toastTimeouts.current.delete(id)
      }, newToast.duration)
      
      toastTimeouts.current.set(id, timeoutId)
    }
  }, [])

  const showSuccess = useCallback(
    (title, description) => {
      showToast({
        variant: 'success',
        title,
        description,
      })
    },
    [showToast]
  )

  const showError = useCallback(
    (title, description) => {
      showToast({
        variant: 'error',
        title,
        description,
      })
    },
    [showToast]
  )

  const showInfo = useCallback(
    (title, description) => {
      showToast({
        variant: 'info',
        title,
        description,
      })
    },
    [showToast]
  )

  const removeToast = useCallback(id => {
    // Clear timeout if exists
    if (toastTimeouts.current.has(id)) {
      clearTimeout(toastTimeouts.current.get(id))
      toastTimeouts.current.delete(id)
    }
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Status code based toast handler
  const showToastByStatus = useCallback(
    (status, message, title = null, options = {}) => {
      let variant = 'info'
      let defaultTitle = 'Notification'
      let persistent = false

      if (status >= 200 && status < 300) {
        // Success status codes (200-299)
        variant = 'success'
        defaultTitle = 'Success'
      } else if (status >= 400 && status < 500) {
        // Client error status codes (400-499)
        variant = 'error'
        defaultTitle = 'Error'
        // Make 4xx errors persistent for better user attention
        persistent = status === 401 || status === 403 || status === 422
      } else if (status >= 500) {
        // Server error status codes (500+)
        variant = 'error'
        defaultTitle = 'Server Error'
        persistent = true // Critical server errors should be persistent
      } else if (status >= 300 && status < 400) {
        // Redirect status codes (300-399) - rare but handle as info
        variant = 'info'
        defaultTitle = 'Redirect'
      }

      showToast({
        variant,
        title: title || defaultTitle,
        description: message,
        persistent,
        ...options,
      })
    },
    [showToast]
  )

  // Convenience function to handle API responses directly
  const handleApiResponse = useCallback(
    response => {
      const { status, message, data } = response
      const responseMessage = message || data?.message || 'Operation completed'
      console.log(status, message, data, 'responseMessage')
      showToastByStatus(status, responseMessage)
    },
    [showToastByStatus]
  )

  // Convenience function to handle API errors
  const handleApiError = useCallback(
    error => {
      let status = 500
      let message = 'An unexpected error occurred'

      if (error?.response) {
        status = error.response.status
        message =
          error.response.data?.message || error.response.statusText || message
      } else if (error?.message) {
        message = error.message
      }

      showToastByStatus(status, message)
    },
    [showToastByStatus]
  )

  const value = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    removeToast,
    showToastByStatus,
    handleApiResponse,
    handleApiError,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Render toasts with stacking */}
      <div className="fixed z-[1000] left-1/2 -translate-x-1/2 bottom-6 sm:bottom-8 sm:left-auto sm:right-6 sm:translate-x-0 pointer-events-none">
        <div className="flex flex-col-reverse gap-3 items-center sm:items-end">
          {toasts.map((toast, index) => (
            <Toast
              key={toast.id}
              open={toast.open}
              title={toast.title}
              description={toast.description}
              variant={toast.variant}
              duration={toast.duration}
              persistent={toast.persistent}
              index={index}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
