
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsLoadingState } from './SettingsLoadingState';
import { SettingsErrorBoundary } from './SettingsErrorBoundary';

interface SettingsFormWrapperProps {
  title: string;
  description?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
}

export const SettingsFormWrapper: React.FC<SettingsFormWrapperProps> = ({
  title,
  description,
  isLoading = false,
  error = null,
  onRetry,
  children
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent>
        <SettingsErrorBoundary error={error} onRetry={onRetry} />
        {isLoading ? (
          <SettingsLoadingState message={`Loading ${title.toLowerCase()}...`} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};
