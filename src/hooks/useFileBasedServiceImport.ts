
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { processExcelFile } from '@/lib/services/excelProcessor';
import { supabase } from '@/integrations/supabase/client';
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

  const saveProcessedDataToDatabase = async (processedData: any, fileName: string) => {
    console.log('Saving processed data to database for file:', fileName);
    
    // Create or get the sector (use filename without extension as sector name)
    const sectorName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
    
    const { data: sector, error: sectorError } = await supabase
      .from('service_sectors')
      .upsert({ 
        name: sectorName,
        description: `Services from ${fileName}`,
        position: 1 
      }, { 
        onConflict: 'name',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (sectorError) {
      console.error('Error creating/updating sector:', sectorError);
      throw new Error(`Failed to save sector: ${sectorError.message}`);
    }

    let totalServicesCount = 0;
    let categoriesCount = 0;
    let subcategoriesCount = 0;

    // Process each category from the Excel file
    for (const category of processedData.categories) {
      categoriesCount++;
      
      // Create or get the category
      const { data: categoryData, error: categoryError } = await supabase
        .from('service_categories')
        .upsert({ 
          name: category.name,
          description: `Category from ${fileName}`,
          sector_id: sector.id,
          position: categoriesCount 
        }, { 
          onConflict: 'name,sector_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (categoryError) {
        console.error('Error creating/updating category:', categoryError);
        throw new Error(`Failed to save category ${category.name}: ${categoryError.message}`);
      }

      // Process subcategories
      for (const subcategory of category.subcategories) {
        subcategoriesCount++;
        
        // Create or get the subcategory
        const { data: subcategoryData, error: subcategoryError } = await supabase
          .from('service_subcategories')
          .upsert({ 
            name: subcategory.name,
            description: `Subcategory from ${fileName}`,
            category_id: categoryData.id 
          }, { 
            onConflict: 'name,category_id',
            ignoreDuplicates: false 
          })
          .select()
          .single();

        if (subcategoryError) {
          console.error('Error creating/updating subcategory:', subcategoryError);
          throw new Error(`Failed to save subcategory ${subcategory.name}: ${subcategoryError.message}`);
        }

        // Process services in this subcategory
        for (const service of subcategory.services) {
          if (service.name && service.name.trim()) {
            totalServicesCount++;
            
            const { error: serviceError } = await supabase
              .from('service_jobs')
              .upsert({ 
                name: service.name,
                description: service.description || `Service from ${fileName}`,
                subcategory_id: subcategoryData.id,
                estimated_time: service.estimatedTime || null,
                price: service.price || null 
              }, { 
                onConflict: 'name,subcategory_id',
                ignoreDuplicates: false 
              });

            if (serviceError) {
              console.error('Error creating/updating service:', serviceError);
              throw new Error(`Failed to save service ${service.name}: ${serviceError.message}`);
            }
          }
        }
      }
    }

    return {
      sectorsProcessed: 1,
      categoriesProcessed: categoriesCount,
      subcategoriesProcessed: subcategoriesCount,
      jobsProcessed: totalServicesCount
    };
  };

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
          progress: (processedFiles / totalFiles) * 70, // 70% for processing
          completed: false,
          error: null
        });

        try {
          // Process the Excel file
          const processedData = await processExcelFile(file);
          
          setImportProgress({
            stage: 'saving',
            message: `Saving ${file.name} to database...`,
            progress: (processedFiles / totalFiles) * 70 + 15, // 15% for saving
            completed: false,
            error: null
          });

          // Save processed data to database
          const saveResults = await saveProcessedDataToDatabase(processedData, file.name);
          
          // Count processed data
          totalCategories += saveResults.categoriesProcessed;
          totalSubcategories += saveResults.subcategoriesProcessed;
          totalServices += saveResults.jobsProcessed;

          console.log(`Successfully saved ${file.name}:`, saveResults);

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
        message: `Successfully imported ${processedFiles} files with ${totalServices} services across ${totalCategories} categories!`,
        progress: 100,
        completed: true,
        error: null,
        details: {
          sectorsProcessed: processedFiles,
          categoriesProcessed: totalCategories,
          subcategoriesProcessed: totalSubcategories,
          jobsProcessed: totalServices,
          totalSectors: processedFiles,
          totalCategories,
          totalSubcategories,
          totalJobs: totalServices
        }
      });

      toast({
        title: "Import Completed",
        description: `Successfully imported ${processedFiles} files with ${totalServices} services`,
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
