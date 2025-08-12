import { useEffect } from 'react'

const variantClasses = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-slate-800 text-white',
}

const positionClasses =
  'fixed z-[1000] left-1/2 -translate-x-1/2 bottom-6 sm:bottom-8 sm:left-auto sm:right-6 sm:translate-x-0'

const Toast = ({
  open,
  onClose,
  title,
  description,
  variant = 'info',
  duration = 4000,
}) => {
  useEffect(() => {
    if (!open) return
    const id = setTimeout(() => onClose?.(), duration)
    return () => clearTimeout(id)
  }, [open, duration, onClose])

  if (!open) return null

  return (
    <div role="status" aria-live="assertive" className={`${positionClasses}`}>
      <div
        className={`shadow-lg rounded-lg px-4 py-3 min-w-[240px] max-w-[92vw] sm:max-w-sm ${variantClasses[variant]}`}
      >
        {title && <div className="font-semibold text-sm">{title}</div>}
        {description && (
          <div className="text-sm/relaxed opacity-90 mt-0.5">{description}</div>
        )}
        <button
          onClick={onClose}
          aria-label="Close notification"
          className="absolute top-1.5 right-2 text-white/80 hover:text-white text-sm"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default Toast
