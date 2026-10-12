import { Component } from 'react';

// Catches render-time crashes so the user sees an error
// message instead of a blank white screen.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('React render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          maxWidth: 560,
          margin: '80px auto',
          padding: 24,
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}>
          <h1 style={{ color: '#dc2626' }}>Something went wrong</h1>
          <p style={{ color: '#6b7280' }}>
            The page crashed while rendering. See the browser console (F12) for details.
          </p>
          <pre style={{
            background: '#fef2f2',
            color: '#991b1b',
            padding: 12,
            borderRadius: 8,
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            fontSize: 13,
          }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              background: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
