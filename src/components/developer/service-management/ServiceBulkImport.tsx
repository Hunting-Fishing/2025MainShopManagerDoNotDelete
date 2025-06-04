
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileSpreadsheet, Database } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { StorageFileBrowser } from './StorageFileBrowser';
import { importFromStorage } from '@/lib/services/storageImportService';
import { toast } from '@/hooks/use-toast';

export interface ServiceBulkImportProps {
  categories: ServiceMainCategory[];
  onImport: (data: ServiceMainCategory[]) => Promise<void>;
  onExport: () => void;
}

interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
}

export const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({
  categories,
  onImport,
  onExport
}) => {
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: 'idle',
    progress: 0,
    message: 'Ready to import'
  });
  const [showStorageBrowser, setShowStorageBrowser] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus('loading');
    setImportProgress({
      stage: 'reading',
      progress: 25,
      message: 'Reading file...'
    });

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setImportProgress({
        stage: 'parsing',
        progress: 50,
        message: 'Parsing data...'
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      setImportProgress({
        stage: 'importing',
        progress: 75,
        message: 'Importing to database...'
      });

      // Mock data for demonstration
      const mockData: ServiceMainCategory[] = [
        {
          id: 'mock-1',
          name: 'Engine Services',
          description: 'All engine-related services',
          subcategories: [],
          position: 1
        }
      ];

      await onImport(mockData);

      setImportProgress({
        stage: 'success',
        progress: 100,
        message: 'Import completed successfully'
      });

      setImportStatus('success');
      
      toast({
        title: "Import Successful",
        description: "Service categories have been imported successfully.",
      });

    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus('error');
      setImportProgress({
        stage: 'error',
        progress: 0,
        message: 'Import failed'
      });
      
      toast({
        title: "Import Failed",
        description: "Failed to import service categories. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStorageFileSelect = async (fileName: string) => {
    setImportStatus('loading');
    setShowStorageBrowser(false);

    try {
      const data = await importFromStorage(
        'work-order-jobs',
        fileName,
        (progress) => {
          setImportProgress(progress);
        }
      );

      await onImport(data);
      setImportStatus('success');
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${data.length} categories from ${fileName}`,
      });

    } catch (error) {
      console.error('Storage import failed:', error);
      setImportStatus('error');
      setImportProgress({
        stage: 'error',
        progress: 0,
        message: 'Import failed'
      });
      
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import from storage",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(categories, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `service-categories-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Export Successful",
        description: "Service categories have been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export service categories.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* File Upload Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={importStatus === 'loading'}
              />
              <p className="text-xs text-gray-500">
                Supports CSV, JSON, Excel files
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Storage Browser Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center">
              <Database className="h-5 w-5 mr-2" />
              From Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowStorageBrowser(true)}
              disabled={importStatus === 'loading'}
              className="w-full"
            >
              Browse Storage Files
            </Button>
          </CardContent>
        </Card>

        {/* Export Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleExport}
              variant="outline" 
              className="w-full"
              disabled={categories.length === 0}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      {importStatus === 'loading' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Import Progress</span>
                <span className="text-sm text-gray-500">{importProgress.progress}%</span>
              </div>
              <Progress value={importProgress.progress} className="w-full" />
              <p className="text-sm text-gray-600">{importProgress.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Storage File Browser Dialog */}
      {showStorageBrowser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Select File from Storage</h3>
              <Button 
                variant="outline" 
                onClick={() => setShowStorageBrowser(false)}
              >
                Cancel
              </Button>
            </div>
            <StorageFileBrowser
              bucketName="work-order-jobs"
              onFileSelect={handleStorageFileSelect}
              accept=".csv,.json,.xlsx,.xls"
              disabled={importStatus === 'loading'}
            />
          </div>
        </div>
      )}
    </div>
  );
};
