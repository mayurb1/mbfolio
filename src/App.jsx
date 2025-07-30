import { Suspense, lazy, useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { AnimatePresence } from 'framer-motion'

// Core components - loaded immediately
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import LoadingSpinner from './components/ui/LoadingSpinner'
import ScrollToTop from './components/ui/ScrollToTop'
import ThemeToggle from './components/ui/ThemeToggle'

// Lazy-loaded components for code splitting
const Hero = lazy(() => import('./components/sections/Hero'))
const About = lazy(() => import('./components/sections/About'))
const Skills = lazy(() => import('./components/sections/Skills'))
const Experience = lazy(() => import('./components/sections/Experience'))
const Projects = lazy(() => import('./components/sections/Projects'))
const Blog = lazy(() => import('./components/sections/Blog'))

const Testimonials = lazy(() => import('./components/sections/Testimonials'))
const Contact = lazy(() => import('./components/sections/Contact'))
const BlogPost = lazy(() => import('./components/blog/BlogPost'))
const NotFound = lazy(() => import('./components/pages/NotFound'))

function App() {
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(true)

  // Simulate initial loading time
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Update page title based on route
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/') return 'Mayur Bhalgama - Software Engineer Portfolio'
    if (path.startsWith('/blog/')) return 'Blog Post - Mayur Bhalgama Portfolio'
    return `${path.slice(1).charAt(0).toUpperCase() + path.slice(2)} - Mayur Bhalgama Portfolio`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="large" />
      </div>
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
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
              </div>
            }>
              <Routes location={location} key={location.pathname}>
                {/* Single page application - all sections on one page */}
                <Route path="/" element={
                  <>
                    <Hero />
                    <About />
                    <Skills />
                    <Experience />
                    <Projects />
                    <Blog />
        
                    <Testimonials />
                    <Contact />
                  </>
                } />
                
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