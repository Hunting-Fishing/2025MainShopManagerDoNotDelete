
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { processExcelFile } from '@/lib/services/excelProcessor';
import { ImportProgress } from '@/types/service';

export function useFileBasedServiceImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: '',
    message: '',
    progress: 0,
    completed: false,
    error: null
  });
  
  const { toast } = useToast();

  const importSelectedFiles = async (files: File[]) => {
    if (!files || files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select Excel files to import",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress({
      stage: 'starting',
      message: 'Starting file import process...',
      progress: 0,
      completed: false,
      error: null
    });

    try {
      const totalFiles = files.length;
      let processedFiles = 0;
      let totalServices = 0;
      let totalCategories = 0;
      let totalSubcategories = 0;

      for (const file of files) {
        setImportProgress({
          stage: 'processing',
          message: `Processing ${file.name}...`,
          progress: (processedFiles / totalFiles) * 90,
          completed: false,
          error: null
        });

        try {
          const processedData = await processExcelFile(file);
          
          // Count processed data
          totalCategories += processedData.categories.length;
          totalSubcategories += processedData.categories.reduce((acc, cat) => acc + cat.subcategories.length, 0);
          totalServices += processedData.categories.reduce((acc, cat) => 
            acc + cat.subcategories.reduce((subAcc, sub) => subAcc + sub.services.length, 0), 0);

          console.log(`Processed ${file.name}:`, {
            categories: processedData.categories.length,
            subcategories: processedData.categories.reduce((acc, cat) => acc + cat.subcategories.length, 0),
            services: processedData.categories.reduce((acc, cat) => 
              acc + cat.subcategories.reduce((subAcc, sub) => subAcc + sub.services.length, 0), 0)
          });

          processedFiles++;
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          toast({
            title: "File Processing Error",
            description: `Failed to process ${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      }

      setImportProgress({
        stage: 'complete',
        message: `Successfully processed ${processedFiles} files with ${totalServices} services across ${totalCategories} categories!`,
        progress: 100,
        completed: true,
        error: null,
        details: {
          sectorsProcessed: 1,
          categoriesProcessed: totalCategories,
          subcategoriesProcessed: totalSubcategories,
          jobsProcessed: totalServices,
          totalSectors: 1,
          totalCategories,
          totalSubcategories,
          totalJobs: totalServices
        }
      });

      toast({
        title: "Import Completed",
        description: `Successfully processed ${processedFiles} files with ${totalServices} services`,
        variant: "default",
      });

    } catch (error) {
      console.error('File import failed:', error);
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
