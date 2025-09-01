import { useEffect, useState } from 'react'

const variantClasses = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',  
  info: 'bg-slate-800 text-white',
}

const Toast = ({
  open,
  onClose,
  title,
  description,
  variant = 'info',
  duration = 4000,
  persistent = false,
  index = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (open && !isVisible) {
      // Trigger entrance animation
      setIsVisible(true)
    }
  }, [open, isVisible])

  useEffect(() => {
    if (!open || persistent) return
    
    const id = setTimeout(() => {
      handleClose()
    }, duration)
    
    return () => clearTimeout(id)
  }, [open, duration, persistent])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose?.()
    }, 200) // Match exit animation duration
  }

  if (!open) return null

  return (
    <div 
      role="status" 
      aria-live="assertive"
      className={`
        pointer-events-auto
        transition-all duration-200 ease-out
        ${isVisible && !isExiting 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-2 scale-95'
        }
        ${index > 0 ? 'mb-1' : ''}
      `}
      style={{
        transitionDelay: isVisible ? `${index * 50}ms` : '0ms'
      }}
    >
      <div
        className={`
          relative shadow-lg rounded-lg px-4 py-3 pr-8
          min-w-[240px] max-w-[92vw] sm:max-w-sm
          transform transition-all duration-200 ease-out
          hover:scale-105 hover:shadow-xl
          ${variantClasses[variant]}
          ${persistent ? 'border-2 border-white/30' : ''}
        `}
      >
        {title && (
          <div className="font-semibold text-sm flex items-center gap-2">
            {title}
            {persistent && (
              <span className="text-xs opacity-75 bg-white/20 px-1.5 py-0.5 rounded-full">
                Action Required
              </span>
            )}
          </div>
        )}
        {description && (
          <div className="text-sm/relaxed opacity-90 mt-0.5">{description}</div>
        )}
        <button
          onClick={handleClose}
          aria-label="Close notification"
          className={`
            absolute top-1.5 right-2 text-white/80 hover:text-white 
            text-lg leading-none transition-all duration-150
            hover:scale-110 hover:bg-white/20 rounded-full
            w-5 h-5 flex items-center justify-center
            ${persistent ? 'bg-white/10' : ''}
          `}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default Toast
