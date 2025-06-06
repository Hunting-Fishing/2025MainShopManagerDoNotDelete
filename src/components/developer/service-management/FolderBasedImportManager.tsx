
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceBulkImport } from './ServiceBulkImport';
import { ServiceImportProgress } from './ServiceImportProgress';
import { Database, FolderOpen, RefreshCw } from 'lucide-react';
import { importServicesFromStorage, type ImportProgress, type ImportResult, type ImportStats } from '@/lib/services';
import { useToast } from '@/hooks/use-toast';
import { useServiceSectors } from '@/hooks/useServiceCategories';

export function FolderBasedImportManager() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: '',
    message: '',
    progress: 0,
    completed: false,
    error: null
  });
  const { sectors, refetch } = useServiceSectors();
  const { toast } = useToast();
  
  const handleServiceImport = async () => {
    setIsImporting(true);
    setImportProgress({
      stage: 'starting',
      message: 'Starting import process...',
      progress: 0,
      completed: false,
      error: null
    });
    
    try {
      const result = await importServicesFromStorage(
        (progress: ImportProgress) => {
          setImportProgress(progress);
        }
      );
      
      // Import completed successfully
      setImportProgress({
        stage: 'complete',
        message: 'Service import completed successfully!',
        progress: 100,
        completed: true,
        error: null
      });
      
      // Refresh the service sectors list to show new data
      refetch();
      
      // Show success toast with statistics
      toast({
        title: "Import Completed Successfully",
        description: result.message || "Services have been imported successfully.",
        variant: "success",
      });
      
    } catch (error) {
      console.error('Service import failed:', error);
      
      setImportProgress({
        stage: 'error',
        message: error instanceof Error ? error.message : 'Import failed',
        progress: 0,
        completed: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
      
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import services",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleCancel = () => {
    // In a real implementation, we would abort the import process
    setIsImporting(false);
    setImportProgress({
      stage: 'cancelled',
      message: 'Import cancelled by user',
      progress: 0,
      completed: false,
      error: null
    });
    
    toast({
      title: "Import Cancelled",
      description: "Service import was cancelled",
      variant: "warning",
    });
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Storage-Based Service Import
        </CardTitle>
        <CardDescription>
          Import service data from structured Excel files in a storage folder
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ServiceBulkImport 
            onImport={handleServiceImport} 
            disabled={isImporting} 
          />
          
          <ServiceImportProgress 
            isImporting={isImporting}
            progress={importProgress.progress}
            stage={importProgress.stage}
            message={importProgress.message}
            onCancel={handleCancel}
            error={importProgress.error}
            completed={importProgress.completed}
          />
        </div>
      </CardContent>
    </Card>
  );
}
