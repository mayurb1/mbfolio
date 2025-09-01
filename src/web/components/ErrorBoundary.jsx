import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-8">
              <svg
                className="mx-auto h-16 w-16 text-red-500 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <h1 className="text-2xl font-bold text-text mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-text-secondary mb-6">
                We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-primary hover:bg-primary/90 text-background px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full border border-border text-text hover:bg-surface px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Go Home
              </button>
            </div>
            
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-text-secondary mb-2">
                  Show Error Details (Development Only)
                </summary>
                <div className="bg-surface border border-border rounded-lg p-4 text-xs font-mono overflow-auto">
                  <div className="text-red-500 mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  <div className="text-text-secondary whitespace-pre-wrap">
                    <strong>Stack Trace:</strong>
                    {this.state.errorInfo.componentStack}
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary