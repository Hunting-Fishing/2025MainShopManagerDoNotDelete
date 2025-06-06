
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, AlertCircle, FileSpreadsheet, Database, FolderOpen, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  completed,
  operation = 'import'
}: ServiceImportProgressProps) {
  if (!isImporting && !completed && !error) return null;

  const getOperationText = () => {
    return operation === 'import' ? {
      title: 'Importing Services',
      completedTitle: 'Import Complete',
      completedMessage: 'Import completed successfully!',
      progressTitle: 'Importing Services'
    } : {
      title: 'Clearing Database',
      completedTitle: 'Database Cleared',
      completedMessage: 'Database cleared successfully!',
      progressTitle: 'Clearing Database'
    };
  };

  const getStageIcon = (currentStage: string) => {
    if (operation === 'clear') {
      switch (currentStage) {
        case 'clearing':
          return <Trash2 className="h-5 w-5 text-red-600" />;
        case 'complete':
          return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'error':
          return <AlertCircle className="h-5 w-5 text-red-600" />;
        default:
          return <Database className="h-5 w-5 text-red-600" />;
      }
    }

    // Import operation icons
    switch (currentStage) {
      case 'starting':
      case 'folders-found':
        return <FolderOpen className="h-5 w-5 text-blue-600" />;
      case 'processing-sector':
      case 'processing-file':
        return <FileSpreadsheet className="h-5 w-5 text-orange-600" />;
      case 'saving-to-database':
      case 'inserting-sector':
      case 'database-complete':
        return <Database className="h-5 w-5 text-purple-600" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileSpreadsheet className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStageColor = (currentStage: string) => {
    if (operation === 'clear') {
      switch (currentStage) {
        case 'clearing':
          return 'text-red-700';
        case 'complete':
          return 'text-green-700';
        case 'error':
          return 'text-red-700';
        default:
          return 'text-red-700';
      }
    }

    // Import operation colors
    switch (currentStage) {
      case 'starting':
      case 'folders-found':
        return 'text-blue-700';
      case 'processing-sector':
      case 'processing-file':
        return 'text-orange-700';
      case 'saving-to-database':
      case 'inserting-sector':
      case 'database-complete':
        return 'text-purple-700';
      case 'complete':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  const getProgressStages = () => {
    if (operation === 'clear') {
      return (
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <div className={`flex items-center gap-1 ${['clearing'].includes(stage) || completed ? 'text-red-600' : ''}`}>
            <div className={`w-2 h-2 rounded-full ${['clearing'].includes(stage) || completed ? 'bg-red-600' : 'bg-gray-300'}`} />
            <span>Clearing</span>
          </div>
          <div className={`flex items-center gap-1 ${completed ? 'text-green-600' : ''}`}>
            <div className={`w-2 h-2 rounded-full ${completed ? 'bg-green-600' : 'bg-gray-300'}`} />
            <span>Complete</span>
          </div>
        </div>
      );
    }

    // Import operation stages
    return (
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
        <div className={`flex items-center gap-1 ${['starting', 'folders-found'].includes(stage) || completed ? 'text-blue-600' : ''}`}>
          <div className={`w-2 h-2 rounded-full ${['starting', 'folders-found'].includes(stage) || completed ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <span>Discovery</span>
        </div>
        <div className={`flex items-center gap-1 ${['processing-sector', 'processing-file'].includes(stage) || completed ? 'text-orange-600' : ''}`}>
          <div className={`w-2 h-2 rounded-full ${['processing-sector', 'processing-file'].includes(stage) || completed ? 'bg-orange-600' : 'bg-gray-300'}`} />
          <span>Processing</span>
        </div>
        <div className={`flex items-center gap-1 ${['saving-to-database', 'inserting-sector', 'database-complete'].includes(stage) || completed ? 'text-purple-600' : ''}`}>
          <div className={`w-2 h-2 rounded-full ${['saving-to-database', 'inserting-sector', 'database-complete'].includes(stage) || completed ? 'bg-purple-600' : 'bg-gray-300'}`} />
          <span>Database</span>
        </div>
        <div className={`flex items-center gap-1 ${completed ? 'text-green-600' : ''}`}>
          <div className={`w-2 h-2 rounded-full ${completed ? 'bg-green-600' : 'bg-gray-300'}`} />
          <span>Complete</span>
        </div>
      </div>
    );
  };

  const operationText = getOperationText();

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStageIcon(stage)}
          <h3 className="text-lg font-semibold">
            {error ? `${operation === 'import' ? 'Import' : 'Clear'} Failed` : completed ? operationText.completedTitle : operationText.progressTitle}
          </h3>
        </div>
        {onCancel && !completed && !error && (
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : completed ? (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span>{operationText.completedMessage}</span>
        </div>
      ) : (
        <>
          <Progress value={progress} className="w-full" />
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={`font-medium ${getStageColor(stage)}`}>
                {stage.charAt(0).toUpperCase() + stage.slice(1).replace(/-/g, ' ')}
              </span>
              <span className="text-gray-600">{Math.round(progress)}%</span>
            </div>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </>
      )}

      {/* Progress stages indicator */}
      {(isImporting || completed) && !error && getProgressStages()}
    </div>
  );
}
