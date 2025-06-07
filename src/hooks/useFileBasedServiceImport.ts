
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { processMultipleExcelFiles } from '@/lib/services';
import type { StorageFile } from '@/types/service';

export const useFileBasedServiceImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const importSelectedFiles = async (files: File[] | StorageFile[]) => {
    setIsImporting(true);
    
    try {
      console.log('Starting file-based import for', files.length, 'files');
      
      // Convert StorageFile to File if needed, or handle storage files differently
      const fileList = files as File[]; // For now, assuming File[] input
      
      const result = await processMultipleExcelFiles(fileList);
      
      if (result.success) {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${files.length} file(s) to live database.`,
          variant: "default",
        });
      } else {
        throw new Error(result.message || 'Import failed');
      }
      
    } catch (error) {
      console.error('File import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'File import failed';
      
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importSelectedFiles,
    isImporting
  };
};
