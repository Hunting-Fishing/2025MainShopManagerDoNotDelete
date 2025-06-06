
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StorageFileBrowser } from '@/components/storage/StorageFileBrowser';
import { ServiceImportProgress } from './ServiceImportProgress';
import { 
  importServicesFromStorage, 
  clearAllServiceData, 
  getServiceCounts,
  type ImportResult,
  type ImportProgress 
} from '@/lib/services';
import { cleanupMisplacedServiceData, removeTestData } from '@/lib/services/dataCleanupService';
import { Upload, Trash2, Database, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function FolderBasedImportManager() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: '',
    progress: 0,
    message: ''
  });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    setIsImporting(true);
    setImportResult(null);
    
    try {
      const result = await importServicesFromStorage(
        'service-data', // bucket name
        selectedFile,
        (progress) => {
          setImportProgress(progress);
        }
      );
      
      setImportResult(result);
      
      if (result.success) {
        toast.success(`Import completed! Imported ${result.imported?.services || 0} services`);
      } else {
        toast.error(result.message || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      toast.error(errorMessage);
      setImportResult({
        success: false,
        message: errorMessage,
        error: errorMessage,
        errors: [errorMessage],
        imported: { sectors: 0, categories: 0, subcategories: 0, services: 0 },
        sectors: 0,
        categories: 0,
        subcategories: 0,
        services: 0
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all service data? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      await clearAllServiceData();
      toast.success('All service data cleared successfully');
      setImportResult(null);
    } catch (error) {
      console.error('Clear data error:', error);
      toast.error('Failed to clear service data');
    } finally {
      setIsClearing(false);
    }
  };

  const handleCleanupData = async () => {
    setIsCleaningUp(true);
    try {
      // First remove test data
      const removeResult = await removeTestData();
      if (removeResult.success) {
        console.log('Test data removed');
      }
      
      // Then cleanup misplaced data
      const cleanupResult = await cleanupMisplacedServiceData();
      
      if (cleanupResult.success) {
        toast.success(cleanupResult.message);
      } else {
        toast.error(cleanupResult.message);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error('Failed to cleanup data');
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Service Data Import Manager</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Import service data from Excel files stored in Supabase storage. 
              Select a file from the browser below and click Import to process it.
            </AlertDescription>
          </Alert>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleImport}
              disabled={!selectedFile || isImporting || isClearing}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>{isImporting ? 'Importing...' : 'Import Services'}</span>
            </Button>

            <Button
              onClick={handleCleanupData}
              disabled={isImporting || isClearing || isCleaningUp}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isCleaningUp ? 'animate-spin' : ''}`} />
              <span>{isCleaningUp ? 'Cleaning...' : 'Cleanup Data'}</span>
            </Button>

            <Button
              onClick={handleClearData}
              disabled={isImporting || isClearing}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>{isClearing ? 'Clearing...' : 'Clear All Data'}</span>
            </Button>
          </div>

          {selectedFile && (
            <div className="text-sm text-muted-foreground">
              Selected file: <span className="font-medium">{selectedFile}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <ServiceImportProgress
        isImporting={isImporting}
        progress={importProgress.progress}
        stage={importProgress.stage}
        message={importProgress.message}
        error={importProgress.error}
        completed={importProgress.completed}
      />

      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Import Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {importResult.success ? (
              <div className="space-y-2">
                <div className="text-green-600 font-medium">{importResult.message}</div>
                {importResult.imported && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{importResult.sectors}</div>
                      <div className="text-sm text-blue-500">Sectors</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">{importResult.categories}</div>
                      <div className="text-sm text-green-500">Categories</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600">{importResult.subcategories}</div>
                      <div className="text-sm text-yellow-500">Subcategories</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{importResult.services}</div>
                      <div className="text-sm text-purple-500">Services</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-red-600 font-medium">{importResult.message}</div>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="text-sm text-red-500">
                    <div className="font-medium">Errors:</div>
                    <ul className="list-disc list-inside">
                      {importResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <StorageFileBrowser
        bucketName="service-data"
        onFileSelect={handleFileSelect}
        disabled={isImporting || isClearing}
      />
    </div>
  );
}
