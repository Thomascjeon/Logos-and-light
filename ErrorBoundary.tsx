/**
 * ErrorBoundary.tsx
 * A reusable React error boundary that catches rendering errors and shows a user-friendly fallback.
 * Provides a quick action to reload the application.
 */

import React from 'react'

/**
 * ErrorBoundaryProps
 * Accepts children to render and an optional custom fallback renderer.
 */
export interface ErrorBoundaryProps {
  children: React.ReactNode
  /**
   * Optional fallback UI renderer receiving the error.
   */
  fallback?: (error: Error) => React.ReactNode
}

/**
 * ErrorBoundaryState
 * Tracks error presence and the error object.
 */
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

/**
 * ErrorBoundary
 * Catches errors in descendant components and renders a stable fallback UI.
 */
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  /**
   * Lifecycle hook to update state when an error occurs.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  /**
   * Optional side effect to log the error (extend with your logging infra if needed).
   */
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, info)
  }

  /**
   * Reset handler to attempt recovery.
   */
  private handleReload = () => {
    // Force a full reload to reset app state.
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state
      if (this.props.fallback) return this.props.fallback(error as Error)
      return (
        <div className="min-h-[40vh] mx-auto max-w-2xl p-6 text-center flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The page failed to load. Try reloading the site.
          </p>
          <button
            onClick={this.handleReload}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
            aria-label="Reload the page"
          >
            Reload
          </button>
          {error ? (
            <pre className="mt-4 max-w-full overflow-auto rounded bg-muted p-3 text-left text-xs text-muted-foreground">
              {String(error?.message || error)}
            </pre>
          ) : null}
        </div>
      )
    }
    return this.props.children
  }
}
