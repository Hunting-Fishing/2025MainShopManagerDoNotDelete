
import React, { Component, ErrorInfo, ReactNode, Suspense } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Safe wrapper for notification components to prevent React errors from propagating
 */
export class SafeNotificationWrapper extends Component<Props, State> {
  private mounted = false;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('SafeNotificationWrapper caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Notification component error in ${this.props.componentName || 'unknown'}:`, error);
    console.error('Error info:', errorInfo);
    
    // Only update state if component is still mounted
    if (this.mounted) {
      this.setState({ error, errorInfo });
    }
  }

  handleReset = () => {
    if (this.mounted) {
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground bg-yellow-50 rounded-md border border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span>Notification component unavailable</span>
          <button 
            onClick={this.handleReset}
            className="ml-auto text-xs text-yellow-600 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <Suspense fallback={<div className="animate-pulse bg-gray-100 h-8 w-8 rounded" />}>
        {this.props.children}
      </Suspense>
    );
  }
}
