import { motion } from 'framer-motion'

const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        ease: 'linear',
        repeat: Infinity
      }
    }
  }

  const circleVariants = {
    animate: {
      strokeDasharray: ['0 100', '25 100', '50 100', '75 100', '100 100'],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity
      }
    }
  }

  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <motion.div
        className={`${sizeClasses[size]} relative`}
        variants={spinnerVariants}
        animate="animate"
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 50 50"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.circle
            className="stroke-primary"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            variants={circleVariants}
            animate="animate"
            style={{ strokeDasharray: '0 100' }}
          />
        </svg>
      </motion.div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Alternative dot loading animation
export const DotLoader = ({ className = '' }) => {
  const dotVariants = {
    animate: {
      scale: [1, 1.5, 1],
      opacity: [0.3, 1, 0.3],
      transition: {
        duration: 1,
        ease: 'easeInOut',
        repeat: Infinity
      }
    }
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`} role="status" aria-label="Loading">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-primary rounded-full"
          variants={dotVariants}
          animate="animate"
          style={{
            animationDelay: `${index * 0.2}s`
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Skeleton loader for content
export const SkeletonLoader = ({ 
  lines = 3, 
  className = '',
  animate = true 
}) => {
  const skeletonVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        ease: 'easeInOut',
        repeat: Infinity
      }
    }
  }

  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="Loading content">
      {Array.from({ length: lines }, (_, index) => (
        <motion.div
          key={index}
          className="skeleton h-4 bg-surface rounded"
          style={{
            width: `${Math.random() * 40 + 60}%`
          }}
          variants={animate ? skeletonVariants : {}}
          animate={animate ? 'animate' : ''}
        />
      ))}
      <span className="sr-only">Loading content...</span>
    </div>
  )
}

// Progress bar loader
export const ProgressLoader = ({ 
  progress = 0, 
  className = '',
  showPercentage = false 
}) => {
  return (
    <div className={`w-full ${className}`} role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-text-secondary">Loading...</span>
        {showPercentage && (
          <span className="text-sm text-text-secondary">{Math.round(progress)}%</span>
        )}
      </div>
      <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default LoadingSpinner