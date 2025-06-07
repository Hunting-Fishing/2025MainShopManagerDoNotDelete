
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
      message: 'Starting live service import from storage...',
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

        // Wait a bit then refresh live data
        setTimeout(async () => {
          await refetch();
        }, 1000);

        toast({
          title: "Live Import Completed Successfully",
          description: result.message,
          variant: "default",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Live service import failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Live service import failed';
      
      setImportProgress({
        stage: 'error',
        message: errorMessage,
        progress: 0,
        completed: false,
        error: errorMessage
      });
      
      toast({
        title: "Live Import Failed",
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
      message: 'Processing uploaded files to live database...',
      progress: 0,
      completed: false,
      error: null
    });

    try {
      await importSelectedFiles(files);
      
      setImportProgress({
        stage: 'complete',
        message: 'Live file import completed successfully!',
        progress: 100,
        completed: true,
        error: null
      });

      setTimeout(async () => {
        await refetch();
      }, 1000);

      toast({
        title: "Live Import Completed Successfully",
        description: `Processed ${files.length} file(s) and saved to live database.`,
        variant: "default",
      });

    } catch (error) {
      console.error('Live file import failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Live file import failed';
      
      setImportProgress({
        stage: 'error',
        message: errorMessage,
        progress: 0,
        completed: false,
        error: errorMessage
      });
      
      toast({
        title: "Live Import Failed",
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
      console.log('Starting live database clear operation...');
      await clearAllServiceData();
      
      // Refresh the live data after clearing
      await refetch();
      
      toast({
        title: "Live Database Cleared",
        description: "All service data has been successfully removed from live database.",
        variant: "default",
      });
      
    } catch (error) {
      console.error('Error clearing live database:', error);
      toast({
        title: "Clear Failed",
        description: "Failed to clear live database. Please try again.",
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
      console.log('Refreshing live service data...');
      await refetch();
      
      // Get current counts for verification from live database
      const counts = await getServiceCounts();
      console.log('Current live service counts:', counts);
      
      toast({
        title: "Live Data Refreshed",
        description: "Service hierarchy data has been refreshed successfully from live database.",
        variant: "default",
      });
      
    } catch (error) {
      console.error('Error refreshing live data:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh live data. Please try again.",
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
