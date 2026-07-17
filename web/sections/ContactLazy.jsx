'use client'

import dynamic from 'next/dynamic'
import { useInView } from 'react-intersection-observer'

// The Contact form pulls in formik + yup (~79 KB of the initial bundle) but is
// the last section on the page, below the fold. Defer the whole thing: it is
// code-split (ssr:false) and only mounted once the user scrolls within
// `rootMargin` of it, so formik/yup never touch the critical path. A skeleton
// of matching height reserves layout space to avoid CLS and keeps the
// `#contact` anchor present for header navigation even before the form loads.
const Contact = dynamic(() => import('./Contact'), { ssr: false })

const ContactSkeleton = () => (
  <section className="py-24 lg:py-40 bg-background">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="mx-auto mb-4 h-9 w-48 animate-pulse rounded bg-surface" />
          <div className="mx-auto h-5 w-72 max-w-full animate-pulse rounded bg-surface" />
        </div>
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-surface" />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-lg bg-surface" />
        </div>
      </div>
    </div>
  </section>
)

export default function ContactLazy() {
  // Start loading ~600px before the section enters the viewport so the form is
  // ready by the time it is reached; only load once.
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '600px 0px',
  })

  return (
    <div id="contact" ref={ref} className="min-h-[600px]">
      {inView ? <Contact /> : <ContactSkeleton />}
    </div>
  )
}
