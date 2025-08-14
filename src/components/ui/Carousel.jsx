import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const Carousel = ({ images = [], altPrefix = 'Slide' }) => {
  const safeImages = (images || []).filter(Boolean)
  const [current, setCurrent] = useState(0)

  const goPrev = useCallback(() => {
    setCurrent(i => (i - 1 + safeImages.length) % safeImages.length)
  }, [safeImages.length])

  const goNext = useCallback(() => {
    setCurrent(i => (i + 1) % safeImages.length)
  }, [safeImages.length])

  if (!safeImages.length) return null

  return (
    <div className="relative w-full">
      <div
        className="relative w-full h-56 sm:h-64 md:h-72 lg:h-80 overflow-hidden rounded-lg border border-border bg-surface"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'ArrowLeft') goPrev()
          if (e.key === 'ArrowRight') goNext()
        }}
        aria-roledescription="carousel"
        aria-label="Project media"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={safeImages[current]}
            src={safeImages[current]}
            alt={`${altPrefix} ${current + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0.2, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            onError={e => {
              e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                <svg width='800' height='450' xmlns='http://www.w3.org/2000/svg'>
                  <rect width='100%' height='100%' fill='#e2e8f0'/>
                  <text x='50%' y='50%' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='16' fill='#64748b'>Image ${current + 1}</text>
                </svg>
              `)}`
            }}
          />
        </AnimatePresence>

        {/* Controls */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/70 hover:bg-background border border-border text-text shadow-sm"
              onClick={goPrev}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/70 hover:bg-background border border-border text-text shadow-sm"
              onClick={goNext}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* Indicators */}
      {safeImages.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {safeImages.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full border ${
                i === current
                  ? 'bg-primary border-primary'
                  : 'bg-surface border-border'
              }`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Carousel
