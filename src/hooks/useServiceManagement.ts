
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { useFileBasedServiceImport } from '@/hooks/useFileBasedServiceImport';
import { 
  importServicesFromStorage, 
  clearAllServiceData,
  type ImportProgress 
} from '@/lib/services';

export function useServiceManagement() {
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: '',
    message: '',
    progress: 0,
    completed: false,
    error: null
  });
  
  const { sectors, refetch } = useServiceSectors();
  const { toast } = useToast();
  const { importFromFiles } = useFileBasedServiceImport();

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
      const result = await importServicesFromStorage(setImportProgress);
      
      setImportProgress({
        stage: 'complete',
        message: result.message || 'Service import completed successfully!',
        progress: 100,
        completed: true,
        error: null
      });
      
      setTimeout(async () => {
        await refetch();
      }, 1000);
      
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

  const importFromStorage = async (files: File[]) => {
    if (files.length === 0) return;

    setIsImporting(true);
    setImportProgress({
      stage: 'starting',
      message: 'Processing uploaded files...',
      progress: 0,
      completed: false,
      error: null
    });

    try {
      await importFromFiles(files, setImportProgress);
      
      setImportProgress({
        stage: 'complete',
        message: 'File import completed successfully!',
        progress: 100,
        completed: true,
        error: null
      });

      setTimeout(async () => {
        await refetch();
      }, 1000);

      toast({
        title: "Import Completed Successfully",
        description: `Processed ${files.length} file(s) and saved to database.`,
        variant: "default",
      });

    } catch (error) {
      console.error('File import failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'File import failed';
      
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

  const handleClearDatabase = async () => {
    setIsClearing(true);
    
    try {
      setImportProgress({
        stage: 'clearing',
        progress: 20,
        message: 'Clearing service database...',
        completed: false,
        error: null
      });

      await clearAllServiceData();

      setImportProgress({
        stage: 'complete',
        progress: 100,
        message: 'Service database cleared successfully!',
        completed: true,
        error: null
      });

      toast({
        title: "Database Cleared",
        description: "All service data has been removed from the database.",
      });

      await refetch();

    } catch (error: any) {
      console.error('Clear database failed:', error);
      setImportProgress({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : "Failed to clear database",
        error: error instanceof Error ? error.message : "Failed to clear database",
        completed: false
      });
      toast({
        title: "Clear Failed",
        description: error instanceof Error ? error.message : "Failed to clear service database",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleCancel = () => {
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

  return {
    sectors,
    isImporting,
    isClearing,
    importProgress,
    handleServiceImport,
    importFromStorage,
    handleClearDatabase,
    handleCancel,
    handleRefreshData
  };
}
