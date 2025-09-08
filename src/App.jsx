import { Suspense, lazy, useEffect, useState, useCallback } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { AnimatePresence } from 'framer-motion'

// Core components - loaded immediately
import Header from './web/layout/Header'
import Footer from './web/layout/Footer'
import LoadingSpinner from './web/ui/LoadingSpinner'
import ScrollToTop from './web/ui/ScrollToTop'
import ThemeToggle from './web/ui/ThemeToggle'

// Lazy-loaded components for code splitting
const Hero = lazy(() => import('./web/sections/Hero'))
const About = lazy(() => import('./web/sections/About'))
const Skills = lazy(() => import('./web/sections/Skills'))
const Experience = lazy(() => import('./web/sections/Experience'))
const Projects = lazy(() => import('./web/sections/Projects'))
// const Blog = lazy(() => import('./web/sections/Blog'))

// const Testimonials = lazy(() => import('./web/sections/Testimonials'))
const Contact = lazy(() => import('./web/sections/Contact'))
const BlogPost = lazy(() => import('./web/blog/BlogPost'))
const NotFound = lazy(() => import('./web/pages/NotFound'))

// Admin app (lazy-loaded)
const AdminApp = lazy(() => import('./admin/AdminApp'))

function App() {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)

  // Check if current path is admin route
  const isAdminRoute = location.pathname.startsWith('/admin')

  // Performance monitoring
  useEffect(() => {
    // Report Web Vitals for performance monitoring
    if (typeof window !== 'undefined' && window.gtag) {
      // Track Core Web Vitals
      const sendToGoogleAnalytics = ({ name, delta, id }) => {
        window.gtag('event', name, {
          event_category: 'Web Vitals',
          value: Math.round(name === 'CLS' ? delta * 1000 : delta),
          event_label: id,
          non_interaction: true,
        })
      }

      // Dynamically import web-vitals for better code splitting
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(sendToGoogleAnalytics)
        getFID(sendToGoogleAnalytics)
        getFCP(sendToGoogleAnalytics)
        getLCP(sendToGoogleAnalytics)
        getTTFB(sendToGoogleAnalytics)
      }).catch(() => {
        // Silently fail if web-vitals is not available
      })
    }
  }, [])

  // Simulate initial loading time (only for non-admin routes) - Reduced for better UX
  useEffect(() => {
    if (!isAdminRoute) {
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 500) // Reduced from 1000ms to 500ms

      return () => clearTimeout(timer)
    } else {
      setIsLoading(false)
    }
  }, [isAdminRoute])

  // Update page title based on route
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/') return 'Mayur Bhalgama - Software Engineer Portfolio'
    if (path.startsWith('/blog/')) return 'Blog Post - Mayur Bhalgama Portfolio'
    if (path.startsWith('/admin')) return 'Admin Panel - Portfolio'
    return `${path.slice(1).charAt(0).toUpperCase() + path.slice(2)} - Mayur Bhalgama Portfolio`
  }

  // Handle loading state for non-admin routes
  if (isLoading && !isAdminRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  // Render admin app for admin routes
  if (isAdminRoute) {
    return (
      <>
        <Helmet>
          <title>{getPageTitle()}</title>
        </Helmet>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner size="large" />
            </div>
          }
        >
          <AdminApp />
        </Suspense>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
      </Helmet>

      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="skip-to-content"
        aria-label="Skip to main content"
      >
        Skip to content
      </a>

      <div className="min-h-screen bg-background text-text">
        {/* Fixed header */}
        <Header />

        {/* Main content */}
        <main id="main-content" role="main">
          <AnimatePresence mode="wait">
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <LoadingSpinner size="large" />
                </div>
              }
            >
              <Routes location={location} key={location.pathname}>
                {/* Single page application - all sections on one page */}
                <Route
                  path="/"
                  element={
                    <>
                      <Hero />
                      <About />
                      <Skills />
                      <Experience />
                      <Projects />
                      {/* <Blog /> */}

                      {/* <Testimonials /> */}
                      <Contact />
                    </>
                  }
                />

                {/* Individual blog post pages */}
                <Route path="/blog/:slug" element={<BlogPost />} />

                {/* 404 page */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </main>

        {/* Fixed footer */}
        <Footer />

        {/* Floating UI elements */}
        <div className="fixed bottom-6 right-6 z-50 space-y-3 no-print">
          <ThemeToggle />
          <ScrollToTop />
        </div>
      </div>
    </>
  )
}

export default App
