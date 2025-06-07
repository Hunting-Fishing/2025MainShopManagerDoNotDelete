
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface SettingsErrorBoundaryProps {
  error: string | null;
  onRetry?: () => void;
  onReset?: () => void;
}

export const SettingsErrorBoundary: React.FC<SettingsErrorBoundaryProps> = ({
  error,
  onRetry,
  onReset
}) => {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex flex-col gap-3">
        <span>{error}</span>
        <div className="flex gap-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
          {onReset && (
            <Button variant="outline" size="sm" onClick={onReset}>
              Reset
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};
