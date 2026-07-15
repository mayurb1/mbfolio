import { ThemeProvider } from '@/contexts/ThemeContext'
import ErrorBoundary from '@/web/components/ErrorBoundary'
import ThemeToggle from '@/web/ui/ThemeToggle'
import ScrollToTop from '@/web/ui/ScrollToTop'
import WebVitals from '@/components/WebVitals'

// Global chrome shared by every public route (root redirect, /profile/[username],
// blog). The Redux store + Header/Footer live in PortfolioShell at the page
// level instead, because per-user master data depends on the [username] route
// param, which a layout cannot read.
export default function WebLayout({ children }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <WebVitals />
        <a href="#main-content" className="skip-to-content" aria-label="Skip to main content">
          Skip to content
        </a>
        <div className="min-h-screen bg-background text-text">
          {children}
          <div className="fixed bottom-6 right-6 z-50 space-y-3 no-print">
            <ThemeToggle />
            <ScrollToTop />
          </div>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
