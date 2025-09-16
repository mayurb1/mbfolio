import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100

      setScrollProgress(scrollPercent)
      setIsVisible(scrollTop > 300) // Show button after scrolling 300px
    }

    const throttledHandleScroll = throttle(handleScroll, 100)

    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    return () => window.removeEventListener('scroll', throttledHandleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })

    // Analytics tracking
    if (window.gtag) {
      window.gtag('event', 'scroll_to_top', {
        event_category: 'engagement',
        event_label: 'scroll_to_top_button'
      })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      scrollToTop()
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          onKeyDown={handleKeyDown}
          className="relative w-12 h-12 bg-surface border border-border rounded-full flex items-center justify-center text-text hover:bg-primary hover:text-background transition-colors duration-200 shadow-lg group overflow-hidden"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Scroll to top of page"
          title="Back to top"
        >
          {/* Progress ring */}
          <svg
            className="absolute inset-0 w-full h-full transform -rotate-90"
            viewBox="0 0 48 48"
          >
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border"
            />
            <motion.circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-primary"
              style={{
                strokeDasharray: 125.6, // 2 * π * 20
                strokeDashoffset: 125.6 - (scrollProgress / 100) * 125.6,
              }}
              transition={{ duration: 0.1 }}
            />
          </svg>

          {/* Arrow icon */}
          <motion.div
            className="relative z-10"
            whileHover={{ y: -1 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowUp size={18} />
          </motion.div>

          {/* Pulse effect on hover */}
          <motion.div
            className="absolute inset-0 bg-primary rounded-full opacity-0 group-hover:opacity-20"
            initial={false}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

// Utility function for throttling scroll events
function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}


export default ScrollToTop