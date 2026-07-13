'use client'

import { useReportWebVitals } from 'next/web-vitals'

// Reports Core Web Vitals to Google Analytics (replaces the manual web-vitals
// wiring that lived in the old App.jsx).
export default function WebVitals() {
  useReportWebVitals((metric) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(
          metric.name === 'CLS' ? metric.value * 1000 : metric.value
        ),
        event_label: metric.id,
        non_interaction: true,
      })
    }
  })

  return null
}
