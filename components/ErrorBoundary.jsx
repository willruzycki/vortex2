import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you would send this to an error reporting service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = async (error, errorInfo) => {
    try {
      // This would typically send to an error monitoring service like Sentry
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getUserId(),
        errorId: this.state.errorId
      };

      // For now, just log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Error Report:', errorReport);
      }

      // In production, send to error tracking service:
      // await fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorReport) });
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  getUserId = () => {
    // Get user ID from localStorage or context if available
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData).id : 'anonymous';
    } catch {
      return 'anonymous';
    }
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h2>
            
            <p className="text-gray-600 mb-6">
              We're sorry for the inconvenience. An unexpected error occurred while loading this part of the application.
            </p>

            {isDevelopment && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                <h3 className="font-semibold text-red-800 mb-2">Error Details (Development Mode):</h3>
                <pre className="text-xs text-red-700 overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-red-800 font-medium cursor-pointer">Component Stack</summary>
                    <pre className="text-xs text-red-600 mt-1 overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="text-xs text-gray-400 mb-6">
              Error ID: {this.state.errorId}
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleRetry} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={this.handleGoHome} variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              If this problem persists, please contact support with the error ID above.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;