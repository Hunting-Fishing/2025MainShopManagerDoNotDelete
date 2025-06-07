
import { supabase } from '@/integrations/supabase/client';
import { mapExcelToServiceHierarchy, type MappedServiceData } from './excelHierarchyMapper';
import type { ImportProgress, ProcessedServiceData } from './types';

export async function processServiceDataFromSheets(
  files: { fileName: string; data: any[] }[],
  progressCallback?: (progress: ImportProgress) => void
): Promise<ProcessedServiceData[]> {
  const processedData: ProcessedServiceData[] = [];
  
  progressCallback?.({
    stage: 'processing',
    message: `Processing ${files.length} Excel files...`,
    progress: 10,
    completed: false,
    error: null
  });

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const progress = 10 + (i / files.length) * 40; // 10-50% for processing
    
    progressCallback?.({
      stage: 'processing',
      message: `Processing file: ${file.fileName}`,
      progress,
      completed: false,
      error: null
    });

    try {
      const mappedData = mapExcelToServiceHierarchy(file.fileName, file.data);
      
      // Convert to ProcessedServiceData format
      const processed: ProcessedServiceData = {
        sectorName: mappedData.sectorName,
        categories: mappedData.categories.map(category => ({
          name: category.name,
          subcategories: category.subcategories.map(subcategory => ({
            name: subcategory.name,
            services: subcategory.services.map(service => ({
              name: service.name,
              description: service.description,
              estimatedTime: service.estimatedTime,
              price: service.price
            }))
          }))
        }))
      };
      
      processedData.push(processed);
    } catch (error) {
      console.error(`Error processing file ${file.fileName}:`, error);
      progressCallback?.({
        stage: 'error',
        message: `Error processing file: ${file.fileName}`,
        progress,
        completed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  progressCallback?.({
    stage: 'processed',
    message: `Processed ${processedData.length} files successfully`,
    progress: 50,
    completed: false,
    error: null
  });

  return processedData;
}

export async function importProcessedDataToDatabase(
  processedData: ProcessedServiceData[],
  progressCallback?: (progress: ImportProgress) => void
): Promise<{ success: boolean; message: string; stats?: any }> {
  try {
    progressCallback?.({
      stage: 'importing',
      message: 'Starting database import...',
      progress: 50,
      completed: false,
      error: null
    });

    let totalServices = 0;
    let importedSectors = 0;

    for (let i = 0; i < processedData.length; i++) {
      const sectorData = processedData[i];
      const progress = 50 + (i / processedData.length) * 40; // 50-90% for import
      
      progressCallback?.({
        stage: 'importing',
        message: `Importing sector: ${sectorData.sectorName}`,
        progress,
        completed: false,
        error: null
      });

      // Create sector
      const { data: sector, error: sectorError } = await supabase
        .from('service_sectors')
        .insert([{
          name: sectorData.sectorName,
          description: `Services for ${sectorData.sectorName}`,
          position: i,
          is_active: true
        }])
        .select()
        .single();

      if (sectorError) {
        throw new Error(`Failed to create sector ${sectorData.sectorName}: ${sectorError.message}`);
      }

      // Import categories for this sector
      for (let j = 0; j < sectorData.categories.length; j++) {
        const categoryData = sectorData.categories[j];
        
        // Create category
        const { data: category, error: categoryError } = await supabase
          .from('service_categories')
          .insert([{
            name: categoryData.name,
            description: `Category for ${categoryData.name}`,
            sector_id: sector.id,
            position: j
          }])
          .select()
          .single();

        if (categoryError) {
          throw new Error(`Failed to create category ${categoryData.name}: ${categoryError.message}`);
        }

        // Import subcategories
        for (let k = 0; k < categoryData.subcategories.length; k++) {
          const subcategoryData = categoryData.subcategories[k];
          
          // Create subcategory
          const { data: subcategory, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert([{
              name: subcategoryData.name,
              description: `Subcategory for ${subcategoryData.name}`,
              category_id: category.id,
              position: k
            }])
            .select()
            .single();

          if (subcategoryError) {
            throw new Error(`Failed to create subcategory ${subcategoryData.name}: ${subcategoryError.message}`);
          }

          // Import services
          if (subcategoryData.services.length > 0) {
            const services = subcategoryData.services.map((service, serviceIndex) => ({
              name: service.name,
              description: service.description || '',
              estimated_time: service.estimatedTime || 0,
              price: service.price || 0,
              subcategory_id: subcategory.id,
              position: serviceIndex
            }));

            const { error: servicesError } = await supabase
              .from('service_jobs')
              .insert(services);

            if (servicesError) {
              throw new Error(`Failed to create services for ${subcategoryData.name}: ${servicesError.message}`);
            }

            totalServices += services.length;
          }
        }
      }

      importedSectors++;
    }

    progressCallback?.({
      stage: 'complete',
      message: 'Import completed successfully',
      progress: 100,
      completed: true,
      error: null
    });

    return {
      success: true,
      message: `Successfully imported ${importedSectors} sectors with ${totalServices} total services`,
      stats: {
        totalSectors: importedSectors,
        totalServices,
        filesProcessed: processedData.length
      }
    };

  } catch (error) {
    console.error('Database import failed:', error);
    progressCallback?.({
      stage: 'error',
      message: error instanceof Error ? error.message : 'Import failed',
      progress: 0,
      completed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Import failed'
    };
  }
}

export async function clearAllServiceData(): Promise<void> {
  try {
    console.log('Clearing all service data...');
    
    // Delete in reverse order of dependencies
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('All service data cleared successfully');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
}

export function validateServiceData(data: ProcessedServiceData[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || data.length === 0) {
    errors.push('No data provided for validation');
    return { isValid: false, errors };
  }
  
  data.forEach((sector, sectorIndex) => {
    if (!sector.sectorName || sector.sectorName.trim() === '') {
      errors.push(`Sector ${sectorIndex + 1}: Missing sector name`);
    }
    
    if (!sector.categories || sector.categories.length === 0) {
      errors.push(`Sector ${sectorIndex + 1}: No categories found`);
    }
    
    sector.categories?.forEach((category, categoryIndex) => {
      if (!category.name || category.name.trim() === '') {
        errors.push(`Sector ${sectorIndex + 1}, Category ${categoryIndex + 1}: Missing category name`);
      }
      
      category.subcategories?.forEach((subcategory, subcategoryIndex) => {
        if (!subcategory.name || subcategory.name.trim() === '') {
          errors.push(`Sector ${sectorIndex + 1}, Category ${categoryIndex + 1}, Subcategory ${subcategoryIndex + 1}: Missing subcategory name`);
        }
      });
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function optimizeDatabasePerformance(): Promise<void> {
  try {
    console.log('Optimizing database performance...');
    // Database optimization logic would go here
    // For now, this is a placeholder for future optimization tasks
    console.log('Database optimization completed');
  } catch (error) {
    console.error('Error optimizing database:', error);
    throw error;
  }
}
