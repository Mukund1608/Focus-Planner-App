import { Component, ErrorInfo, ReactNode } from 'react'
import './ErrorBoundary.css'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    
    // Only log to console in development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.error('Error details:', errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">🚀</div>
            <h1 className="text-display text-primary">Oops! Something went wrong</h1>
            <p className="text-body-lg text-secondary">
              Don't worry, even rockets have technical difficulties sometimes!
            </p>
            <div className="error-actions">
              <button
                className="btn-primary"
                onClick={() => window.location.reload()}
              >
                Reload Mission Control
              </button>
              <button
                className="btn-secondary"
                onClick={() => this.setState({ hasError: false })}
              >
                Try Again
              </button>
            </div>
            {typeof window !== 'undefined' && window.location.hostname === 'localhost' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre className="error-stack">
                  {this.state.error.stack}
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
