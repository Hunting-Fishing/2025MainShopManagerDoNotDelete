
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { importServicesFromStorage, type ImportProgress } from '@/lib/services';

interface ServiceBulkImportProps {
  onImportComplete?: () => void;
}

export function ServiceBulkImport({ onImportComplete }: ServiceBulkImportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({
    stage: '',
    message: '',
    progress: 0,
    completed: false,
    error: null
  });
  const { toast } = useToast();

  const handleImportFromStorage = async () => {
    setIsImporting(true);
    setProgress({
      stage: 'Starting import...',
      message: 'Initializing import process',
      progress: 0,
      completed: false,
      error: null
    });

    try {
      const result = await importServicesFromStorage((progressUpdate) => {
        setProgress(progressUpdate);
      });

      setProgress({
        stage: 'Import Complete',
        message: `Successfully imported ${result.totalImported} services`,
        progress: 100,
        completed: true,
        error: null
      });

      toast({
        title: "Import Successful",
        description: `Imported ${result.totalImported} services successfully`,
      });

      // Call the callback to refresh parent component
      onImportComplete?.();
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setProgress({
        stage: 'Import Failed',
        message: errorMessage,
        progress: 0,
        completed: false,
        error: errorMessage
      });

      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Import Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Import services from Excel files stored in the 'service-data' storage bucket.
        </div>

        {isImporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{progress.stage}</span>
              <span className="text-sm text-gray-500">{Math.round(progress.progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">{progress.message}</p>
          </div>
        )}

        {progress.completed && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{progress.message}</span>
          </div>
        )}

        {progress.error && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{progress.error}</span>
          </div>
        )}

        <Button 
          onClick={handleImportFromStorage}
          disabled={isImporting}
          className="w-full"
        >
          <FileText className="h-4 w-4 mr-2" />
          {isImporting ? 'Importing...' : 'Import from Storage'}
        </Button>
      </CardContent>
    </Card>
  );
}
