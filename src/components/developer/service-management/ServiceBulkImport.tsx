
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { StorageFileBrowser } from './StorageFileBrowser';
import { importFromStorage } from '@/lib/services/storageImportService';
import { importServiceHierarchy } from '@/lib/services/serviceImportApi';
import { toast } from 'sonner';

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
    setProgress(null);
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
      
      // Step 1: Import from storage with enhanced processing
      setProgress({
        stage: 'download',
        progress: 10,
        message: `Reading Excel file: ${selectedFile}...`
      });

      const rawData = await importFromStorage('work-order-files', selectedFile, setProgress);
      
      if (!rawData || rawData.length === 0) {
        throw new Error('No data found in the selected file. Please ensure your Excel file contains data.');
      }

      console.log(`Successfully parsed ${rawData.length} sheets from Excel file`);
      
      // Step 2: Import to database
      setProgress({
        stage: 'database',
        progress: 75,
        message: `Importing ${rawData.length} categories to "Automotive Services" sector...`
      });

      const result = await importServiceHierarchy(rawData);
      
      if (result.errors.length > 0) {
        console.warn('Import completed with some errors:', result.errors);
        toast.error(`Import completed with ${result.errors.length} errors. Check console for details.`);
      }
      
      setProgress({
        stage: 'complete',
        progress: 100,
        message: `Successfully imported ${result.totalImported} services`
      });

      const successMessage = 
        `Import completed successfully! ` +
        `Created ${result.categories} categories, ${result.subcategories} subcategories, ` +
        `and ${result.jobs} individual service jobs from ${rawData.length} Excel sheets. ` +
        `All data imported to "Automotive Services" sector.`;

      setSuccess(successMessage);
      toast.success('Service import completed successfully!');
      
      // Step 3: Trigger UI refresh
      setProgress({
        stage: 'refresh',
        progress: 100,
        message: 'Refreshing service hierarchy display...'
      });

      if (onImportComplete) {
        await onImportComplete();
      }
      
    } catch (error) {
      console.error('Import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      setError(errorMessage);
      toast.error(`Import failed: ${errorMessage}`);
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
            Enhanced Service Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">4-Tier Service Hierarchy Import</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Excel files with up to 20 sheets supported (100 rows each)</li>
              <li>• Each sheet becomes a service category</li>
              <li>• Column headers become subcategories</li>
              <li>• Cell values become individual service jobs</li>
              <li>• All data imports to "Automotive Services" sector</li>
              <li>• Duplicates are automatically handled</li>
            </ul>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
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

          <StorageFileBrowser 
            bucketName="work-order-files"
            onFileSelect={handleFileSelect} 
          />

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
                {importing ? 'Importing...' : 'Import to Automotive Services'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
