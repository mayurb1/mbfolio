import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Server, Coffee } from 'lucide-react'
import { useState, useEffect } from 'react'

const ServerDelayNotice = ({ 
  isVisible = true, 
  onDismiss = null,
  dismissible = true,
  showAfterMs = 0,
  className = '' 
}) => {
  const [shouldShow, setShouldShow] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (!isVisible) {
      setShouldShow(false)
      setIsDismissed(false) // Reset dismissed state when hiding
      return
    }

    if (showAfterMs === 0) {
      setShouldShow(true)
      return
    }

    const timer = setTimeout(() => {
      setShouldShow(true)
    }, showAfterMs)

    return () => clearTimeout(timer)
  }, [isVisible, showAfterMs])

  const handleDismiss = () => {
    setIsDismissed(true)
    if (onDismiss) onDismiss()
  }

  const noticeVariants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  }

  const iconVariants = {
    animate: {
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatDelay: 3
      }
    }
  }

  if (!isVisible || !shouldShow || isDismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        className={`
          fixed top-4 right-4 z-50 max-w-sm bg-gradient-to-r from-blue-50 to-indigo-50 
          dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm 
          border border-blue-200 dark:border-blue-700 rounded-lg shadow-lg p-4
          ${className}
        `}
        variants={noticeVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start space-x-3">
          <motion.div
            className="flex-shrink-0 text-blue-500 dark:text-blue-400 mt-0.5"
            variants={iconVariants}
            animate="animate"
          >
            <Server size={20} />
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Clock size={14} className="text-blue-500 dark:text-blue-400" />
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Server Starting Up
              </h4>
            </div>
            
            <p className="text-xs text-blue-700 dark:text-blue-200 leading-relaxed">
              Using a free server that may take a moment to wake up. 
              Thank you for your patience! <Coffee size={12} className="inline ml-1" />
            </p>
            
            <div className="mt-2 flex items-center space-x-2">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-blue-600 dark:text-blue-300 font-medium">
                Loading...
              </span>
            </div>
          </div>
          
          {dismissible && (
            <button
              onClick={handleDismiss}
              className="
                flex-shrink-0 text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 
                transition-colors duration-200 p-1 rounded-full hover:bg-blue-100 
                dark:hover:bg-blue-800/50
              "
              aria-label="Dismiss notification"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ServerDelayNotice