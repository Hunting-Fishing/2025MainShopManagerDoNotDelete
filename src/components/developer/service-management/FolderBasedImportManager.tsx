
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { importFromStorage, ImportProgress } from '@/lib/services/storageImportService';
import { importServicesFromStorage } from '@/lib/services/folderBasedImportService';
import { ServiceImportProgress } from './ServiceImportProgress';

// Updated interface to match what the service actually returns
interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
}

interface StorageFileBrowserProps {
  bucketName: string;
  onFileSelect: (filePath: string) => void;
  disabled?: boolean;
}

// Simple file browser component
const StorageFileBrowser: React.FC<StorageFileBrowserProps> = ({
  bucketName,
  onFileSelect,
  disabled = false
}) => {
  const [files] = useState<string[]>([
    'services/automotive-services.xlsx',
    'services/hvac-services.xlsx',
    'services/plumbing-services.xlsx'
  ]);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Available Files</h3>
      <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
        {files.map((file) => (
          <div 
            key={file}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
            onClick={() => !disabled && onFileSelect(file)}
          >
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              <span className="text-sm">{file}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export function FolderBasedImportManager() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: 'idle',
    progress: 0,
    message: ''
  });
  const [importResults, setImportResults] = useState<ImportResult[]>([]);

  const handleFileSelect = (filePath: string) => {
    setSelectedFiles(prev => {
      if (prev.includes(filePath)) {
        return prev.filter(f => f !== filePath);
      } else {
        return [...prev, filePath];
      }
    });
  };

  const handleImportFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to import",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportResults([]);
    const results: ImportResult[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const filePath = selectedFiles[i];
        
        setImportProgress({
          stage: 'processing',
          progress: (i / selectedFiles.length) * 100,
          message: `Processing ${filePath}...`
        });

        try {
          const result = await importServicesFromStorage('services', filePath, setImportProgress);
          results.push({
            success: true,
            imported: result.imported || 0,
            errors: result.errors || []
          });

          toast({
            title: "Import successful",
            description: `Successfully imported services from ${filePath}`,
          });
        } catch (error) {
          console.error(`Error importing ${filePath}:`, error);
          results.push({
            success: false,
            imported: 0,
            errors: [error instanceof Error ? error.message : 'Unknown error']
          });

          toast({
            title: "Import failed",
            description: `Failed to import ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      }

      setImportResults(results);
      
      // Calculate totals
      const totalImported = results.reduce((sum, result) => sum + result.imported, 0);
      const totalErrors = results.reduce((sum, result) => sum + result.errors.length, 0);

      setImportProgress({
        stage: 'complete',
        progress: 100,
        message: `Import completed. ${totalImported} items imported, ${totalErrors} errors`,
        completed: true
      });

    } catch (error) {
      console.error('Import process failed:', error);
      setImportProgress({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Import failed',
        error: error instanceof Error ? error.message : 'Import failed'
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedFiles([]);
    setImportResults([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Folder-Based Service Import</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            Import service hierarchies from Excel files stored in your project's storage.
            Select one or more files to import service data including sectors, categories, subcategories, and individual services.
          </div>

          <StorageFileBrowser
            bucketName="services"
            onFileSelect={handleFileSelect}
            disabled={isImporting}
          />

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearSelection}
                  disabled={isImporting}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file) => (
                  <Badge key={file} variant="secondary" className="text-xs">
                    {file.split('/').pop()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button 
              onClick={handleImportFiles}
              disabled={selectedFiles.length === 0 || isImporting}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Selected Files
            </Button>
          </div>

          <ServiceImportProgress
            isImporting={isImporting}
            progress={importProgress.progress}
            stage={importProgress.stage}
            message={importProgress.message}
            error={importProgress.error}
            completed={importProgress.completed}
          />

          {importResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Import Results</h4>
              <div className="space-y-2">
                {importResults.map((result, index) => (
                  <div key={index} className="p-3 border rounded-md">
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium">
                        File {index + 1}: {result.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      {result.imported} items imported
                      {result.errors.length > 0 && (
                        <span className="text-red-600 ml-2">
                          {result.errors.length} errors
                        </span>
                      )}
                    </div>
                    {result.errors.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {result.errors.slice(0, 3).map((error, errorIndex) => (
                          <div key={errorIndex} className="text-xs text-red-600 bg-red-50 p-1 rounded">
                            {error}
                          </div>
                        ))}
                        {result.errors.length > 3 && (
                          <div className="text-xs text-gray-500">
                            ... and {result.errors.length - 3} more errors
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
