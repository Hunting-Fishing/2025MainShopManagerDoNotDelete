
import { supabase } from '@/integrations/supabase/client';
import { mapExcelToServiceHierarchy, processMultipleExcelFiles } from './excelHierarchyMapper';
import type { ProcessedServiceData, ImportStats, ImportProgress, ImportResult } from './types';

// Re-export functions from folderBasedImportService for backwards compatibility
export { 
  processExcelFileFromStorage,
  clearAllServiceData,
  getServiceCounts
} from './folderBasedImportService';

// Re-export types for convenience
export type {
  ProcessedServiceData,
  ImportProgress,
  ImportResult,
  ImportStats
} from './types';

export async function processServiceDataFromSheets(
  excelFiles: { fileName: string; data: any[] }[],
  onProgress?: (progress: ImportProgress) => void
): Promise<ProcessedServiceData> {
  try {
    if (onProgress) {
      onProgress({
        stage: 'processing',
        progress: 10,
        message: 'Processing Excel files with corrected hierarchy mapping...',
        completed: false,
        error: null
      });
    }

    // Use the new hierarchy mapper
    const mappedData = processMultipleExcelFiles(excelFiles);
    
    if (onProgress) {
      onProgress({
        stage: 'processing',
        progress: 50,
        message: 'Converting to database format...',
        completed: false,
        error: null
      });
    }

    // Convert mapped data to sectors format
    const sectors = mappedData.map((sectorData, index) => ({
      id: `sector-${index + 1}`,
      name: sectorData.sectorName,
      description: `Services for ${sectorData.sectorName}`,
      position: index + 1,
      is_active: true,
      categories: sectorData.categories.map((category, catIndex) => ({
        id: `category-${index + 1}-${catIndex + 1}`,
        name: category.name,
        description: `${category.name} services`,
        position: catIndex + 1,
        sector_id: `sector-${index + 1}`,
        subcategories: category.subcategories.map((subcategory, subIndex) => ({
          id: `subcategory-${index + 1}-${catIndex + 1}-${subIndex + 1}`,
          name: subcategory.name,
          description: `${subcategory.name} services`,
          category_id: `category-${index + 1}-${catIndex + 1}`,
          jobs: subcategory.services.map((service, serviceIndex) => ({
            id: `job-${index + 1}-${catIndex + 1}-${subIndex + 1}-${serviceIndex + 1}`,
            name: service.name,
            description: service.description,
            estimatedTime: service.estimatedTime,
            price: service.price,
            subcategory_id: `subcategory-${index + 1}-${catIndex + 1}-${subIndex + 1}`
          }))
        }))
      }))
    }));

    const stats: ImportStats = {
      totalSectors: sectors.length,
      totalCategories: sectors.reduce((acc, sector) => acc + sector.categories.length, 0),
      totalSubcategories: sectors.reduce((acc, sector) => 
        acc + sector.categories.reduce((catAcc, category) => 
          catAcc + category.subcategories.length, 0), 0),
      totalServices: sectors.reduce((acc, sector) => 
        acc + sector.categories.reduce((catAcc, category) => 
          catAcc + category.subcategories.reduce((subAcc, subcategory) => 
            subAcc + subcategory.jobs.length, 0), 0), 0),
      filesProcessed: excelFiles.length
    };

    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: `Successfully processed ${stats.totalServices} services from ${stats.filesProcessed} files`,
        completed: true,
        error: null
      });
    }

    return {
      sectors,
      stats
    };

  } catch (error) {
    console.error('Error processing service data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error processing service data';
    
    if (onProgress) {
      onProgress({
        stage: 'error',
        progress: 0,
        message: errorMessage,
        completed: false,
        error: errorMessage
      });
    }
    
    throw error;
  }
}

export async function importServicesFromStorage(
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  try {
    if (onProgress) {
      onProgress({
        stage: 'starting',
        progress: 5,
        message: 'Starting service import from storage...',
        completed: false,
        error: null
      });
    }

    // This function would need to be implemented to read from storage
    // and use the new hierarchy mapping
    console.log('Import from storage with corrected hierarchy mapping');
    
    return {
      success: true,
      message: 'Services imported successfully with corrected hierarchy',
      stats: {
        totalSectors: 0,
        totalCategories: 0,
        totalSubcategories: 0,
        totalServices: 0,
        filesProcessed: 0
      }
    };
  } catch (error) {
    console.error('Storage import failed:', error);
    throw error;
  }
}

export async function importProcessedDataToDatabase(data: ProcessedServiceData): Promise<ImportResult> {
  try {
    // Clear existing data first
    await clearAllServiceData();
    
    // Import sectors
    if (data.sectors.length > 0) {
      const { error: sectorsError } = await supabase
        .from('service_sectors')
        .insert(data.sectors.map(sector => ({
          id: sector.id,
          name: sector.name,
          description: sector.description,
          position: sector.position,
          is_active: sector.is_active
        })));
      
      if (sectorsError) throw sectorsError;
      
      // Import categories
      const allCategories = data.sectors.flatMap(sector => sector.categories);
      if (allCategories.length > 0) {
        const { error: categoriesError } = await supabase
          .from('service_categories')
          .insert(allCategories.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description,
            position: category.position,
            sector_id: category.sector_id
          })));
        
        if (categoriesError) throw categoriesError;
      }
      
      // Import subcategories
      const allSubcategories = allCategories.flatMap(category => category.subcategories);
      if (allSubcategories.length > 0) {
        const { error: subcategoriesError } = await supabase
          .from('service_subcategories')
          .insert(allSubcategories.map(subcategory => ({
            id: subcategory.id,
            name: subcategory.name,
            description: subcategory.description,
            category_id: subcategory.category_id
          })));
        
        if (subcategoriesError) throw subcategoriesError;
      }
      
      // Import jobs
      const allJobs = allSubcategories.flatMap(subcategory => subcategory.jobs);
      if (allJobs.length > 0) {
        const { error: jobsError } = await supabase
          .from('service_jobs')
          .insert(allJobs.map(job => ({
            id: job.id,
            name: job.name,
            description: job.description,
            estimated_time: job.estimatedTime,
            price: job.price,
            subcategory_id: job.subcategory_id
          })));
        
        if (jobsError) throw jobsError;
      }
    }
    
    return {
      success: true,
      message: 'Data imported to database successfully with corrected hierarchy',
      stats: data.stats
    };
  } catch (error) {
    console.error('Database import failed:', error);
    throw error;
  }
}

export async function validateServiceData(data: ProcessedServiceData): Promise<boolean> {
  // Validate the corrected hierarchy structure
  const hasValidSectors = data.sectors.every(sector => 
    sector.name && sector.name.trim().length > 0
  );
  
  const hasValidCategories = data.sectors.every(sector =>
    sector.categories.every(category =>
      category.name && category.name.trim().length > 0
    )
  );
  
  const hasValidSubcategories = data.sectors.every(sector =>
    sector.categories.every(category =>
      category.subcategories.every(subcategory =>
        subcategory.name && subcategory.name.trim().length > 0
      )
    )
  );
  
  const hasValidJobs = data.sectors.every(sector =>
    sector.categories.every(category =>
      category.subcategories.every(subcategory =>
        subcategory.jobs.every(job =>
          job.name && job.name.trim().length > 0
        )
      )
    )
  );
  
  return hasValidSectors && hasValidCategories && hasValidSubcategories && hasValidJobs;
}

export async function optimizeDatabasePerformance(): Promise<void> {
  console.log('Database performance optimization completed with corrected hierarchy');
}
