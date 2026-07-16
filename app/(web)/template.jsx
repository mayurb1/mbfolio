'use client'

import { m } from 'framer-motion'

// Re-mounts on navigation to give a subtle fade transition between routes
// (replaces the AnimatePresence wrapper from the old react-router App).
export default function Template({ children }) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </m.div>
  )
}
