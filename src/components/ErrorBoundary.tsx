import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error('SchemeDB Uncaught Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (typeof window !== 'undefined') {
      window.location.search = '';
    }
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          style={{
            minHeight: '100dvh',
            backgroundColor: '#060911',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              backgroundColor: '#0b1120',
              border: '1px solid #dc2626',
              borderRadius: '12px',
              padding: 'clamp(20px, 4vw, 36px)',
              maxWidth: '640px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(220, 38, 38, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Header Badge & Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(220, 38, 38, 0.15)',
                    color: '#ef4444',
                    border: '1px solid rgba(220, 38, 38, 0.35)',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  SIGNAL DISRUPTED
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Film Room Diagnostics</span>
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.45rem',
                  fontWeight: 900,
                  color: '#f8fafc',
                  letterSpacing: '-0.02em',
                }}
              >
                An Unexpected Playback Fault Occurred
              </h1>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
                The workstation encountered an unhandled rendering error. Your local telemetry and play state
                can be safely reset to the default Shanahan Wide Zone foundation.
              </p>
            </div>

            {/* Diagnostic Message */}
            {this.state.error && (
              <div
                style={{
                  backgroundColor: '#060a12',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: '#ef4444',
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: 'uppercase',
                  }}
                >
                  Exception Details
                </span>
                <pre
                  style={{
                    margin: 0,
                    fontSize: '0.78rem',
                    color: '#e2e8f0',
                    fontFamily: "'JetBrains Mono', monospace",
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error.message || String(this.state.error)}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  flex: 1,
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                  minWidth: '160px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0369a1')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')}
              >
                ↺ Reset to Base Playbook
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#1e293b',
                  color: '#cbd5e1',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
              >
                Reload Workstation
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
