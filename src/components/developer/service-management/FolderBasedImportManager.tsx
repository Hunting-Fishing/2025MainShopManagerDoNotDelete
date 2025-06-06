
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Database, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { StorageFileBrowser } from '@/components/storage/StorageFileBrowser';
import { ServiceImportProgress } from './ServiceImportProgress';
import { importServicesFromStorage, ImportResult } from '@/lib/services/folderBasedImportService';

export function FolderBasedImportManager() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({
    progress: 0,
    stage: '',
    message: '',
    error: null as string | null,
    completed: false
  });
  const [lastImportResult, setLastImportResult] = useState<ImportResult | null>(null);

  const handleFileSelect = (filePath: string) => {
    setSelectedFiles([filePath]);
    console.log('Selected file:', filePath);
  };

  const handleImport = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to import');
      return;
    }

    setIsImporting(true);
    setImportProgress({
      progress: 0,
      stage: 'starting',
      message: 'Preparing to import services...',
      error: null,
      completed: false
    });

    try {
      const bucketName = 'service-imports'; // Default bucket for service imports
      
      for (const filePath of selectedFiles) {
        console.log(`Starting import for file: ${filePath}`);
        
        const result = await importServicesFromStorage(
          bucketName,
          filePath,
          (progress) => {
            setImportProgress({
              progress: progress.progress || 0,
              stage: progress.stage || 'processing',
              message: progress.message || 'Processing...',
              error: progress.error || null,
              completed: progress.completed || false
            });
          }
        );

        setLastImportResult(result);

        if (result.success) {
          toast.success(
            `Successfully imported ${result.imported} services (${result.sectors} sectors, ${result.categories} categories, ${result.subcategories} subcategories, ${result.services} services)`
          );
        } else {
          toast.error(`Import failed: ${result.errors.join(', ')}`);
        }
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportProgress(prev => ({
        ...prev,
        error: error.message,
        completed: true
      }));
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancelImport = () => {
    setIsImporting(false);
    setImportProgress({
      progress: 0,
      stage: '',
      message: '',
      error: null,
      completed: false
    });
    toast.info('Import cancelled');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Folder-Based Service Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Import services from Excel files organized in a hierarchical folder structure.</p>
            <p className="mt-2">Each sheet will be treated as a service sector, with columns representing the hierarchy:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Column A: Category</li>
              <li>Column B: Subcategory</li>
              <li>Column C: Service/Job</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StorageFileBrowser
              bucketName="service-imports"
              onFileSelect={handleFileSelect}
              disabled={isImporting}
            />

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Selected Files</h3>
                {selectedFiles.length === 0 ? (
                  <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-lg text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    No files selected
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{file}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleImport}
                disabled={selectedFiles.length === 0 || isImporting}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import Services'}
              </Button>

              {lastImportResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Last Import Results</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={lastImportResult.success ? 'text-green-600' : 'text-red-600'}>
                        {lastImportResult.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sectors:</span>
                      <span>{lastImportResult.sectors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Categories:</span>
                      <span>{lastImportResult.categories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subcategories:</span>
                      <span>{lastImportResult.subcategories}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Services:</span>
                      <span>{lastImportResult.services}</span>
                    </div>
                    {lastImportResult.errors.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center gap-1 text-red-600 mb-1">
                          <AlertCircle className="h-3 w-3" />
                          <span className="font-medium">Errors:</span>
                        </div>
                        <ul className="text-xs space-y-1 text-red-600">
                          {lastImportResult.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ServiceImportProgress
        isImporting={isImporting}
        progress={importProgress.progress}
        stage={importProgress.stage}
        message={importProgress.message}
        error={importProgress.error}
        completed={importProgress.completed}
        onCancel={handleCancelImport}
      />
    </div>
  );
}
