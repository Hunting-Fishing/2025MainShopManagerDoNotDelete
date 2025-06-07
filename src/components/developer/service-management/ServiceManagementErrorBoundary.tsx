
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ServiceManagementErrorBoundaryProps {
  children: React.ReactNode;
}

interface ServiceManagementErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ServiceManagementErrorBoundary extends React.Component<
  ServiceManagementErrorBoundaryProps,
  ServiceManagementErrorBoundaryState
> {
  constructor(props: ServiceManagementErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ServiceManagementErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Service Management Error:', error);
    console.error('Error Info:', errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="w-full max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Service Management Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-gray-700 mb-2">
                An error occurred in the service management system:
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <code className="text-sm text-red-800">
                  {this.state.error?.message || 'Unknown error occurred'}
                </code>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={this.handleRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button 
                onClick={() => window.location.href = '/developer'}
                variant="secondary"
              >
                Back to Developer Dashboard
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-600">
                  Technical Details (Dev Mode)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
