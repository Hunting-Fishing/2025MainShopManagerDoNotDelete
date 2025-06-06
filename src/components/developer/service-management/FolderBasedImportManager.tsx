
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { ServiceImportProgress } from './ServiceImportProgress';
import { StorageFileBrowser } from './StorageFileBrowser';
import { importServicesFromStorage } from '@/lib/services/folderBasedImportService';
import { toast } from 'sonner';

interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
  error?: string;
  completed?: boolean;
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
}

interface StorageFileBrowserProps {
  bucketName: string;
  onFileSelect: (filePath: string) => void;
  selectedFiles: string[];
  disabled: boolean;
}

export function FolderBasedImportManager() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFileSelect = (filePath: string) => {
    setSelectedFiles(prev => {
      if (prev.includes(filePath)) {
        return prev.filter(f => f !== filePath);
      } else {
        return [...prev, filePath];
      }
    });
  };

  const handleRemoveFile = (filePath: string) => {
    setSelectedFiles(prev => prev.filter(f => f !== filePath));
  };

  const handleImportFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to import');
      return;
    }

    setIsImporting(true);
    setImportProgress(null);
    setImportResult(null);
    setImportError(null);

    try {
      let totalImported = 0;
      let totalErrors: string[] = [];
      let totalSectors = 0;
      let totalCategories = 0;
      let totalSubcategories = 0;
      let totalServices = 0;

      for (let i = 0; i < selectedFiles.length; i++) {
        const filePath = selectedFiles[i];
        const fileName = filePath.split('/').pop() || filePath;
        
        setImportProgress({
          stage: 'import',
          progress: (i / selectedFiles.length) * 90,
          message: `Importing file ${i + 1}/${selectedFiles.length}: ${fileName}...`
        });

        const result = await importServicesFromStorage(
          'service-imports',
          filePath,
          (progress) => {
            setImportProgress({
              ...progress,
              progress: ((i / selectedFiles.length) * 90) + (progress.progress * 0.9 / selectedFiles.length)
            });
          }
        );

        if (result.success) {
          totalImported += result.imported;
          totalSectors += result.sectors || 0;
          totalCategories += result.categories || 0;
          totalSubcategories += result.subcategories || 0;
          totalServices += result.services || 0;
        }
        
        if (result.errors && result.errors.length > 0) {
          totalErrors = [...totalErrors, ...result.errors];
        }
      }

      setImportProgress({
        stage: 'complete',
        progress: 100,
        message: 'Import completed!',
        completed: true
      });

      setImportResult({
        success: true,
        imported: totalImported,
        errors: totalErrors,
        sectors: totalSectors,
        categories: totalCategories,
        subcategories: totalSubcategories,
        services: totalServices
      });

      if (totalImported > 0) {
        toast.success(`Successfully imported ${totalImported} services`);
      }

      if (totalErrors.length > 0) {
        toast.warning(`Import completed with ${totalErrors.length} errors`);
      }

    } catch (error) {
      console.error('Import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setImportError(errorMessage);
      setImportProgress({
        stage: 'error',
        progress: 0,
        message: 'Import failed',
        error: errorMessage
      });
      toast.error(`Import failed: ${errorMessage}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedFiles([]);
    setImportResult(null);
    setImportError(null);
    setImportProgress(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Folder-Based Service Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <FileSpreadsheet className="h-4 w-4" />
            <AlertDescription>
              Upload Excel files to the 'service-imports' storage bucket, then select and import them below.
              Each sheet in the Excel file will be processed as a service category.
            </AlertDescription>
          </Alert>

          {/* File Browser */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select Files to Import</h3>
            <StorageFileBrowser
              bucketName="service-imports"
              onFileSelect={handleFileSelect}
              selectedFiles={selectedFiles}
              disabled={isImporting}
            />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Selected Files ({selectedFiles.length})</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSelection}
                  disabled={isImporting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Selection
                </Button>
              </div>
              <div className="space-y-2">
                {selectedFiles.map((filePath) => (
                  <div key={filePath} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{filePath.split('/').pop()}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(filePath)}
                      disabled={isImporting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Import Progress */}
          {importProgress && (
            <ServiceImportProgress
              isImporting={isImporting}
              progress={importProgress.progress}
              stage={importProgress.stage}
              message={importProgress.message}
              error={importProgress.error}
              completed={importProgress.completed}
            />
          )}

          {/* Import Results */}
          {importResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Import Completed</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{importResult.sectors}</div>
                  <div className="text-sm text-blue-800">Sectors</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{importResult.categories}</div>
                  <div className="text-sm text-green-800">Categories</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{importResult.subcategories}</div>
                  <div className="text-sm text-yellow-800">Subcategories</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{importResult.services}</div>
                  <div className="text-sm text-purple-800">Services</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <div className="font-medium mb-2">Import completed with {importResult.errors.length} errors:</div>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li>... and {importResult.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Error Display */}
          {importError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="font-medium">Import Failed</div>
                <div className="text-sm mt-1">{importError}</div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleImportFiles}
              disabled={selectedFiles.length === 0 || isImporting}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Importing...' : `Import ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
