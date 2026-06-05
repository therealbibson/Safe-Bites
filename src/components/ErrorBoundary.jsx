import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console for now — can wire to Sentry later
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-stone-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
            <h2 className="text-xl font-bold text-stone-800">Something went wrong</h2>
            <p className="mt-3 text-sm text-stone-500">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <div className="mt-6">
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-orange-600 text-white rounded-xl font-bold">Reload</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
