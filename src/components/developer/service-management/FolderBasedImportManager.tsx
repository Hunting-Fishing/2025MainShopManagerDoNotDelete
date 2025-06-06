
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Database, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StorageFileBrowser } from '@/components/storage/StorageFileBrowser';
import { ServiceImportProgress } from './ServiceImportProgress';
import { 
  importServicesFromStorage,
  clearAllServiceData,
  cleanupMisplacedServiceData,
  removeTestData,
  type ImportProgress,
  type ImportResult
} from '@/lib/services';

export function FolderBasedImportManager() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: '',
    message: '',
    progress: 0
  });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
    console.log('Selected file:', filePath);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file from storage to import.",
        variant: "destructive",
      });
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
        toast({
          title: "Import Successful",
          description: result.message,
        });
        
        // Refresh the page to show updated counts
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Import Failed",
          description: result.error || "Failed to import services",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setImportProgress({
        stage: 'error',
        progress: 0,
        message: 'Import failed',
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

  const handleCleanupData = async () => {
    try {
      const result = await cleanupMisplacedServiceData();
      if (result.success) {
        toast({
          title: "Cleanup Successful",
          description: result.message,
        });
        // Refresh to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
      toast({
        title: "Cleanup Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const handleClearAllData = async () => {
    if (!confirm('Are you sure you want to clear all service data? This cannot be undone.')) {
      return;
    }
    
    try {
      await clearAllServiceData();
      toast({
        title: "Data Cleared",
        description: "All service data has been cleared from the database.",
      });
      // Refresh to show empty state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Clear data failed:', error);
      toast({
        title: "Clear Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const resetProgress = () => {
    setImportProgress({
      stage: '',
      message: '',
      progress: 0
    });
    setImportResult(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Service Data Import Manager
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Import service data from Excel files stored in Supabase storage. Select a file from the browser below and click Import to process it.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isImporting ? 'Importing...' : 'Import Services'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleCleanupData}
              disabled={isImporting}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Cleanup Data
            </Button>
            
            <Button 
              variant="destructive"
              onClick={handleClearAllData}
              disabled={isImporting}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </Button>
          </div>

          <ServiceImportProgress
            isImporting={isImporting}
            progress={importProgress.progress}
            stage={importProgress.stage}
            message={importProgress.message}
            error={importProgress.error}
            completed={importProgress.completed}
            onCancel={resetProgress}
          />

          {importResult && (
            <div className="mt-4 p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Import Results</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Sectors:</span> {importResult.sectors || 0}
                </div>
                <div>
                  <span className="font-medium">Categories:</span> {importResult.categories || 0}
                </div>
                <div>
                  <span className="font-medium">Subcategories:</span> {importResult.subcategories || 0}
                </div>
                <div>
                  <span className="font-medium">Services:</span> {importResult.services || 0}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <StorageFileBrowser
        bucketName="service-data"
        onFileSelect={handleFileSelect}
        disabled={isImporting}
      />
    </div>
  );
}
