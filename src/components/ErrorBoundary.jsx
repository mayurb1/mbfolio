import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Send error to analytics if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">🚧</div>
              <h1 className="text-2xl font-bold text-text mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-text-secondary mb-6">
                We encountered an unexpected error. Don't worry, it's not you - it's us!
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={this.handleReset}
                className="w-full bg-primary text-background py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full border border-border text-text py-3 px-6 rounded-lg font-medium hover:bg-surface transition-colors"
              >
                Refresh Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left bg-surface border border-border rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-text mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="text-sm text-text-secondary space-y-2">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 whitespace-pre-wrap break-all bg-background p-2 rounded text-xs">
                      {this.state.error && this.state.error.toString()}
                    </pre>
                  </div>
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap break-all bg-background p-2 rounded text-xs">
                      {this.state.errorInfo.componentStack}
                    </pre>
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