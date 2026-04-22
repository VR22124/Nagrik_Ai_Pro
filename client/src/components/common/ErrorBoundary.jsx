import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Only log in development to avoid leaking stack traces in production
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center p-6">
          <div className="glass-card max-w-md w-full p-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Something went wrong.</h1>
            <p className="text-slate-600 mb-6">
              We encountered an unexpected error while loading this component. Please try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
