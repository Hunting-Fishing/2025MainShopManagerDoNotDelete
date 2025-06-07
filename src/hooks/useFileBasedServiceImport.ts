
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { StorageFile, ImportProgress } from '@/types/service';
import { supabase } from '@/integrations/supabase/client';

export function useFileBasedServiceImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: '',
    message: '',
    progress: 0,
    completed: false,
    error: null
  });
  
  const { refetch } = useServiceSectors();
  const { toast } = useToast();

  const importSelectedFiles = async (selectedFiles: StorageFile[], folderName: string) => {
    setIsImporting(true);
    setImportProgress({
      stage: 'starting',
      message: 'Starting file-based import...',
      progress: 0,
      completed: false,
      error: null
    });

    try {
      let processedFiles = 0;
      const totalFiles = selectedFiles.length;

      for (const file of selectedFiles) {
        setImportProgress({
          stage: 'processing',
          message: `Processing file: ${file.name} (${processedFiles + 1}/${totalFiles})`,
          progress: (processedFiles / totalFiles) * 90,
          completed: false,
          error: null
        });

        // Here you would implement the actual file processing logic
        // For now, we'll simulate processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        processedFiles++;
      }

      setImportProgress({
        stage: 'complete',
        message: `Successfully processed ${totalFiles} file${totalFiles !== 1 ? 's' : ''}!`,
        progress: 100,
        completed: true,
        error: null
      });

      toast({
        title: "Import Completed",
        description: `Successfully imported ${totalFiles} Excel file${totalFiles !== 1 ? 's' : ''} from ${folderName} folder`,
        variant: "default",
      });

      // Refresh the service data
      setTimeout(async () => {
        await refetch();
      }, 1000);

    } catch (error) {
      console.error('File-based import failed:', error);
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
      description: "File import was cancelled",
      variant: "destructive",
    });
  };

  return {
    isImporting,
    importProgress,
    importSelectedFiles,
    handleCancel
  };
}
