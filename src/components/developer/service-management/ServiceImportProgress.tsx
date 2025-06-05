
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface ServiceImportProgressProps {
  isImporting: boolean;
  progress: number;
  stage: string;
  message: string;
  onCancel?: () => void;
  error?: string | null;
  completed?: boolean;
}

export function ServiceImportProgress({
  isImporting,
  progress,
  stage,
  message,
  onCancel,
  error,
  completed
}: ServiceImportProgressProps) {
  if (!isImporting && !completed && !error) return null;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {error ? 'Import Failed' : completed ? 'Import Complete' : 'Importing Services'}
        </h3>
        {onCancel && !completed && !error && (
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>

      {error ? (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      ) : completed ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span>Import completed successfully!</span>
        </div>
      ) : (
        <>
          <Progress value={progress} className="w-full" />
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{stage}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </>
      )}
    </div>
  );
}
