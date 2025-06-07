
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { useFileBasedServiceImport } from '@/hooks/useFileBasedServiceImport';
import { 
  importServicesFromStorage, 
  clearAllServiceData,
  getServiceCounts
} from '@/lib/services';
import { ImportProgress } from '@/types/service';

export const useServiceManagement = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: 'initial',
    message: '',
    progress: 0,
    completed: false,
    error: null
  });
  
  const { sectors, refetch } = useServiceSectors();
  const { toast } = useToast();
  const { importSelectedFiles } = useFileBasedServiceImport();

  const handleServiceImport = async () => {
    setIsImporting(true);
    setImportProgress({
      stage: 'starting',
      message: 'Starting service import from storage...',
      progress: 0,
      completed: false,
      error: null
    });

    try {
      const result = await importServicesFromStorage(setImportProgress);
      
      if (result.success) {
        setImportProgress({
          stage: 'complete',
          message: result.message,
          progress: 100,
          completed: true,
          error: null
        });

        // Wait a bit then refresh
        setTimeout(async () => {
          await refetch();
        }, 1000);

        toast({
          title: "Import Completed Successfully",
          description: result.message,
          variant: "default",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Service import failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Service import failed';
      
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
      await importSelectedFiles(files);
      
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
      console.log('Starting database clear operation...');
      await clearAllServiceData();
      
      // Refresh the data after clearing
      await refetch();
      
      toast({
        title: "Database Cleared",
        description: "All service data has been successfully removed.",
        variant: "default",
      });
      
    } catch (error) {
      console.error('Error clearing database:', error);
      toast({
        title: "Clear Failed",
        description: "Failed to clear database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleCancel = () => {
    setIsImporting(false);
    setIsClearing(false);
    setImportProgress({
      stage: 'initial',
      message: '',
      progress: 0,
      completed: false,
      error: null
    });
  };

  const handleRefreshData = async () => {
    try {
      console.log('Refreshing service data...');
      await refetch();
      
      // Get current counts for verification
      const counts = await getServiceCounts();
      console.log('Current service counts:', counts);
      
      toast({
        title: "Data Refreshed",
        description: "Service hierarchy data has been refreshed successfully.",
        variant: "default",
      });
      
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
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
};
