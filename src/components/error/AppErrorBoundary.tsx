
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            We encountered an unexpected error. Please try refreshing the page or go back to the dashboard.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs bg-muted p-2 rounded">
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">
                {error.message}
                {error.stack && '\n' + error.stack}
              </pre>
            </details>
          )}
          
          <div className="flex gap-2">
            <Button onClick={resetErrorBoundary} className="flex-1" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={handleGoHome} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>
          
          <Button onClick={handleReload} variant="ghost" className="w-full">
            Reload Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('App Error Boundary caught error:', error, errorInfo);
        // In production, send to error reporting service
        if (process.env.NODE_ENV === 'production') {
          // TODO: Send to error monitoring service (Sentry, etc.)
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
