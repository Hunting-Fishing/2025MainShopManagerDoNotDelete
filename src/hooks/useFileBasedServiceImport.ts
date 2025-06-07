
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { supabase } from '@/integrations/supabase/client';
import { 
  clearAllServiceData
} from '@/lib/services';
import { StorageFile, ImportProgress } from '@/types/service';
import * as XLSX from 'xlsx';

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

  const downloadAndParseExcelFile = async (filePath: string) => {
    try {
      // Download file from Supabase storage
      const { data, error } = await supabase.storage
        .from('service-data')
        .download(filePath);
      
      if (error) throw error;
      
      // Parse Excel file
      const arrayBuffer = await data.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get first worksheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      return jsonData;
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw error;
    }
  };

  const importSelectedFiles = async (selectedFiles: StorageFile[]) => {
    setIsImporting(true);
    setImportProgress({
      stage: 'starting',
      message: 'Starting file-based import...',
      progress: 0,
      completed: false,
      error: null
    });
    
    try {
      // Clear existing data first
      setImportProgress({
        stage: 'clearing',
        message: 'Clearing existing service data...',
        progress: 5,
        completed: false,
        error: null
      });
      
      await clearAllServiceData();
      
      let totalSectors = 0;
      let totalCategories = 0;
      let totalSubcategories = 0;
      let totalServices = 0;
      
      // Process each selected file
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const progress = 10 + (i / selectedFiles.length) * 80;
        
        setImportProgress({
          stage: 'processing',
          message: `Processing ${file.name}...`,
          progress,
          completed: false,
          error: null
        });
        
        try {
          // Parse Excel file
          const excelData = await downloadAndParseExcelFile(file.path || file.name);
          
          if (!excelData || excelData.length === 0) {
            console.warn(`No data found in file: ${file.name}`);
            continue;
          }
          
          // Extract sector name from file path or name
          const sectorName = file.path?.split('/')[0] || 'automotive';
          const categoryName = file.name.replace(/\.xlsx?$/i, '');
          
          // Create or get sector
          const { data: existingSector } = await supabase
            .from('service_sectors')
            .select('id')
            .eq('name', sectorName)
            .single();
          
          let sectorId;
          if (existingSector) {
            sectorId = existingSector.id;
          } else {
            const { data: newSector, error: sectorError } = await supabase
              .from('service_sectors')
              .insert({ 
                name: sectorName, 
                description: `${sectorName} services`,
                position: totalSectors + 1 
              })
              .select('id')
              .single();
            
            if (sectorError) throw sectorError;
            sectorId = newSector.id;
            totalSectors++;
          }
          
          // Create category
          const { data: category, error: categoryError } = await supabase
            .from('service_categories')
            .insert({ 
              name: categoryName,
              description: `Services for ${categoryName}`,
              sector_id: sectorId,
              position: totalCategories + 1
            })
            .select('id')
            .single();
          
          if (categoryError) throw categoryError;
          totalCategories++;
          
          // Group services by subcategory
          const subcategoryGroups = new Map();
          
          excelData.forEach((row: any) => {
            // Try different column name variations
            const subcategoryName = row['Subcategory'] || 
                                  row['subcategory'] || 
                                  row['Sub Category'] || 
                                  row['Category'] ||
                                  Object.values(row)[0] as string || 
                                  'General Services';
            
            const serviceName = row['Service'] || 
                              row['service'] || 
                              row['Service Name'] || 
                              row['name'] ||
                              Object.values(row)[1] as string ||
                              'Service';
            
            const description = row['Description'] || 
                              row['description'] || 
                              Object.values(row)[2] as string || 
                              '';
            
            const estimatedTime = parseInt(row['Estimated Time'] || row['Time'] || row['Minutes'] || '60');
            const price = parseFloat(row['Price'] || row['Cost'] || '0');
            
            if (!subcategoryGroups.has(subcategoryName)) {
              subcategoryGroups.set(subcategoryName, []);
            }
            
            subcategoryGroups.get(subcategoryName).push({
              name: serviceName,
              description,
              estimatedTime: isNaN(estimatedTime) ? 60 : estimatedTime,
              price: isNaN(price) ? 0 : price
            });
          });
          
          // Create subcategories and services
          for (const [subcategoryName, services] of subcategoryGroups) {
            const { data: subcategory, error: subcategoryError } = await supabase
              .from('service_subcategories')
              .insert({ 
                name: subcategoryName,
                description: `${subcategoryName} services`,
                category_id: category.id
              })
              .select('id')
              .single();
            
            if (subcategoryError) throw subcategoryError;
            totalSubcategories++;
            
            // Create services
            for (const service of services) {
              const { error: serviceError } = await supabase
                .from('service_jobs')
                .insert({
                  name: service.name,
                  description: service.description,
                  estimated_time: service.estimatedTime,
                  price: service.price,
                  subcategory_id: subcategory.id
                });
              
              if (serviceError) throw serviceError;
              totalServices++;
            }
          }
          
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          // Continue with other files
        }
      }
      
      setImportProgress({
        stage: 'complete',
        message: `Import completed! Created ${totalSectors} sectors, ${totalCategories} categories, ${totalSubcategories} subcategories, and ${totalServices} services.`,
        progress: 100,
        completed: true,
        error: null,
        details: {
          sectorsProcessed: totalSectors,
          categoriesProcessed: totalCategories,
          subcategoriesProcessed: totalSubcategories,
          jobsProcessed: totalServices,
          totalSectors,
          totalCategories,
          totalSubcategories,
          totalJobs: totalServices
        }
      });
      
      // Refresh the data
      setTimeout(async () => {
        await refetch();
      }, 1000);
      
      toast({
        title: "Import Completed Successfully",
        description: `Imported ${totalServices} services across ${totalCategories} categories from ${selectedFiles.length} files.`,
        variant: "default",
      });
      
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
      description: "Service import was cancelled",
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
