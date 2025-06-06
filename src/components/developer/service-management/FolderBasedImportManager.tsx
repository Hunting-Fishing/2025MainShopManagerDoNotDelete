
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
        message: result.message || 'Service import completed successfully!',
        progress: 100,
        completed: true,
        error: null
      });
      
      // Force refresh the service sectors list to show new data
      setTimeout(async () => {
        await refetch();
      }, 1000);
      
      // Show success toast with statistics
      toast({
        title: "Import Completed Successfully",
        description: result.stats ? 
          `Imported ${result.stats.totalServices} services across ${result.stats.totalSectors} sectors from ${result.stats.filesProcessed} files.` : 
          result.message,
        variant: "default",
      });
      
    } catch (error) {
      console.error('Service import failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      
      setImportProgress({
        stage: 'error',
        message: errorMessage,
        progress: 0,
        completed: false,
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
      variant: "destructive",
    });
  };

  const handleRefreshData = async () => {
    try {
      await refetch();
      toast({
        title: "Data Refreshed",
        description: "Service hierarchy has been refreshed",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh service data",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Storage-Based Service Import
          </CardTitle>
          <CardDescription>
            Import service data from structured Excel files in storage folders organized by sector
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

      {/* Data Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Manage imported service data and refresh the display
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleRefreshData}
              variant="outline"
              disabled={isImporting}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Service Data
            </Button>
            
            <div className="text-sm text-gray-600 flex items-center">
              Current: {sectors.length} sectors loaded
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
