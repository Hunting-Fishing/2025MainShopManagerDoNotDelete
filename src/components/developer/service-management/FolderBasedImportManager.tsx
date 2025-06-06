
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FolderOpen, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StorageFileBrowser } from './StorageFileBrowser';
import { ServiceImportProgress } from './ServiceImportProgress';
import { importServicesFromStorage, ImportProgress } from '@/lib/services/folderBasedImportService';

export function FolderBasedImportManager() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: '',
    message: '',
    progress: 0
  });
  const [selectedFile, setSelectedFile] = useState<{ path: string; name: string } | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (filePath: string, fileName: string) => {
    setSelectedFile({ path: filePath, name: fileName });
    console.log('Selected file for import:', { path: filePath, name: fileName });
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to import from the storage browser.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress({
      stage: 'starting',
      progress: 0,
      message: 'Starting import process...'
    });

    try {
      console.log(`Starting import of file: ${selectedFile.path}`);
      
      // Extract sector info from path for user feedback
      const sectorName = selectedFile.path.split('/')[0] || 'General';
      
      setImportProgress({
        stage: 'processing',
        progress: 5,
        message: `Importing ${selectedFile.name} for ${sectorName} sector...`
      });

      await importServicesFromStorage(
        'service-imports', 
        selectedFile.path, // Pass the full path including folder
        (progress) => {
          console.log('Import progress:', progress);
          setImportProgress(progress);
        }
      );

      toast({
        title: "Import Successful",
        description: `Successfully imported services from ${selectedFile.name} to ${sectorName} sector.`,
      });

      // Clear selection after successful import
      setSelectedFile(null);

    } catch (error) {
      console.error('Import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setImportProgress({
        stage: 'error',
        progress: 0,
        message: errorMessage,
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

  const resetProgress = () => {
    setImportProgress({
      stage: '',
      message: '',
      progress: 0
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Import Services from Storage</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <FolderOpen className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Folder Structure</p>
              <p className="mt-1 text-blue-700">
                Each folder in the storage bucket represents a service sector (e.g., Automotive, Lawn-Care, Marine).
                Files within folders will be imported to their respective sectors.
              </p>
            </div>
          </div>

          {selectedFile && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <FileText className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm flex-1">
                <p className="font-medium text-green-800">Selected File</p>
                <p className="mt-1 text-green-700">
                  <span className="font-medium">File:</span> {selectedFile.name}
                </p>
                <p className="text-green-700">
                  <span className="font-medium">Sector:</span> {selectedFile.path.split('/')[0] || 'General'}
                </p>
                <p className="text-green-700">
                  <span className="font-medium">Path:</span> {selectedFile.path}
                </p>
              </div>
            </div>
          )}

          {importProgress.error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800">Import Error</p>
                <p className="mt-1 text-red-700">{importProgress.error}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>{isImporting ? 'Importing...' : 'Import Selected File'}</span>
            </Button>

            {selectedFile && (
              <Button
                variant="outline"
                onClick={() => setSelectedFile(null)}
                disabled={isImporting}
              >
                Clear Selection
              </Button>
            )}
          </div>

          <ServiceImportProgress
            isImporting={isImporting}
            progress={importProgress.progress}
            stage={importProgress.stage}
            message={importProgress.message}
            error={importProgress.error}
            completed={importProgress.completed}
            onCancel={() => {
              setIsImporting(false);
              resetProgress();
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5" />
            <span>Storage Browser</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StorageFileBrowser
            bucketName="service-imports"
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile?.path}
          />
        </CardContent>
      </Card>
    </div>
  );
}
