'use client'

import { LazyMotion } from 'framer-motion'

// Load the full DOM animation feature set (domMax — required for the shared
// layout / layoutId animation in the header) asynchronously, so ~30 KB of
// framer-motion features stay OUT of the initial JS bundle and stream in after
// first paint. Components must use the lightweight `m` proxy instead of
// `motion` to benefit from this code-splitting.
const loadFeatures = () => import('framer-motion').then(mod => mod.domMax)

export default function LazyMotionProvider({ children }) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>
}
