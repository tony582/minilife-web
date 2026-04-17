import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initErrorReporter, reportError } from './utils/errorReporter'

// Initialize global error monitoring
initErrorReporter();

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error:", error, errorInfo);
    // Report to monitoring backend
    reportError(error?.message || 'React crash', error?.stack, {
      type: 'react_error_boundary',
      componentStack: errorInfo?.componentStack?.substring(0, 500),
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: '#fee', color: '#900', height: '100vh' }}>
          <h1>Global React Crash</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre style={{ fontSize: '10px' }}>{this.state.errorInfo?.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
