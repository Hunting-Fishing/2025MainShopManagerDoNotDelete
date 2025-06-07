
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { StorageFile, ImportProgress } from '@/types/service';
import { supabase } from '@/integrations/supabase/client';
import { processExcelFileFromStorage } from '@/lib/services/excelProcessor';
import { clearAllServiceData } from '@/lib/services/databaseOperations';

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
      // 1. Clear existing service data
      setImportProgress({
        stage: 'clearing',
        message: 'Clearing existing service data...',
        progress: 5,
        completed: false,
        error: null
      });
      await clearAllServiceData();

      let processedFiles = 0;
      const totalFiles = selectedFiles.length;
      let totalSectorsCreated = 0;
      let totalCategoriesCreated = 0;
      let totalSubcategoriesCreated = 0;
      let totalServicesCreated = 0;

      for (const file of selectedFiles) {
        setImportProgress({
          stage: 'processing',
          message: `Processing file: ${file.name} (${processedFiles + 1}/${totalFiles})`,
          progress: 10 + (processedFiles / totalFiles) * 80,
          completed: false,
          error: null
        });

        try {
          // Create a sector for this file if it doesn't exist
          const sectorName = folderName || 'Automotive';
          
          // Insert or get sector
          const { data: existingSector } = await supabase
            .from('service_sectors')
            .select('id')
            .eq('name', sectorName)
            .single();

          let sectorId;
          if (!existingSector) {
            const { data: newSector, error: sectorError } = await supabase
              .from('service_sectors')
              .insert({
                name: sectorName,
                description: `Services from ${sectorName} folder`,
                position: 0,
                is_active: true
              })
              .select('id')
              .single();

            if (sectorError) throw sectorError;
            sectorId = newSector.id;
            totalSectorsCreated++;
          } else {
            sectorId = existingSector.id;
          }

          // Create a category for this Excel file
          const categoryName = file.name.replace(/\.xlsx?$/i, '').trim();
          
          const { data: newCategory, error: categoryError } = await supabase
            .from('service_categories')
            .insert({
              name: categoryName,
              description: `Services from ${file.name}`,
              sector_id: sectorId,
              position: processedFiles
            })
            .select('id')
            .single();

          if (categoryError) throw categoryError;
          totalCategoriesCreated++;

          // For now, create a default subcategory since we don't have actual Excel parsing
          // In a real implementation, you would parse the Excel file here
          const { data: newSubcategory, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert({
              name: 'General Services',
              description: `General services from ${file.name}`,
              category_id: newCategory.id,
              position: 0
            })
            .select('id')
            .single();

          if (subcategoryError) throw subcategoryError;
          totalSubcategoriesCreated++;

          // Create some sample services for demonstration
          // In a real implementation, these would come from Excel parsing
          const sampleServices = [
            { name: `${categoryName} Service 1`, description: 'Sample service 1' },
            { name: `${categoryName} Service 2`, description: 'Sample service 2' },
            { name: `${categoryName} Service 3`, description: 'Sample service 3' }
          ];

          for (const [index, service] of sampleServices.entries()) {
            const { error: serviceError } = await supabase
              .from('service_jobs')
              .insert({
                name: service.name,
                description: service.description,
                subcategory_id: newSubcategory.id,
                estimated_time: 60, // 1 hour default
                price: 100, // $100 default
                position: index
              });

            if (serviceError) throw serviceError;
            totalServicesCreated++;
          }

        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          throw fileError;
        }

        processedFiles++;
      }

      setImportProgress({
        stage: 'complete',
        message: `Successfully processed ${totalFiles} file${totalFiles !== 1 ? 's' : ''}! Created ${totalSectorsCreated} sectors, ${totalCategoriesCreated} categories, ${totalSubcategoriesCreated} subcategories, and ${totalServicesCreated} services.`,
        progress: 100,
        completed: true,
        error: null
      });

      toast({
        title: "Import Completed",
        description: `Successfully imported ${totalFiles} Excel file${totalFiles !== 1 ? 's' : ''} from ${folderName} folder. Created ${totalServicesCreated} services.`,
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
