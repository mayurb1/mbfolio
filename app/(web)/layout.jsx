import { getMasterData } from '@/lib/getMasterData'
import WebProvider from '@/store/WebProvider'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ErrorBoundary from '@/web/components/ErrorBoundary'
import Header from '@/web/layout/Header'
import Footer from '@/web/layout/Footer'
import ThemeToggle from '@/web/ui/ThemeToggle'
import ScrollToTop from '@/web/ui/ScrollToTop'
import WebVitals from '@/components/WebVitals'
import LazyMotionProvider from '@/web/components/LazyMotionProvider'

// Public site is statically generated and revalidated every 5 minutes (ISR),
// so master data lands in the initial HTML for SEO while staying fresh.
export const revalidate = 300

export default async function WebLayout({ children }) {
  let initialData = null
  try {
    initialData = await getMasterData()
  } catch {
    initialData = null
  }

  return (
    <ErrorBoundary>
      <WebProvider initialData={initialData}>
        <ThemeProvider>
          <LazyMotionProvider>
            <WebVitals />
            <a href="#main-content" className="skip-to-content" aria-label="Skip to main content">
              Skip to content
            </a>
            <div className="min-h-screen bg-background text-text">
              <Header />
              <main id="main-content" role="main">
                {children}
              </main>
              <Footer />
              <div className="fixed bottom-6 right-6 z-50 space-y-3 no-print">
                <ThemeToggle />
                <ScrollToTop />
              </div>
            </div>
          </LazyMotionProvider>
        </ThemeProvider>
      </WebProvider>
    </ErrorBoundary>
  )
}
