import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true }
  }

  componentDidCatch(_error, errorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md mx-auto text-center p-8">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold text-text mb-4">
              Something went wrong
            </h2>
            <p className="text-text-secondary mb-6">
              We&apos;re sorry, but something unexpected happened. Please try
              refreshing the page or contact us if the problem persists.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-primary text-background px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors duration-200"
            >
              Try Again
            </button>
            {typeof window !== 'undefined' && import.meta.env?.DEV && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-text-secondary">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-surface rounded text-xs overflow-auto">
                  {this.state.error?.toString()}
                </pre>
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
