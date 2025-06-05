import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { StorageFileBrowser } from './StorageFileBrowser';
import { StorageImportService, importFromStorage } from '@/lib/services/storageImportService';
import { importServiceHierarchy } from '@/lib/services/serviceImportApi';

export interface ServiceBulkImportProps {
  onImportComplete?: () => Promise<void>;
}

interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
}

export const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({ onImportComplete }) => {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
    setError('');
    setSuccess('');
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file to import');
      return;
    }

    setImporting(true);
    setError('');
    setSuccess('');
    setProgress(null);

    try {
      console.log(`Starting import of file: ${selectedFile}`);
      
      // Step 1: Import from storage
      const rawData = await importFromStorage('service-imports', selectedFile, setProgress);
      
      // Step 2: Import to database
      setProgress({
        stage: 'database',
        progress: 80,
        message: 'Importing to database...'
      });

      const result = await importServiceHierarchy(rawData);
      
      setProgress({
        stage: 'complete',
        progress: 100,
        message: `Successfully imported ${result.totalImported} services`
      });

      setSuccess(`Import completed! Created ${result.categories} categories, ${result.subcategories} subcategories, and ${result.jobs} jobs.`);
      
      // Call the completion callback if provided
      if (onImportComplete) {
        await onImportComplete();
      }
      
    } catch (error) {
      console.error('Import failed:', error);
      setError(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Bulk Import Services
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{progress.message}</span>
                <span>{progress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}

          <StorageFileBrowser onFileSelect={handleFileSelect} />

          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">Selected: {selectedFile}</span>
              </div>
              <Button 
                onClick={handleImport} 
                disabled={importing}
                className="ml-4"
              >
                {importing ? 'Importing...' : 'Import'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
