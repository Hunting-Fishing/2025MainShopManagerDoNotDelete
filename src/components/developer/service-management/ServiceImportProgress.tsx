
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface ServiceImportProgressProps {
  isImporting: boolean;
  progress: number;
  stage: string;
  message: string;
  onCancel?: () => void;
  error?: string | null;
  completed?: boolean;
  operation?: 'import' | 'clear';
}

export function ServiceImportProgress({ 
  isImporting, 
  progress, 
  stage, 
  message, 
  onCancel,
  error,
  completed = false,
  operation = 'import'
}: ServiceImportProgressProps) {
  if (!isImporting && !completed && !error) {
    return null;
  }

  const getIcon = () => {
    if (error) return <XCircle className="h-4 w-4 text-red-500" />;
    if (completed) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-blue-500" />;
  };

  const getVariant = () => {
    if (error) return 'destructive' as const;
    if (completed) return 'default' as const;
    return 'default' as const;
  };

  return (
    <div className="space-y-3">
      <Alert variant={getVariant()}>
        <div className="flex items-center gap-2">
          {getIcon()}
          <AlertDescription className="flex-1">
            <div className="font-medium">
              {operation === 'clear' ? 'Database Clear' : 'Service Import'} - {stage}
            </div>
            <div className="text-sm mt-1">{message}</div>
          </AlertDescription>
          {isImporting && onCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Alert>
      
      {(isImporting || completed) && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <div className="text-xs text-gray-500 text-right">
            {progress}% complete
          </div>
        </div>
      )}
    </div>
  );
}
