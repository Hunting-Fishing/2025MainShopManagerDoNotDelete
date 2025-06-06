
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, AlertTriangle, Info, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { importFromStorage, ImportProgress } from '@/lib/services/storageImportService';
import { ServiceImportProgress } from './ServiceImportProgress';
import { StorageFileBrowser } from './StorageFileBrowser';
import { processServiceData } from '@/lib/services/folderBasedImportService';

export function FolderBasedImportManager() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: '',
    message: '',
    progress: 0
  });
  const [selectedFile, setSelectedFile] = useState<string>('');
  const { toast } = useToast();

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
  };

  const handleImportFromStorage = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file from storage first.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    
    try {
      // Import from storage bucket
      const sheetsData = await importFromStorage(
        'service-imports', 
        selectedFile, 
        (progress) => {
          setImportProgress(progress);
        }
      );

      // Process the imported data
      setImportProgress({
        stage: 'processing',
        progress: 80,
        message: 'Processing service data...'
      });

      await processServiceData(sheetsData, (progress) => {
        setImportProgress({
          ...progress,
          progress: 80 + (progress.progress * 0.2) // Scale to 80-100%
        });
      });

      setImportProgress({
        stage: 'complete',
        progress: 100,
        message: 'Import completed successfully!',
        completed: true
      });

      toast({
        title: "Import Successful",
        description: "Service data has been imported successfully from storage.",
      });
    } catch (error) {
      console.error('Storage import failed:', error);
      setImportProgress({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : "Failed to import service data",
        error: error instanceof Error ? error.message : "Failed to import service data"
      });
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import service data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Service Data from Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Folder Organization</p>
              <p className="mt-1 text-blue-700">
                Files should be organized in sector folders (e.g., Automotive, Lawn-Care, Marine). 
                Each folder represents a different service sector.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <FileSpreadsheet className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-800">Flexible File Format</p>
              <ul className="mt-2 text-green-700 space-y-1">
                <li>• <strong>Supported formats:</strong> Excel (.xlsx, .xls) or CSV (.csv)</li>
                <li>• <strong>Minimum requirement:</strong> At least one column with service/job names</li>
                <li>• <strong>Flexible columns:</strong> The system will automatically detect columns like:</li>
                <li className="ml-4">- Sector, Service Sector, Business Sector</li>
                <li className="ml-4">- Category, Service Category, Type</li>
                <li className="ml-4">- Subcategory, Sub Category, Service Type</li>
                <li className="ml-4">- Job, Service, Service Name, Task, Work</li>
                <li>• <strong>Optional columns:</strong> Description, Price, Duration, Cost, Time</li>
                <li>• <strong>Smart fallbacks:</strong> Missing categories will use sheet name or "General"</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Import Tips</p>
              <ul className="mt-2 text-amber-700 space-y-1">
                <li>• Column headers are case-insensitive and flexible</li>
                <li>• First row should contain column headers</li>
                <li>• Empty rows and columns will be ignored</li>
                <li>• If categories are missing, the sheet name will be used as the category</li>
                <li>• Duplicate entries will be automatically skipped</li>
              </ul>
            </div>
          </div>

          <StorageFileBrowser
            bucketName="service-imports"
            onFileSelect={handleFileSelect}
          />

          {selectedFile && (
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <p className="font-medium text-blue-800">Selected File</p>
                <p className="text-blue-600">{selectedFile}</p>
              </div>
              <Button 
                onClick={handleImportFromStorage}
                disabled={isImporting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import from Storage'}
              </Button>
            </div>
          )}

          <ServiceImportProgress
            isImporting={isImporting}
            progress={importProgress.progress}
            stage={importProgress.stage}
            message={importProgress.message}
            error={importProgress.error}
            completed={importProgress.completed}
          />
        </CardContent>
      </Card>
    </div>
  );
}
