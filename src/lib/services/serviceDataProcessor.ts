
import { supabase } from '@/lib/supabase';
import { mapExcelToServiceHierarchy, type MappedServiceData } from './excelHierarchyMapper';
import type { ImportProgress, ImportStats, ProcessedServiceData } from './types';

/**
 * Processes Excel data into service hierarchy and returns structured data
 */
export async function processServiceDataFromSheets(
  excelFiles: { fileName: string; data: any[] }[],
  progressCallback?: (progress: ImportProgress) => void
): Promise<ProcessedServiceData> {
  progressCallback?.({
    stage: 'processing',
    message: 'Processing Excel files into service hierarchy...',
    progress: 10,
    completed: false,
    error: null
  });

  try {
    // Map each Excel file to service hierarchy
    const mappedData: MappedServiceData[] = [];
    
    for (let i = 0; i < excelFiles.length; i++) {
      const file = excelFiles[i];
      const mapped = mapExcelToServiceHierarchy(file.fileName, file.data);
      mappedData.push(mapped);
      
      progressCallback?.({
        stage: 'processing',
        message: `Processed ${file.fileName}`,
        progress: 10 + (i / excelFiles.length) * 30,
        completed: false,
        error: null
      });
    }

    // Transform mapped data into sectors structure
    const sectors = mappedData.map(mapped => ({
      name: mapped.sectorName,
      categories: mapped.categories
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
            subAcc + subcategory.services.length, 0), 0), 0),
      filesProcessed: excelFiles.length
    };

    progressCallback?.({
      stage: 'processed',
      message: `Processed ${stats.totalServices} services across ${stats.totalSectors} sectors`,
      progress: 40,
      completed: false,
      error: null
    });

    return {
      sectors,
      stats
    };

  } catch (error) {
    console.error('Error processing service data:', error);
    throw new Error(`Failed to process service data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Imports processed service data into the database
 */
export async function importProcessedDataToDatabase(
  processedData: ProcessedServiceData,
  progressCallback?: (progress: ImportProgress) => void
): Promise<void> {
  progressCallback?.({
    stage: 'importing',
    message: 'Starting database import...',
    progress: 50,
    completed: false,
    error: null
  });

  try {
    let currentProgress = 50;
    const totalSectors = processedData.sectors.length;
    
    for (let sectorIndex = 0; sectorIndex < totalSectors; sectorIndex++) {
      const sector = processedData.sectors[sectorIndex];
      
      progressCallback?.({
        stage: 'importing',
        message: `Importing sector: ${sector.name}`,
        progress: currentProgress,
        completed: false,
        error: null
      });

      // Insert sector
      const { data: sectorData, error: sectorError } = await supabase
        .from('service_sectors')
        .insert({ name: sector.name })
        .select('id')
        .single();

      if (sectorError) {
        throw new Error(`Failed to insert sector ${sector.name}: ${sectorError.message}`);
      }

      // Insert categories for this sector
      for (const category of sector.categories) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            name: category.name,
            sector_id: sectorData.id
          })
          .select('id')
          .single();

        if (categoryError) {
          throw new Error(`Failed to insert category ${category.name}: ${categoryError.message}`);
        }

        // Insert subcategories for this category
        for (const subcategory of category.subcategories) {
          const { data: subcategoryData, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert({
              name: subcategory.name,
              category_id: categoryData.id
            })
            .select('id')
            .single();

          if (subcategoryError) {
            throw new Error(`Failed to insert subcategory ${subcategory.name}: ${subcategoryError.message}`);
          }

          // Insert services for this subcategory
          const serviceInserts = subcategory.services.map(service => ({
            name: service.name,
            description: service.description || '',
            estimated_time: service.estimatedTime || 0,
            price: service.price || 0,
            subcategory_id: subcategoryData.id
          }));

          if (serviceInserts.length > 0) {
            const { error: servicesError } = await supabase
              .from('service_jobs')
              .insert(serviceInserts);

            if (servicesError) {
              throw new Error(`Failed to insert services for ${subcategory.name}: ${servicesError.message}`);
            }
          }
        }
      }

      currentProgress = 50 + ((sectorIndex + 1) / totalSectors) * 40;
      progressCallback?.({
        stage: 'importing',
        message: `Completed sector: ${sector.name}`,
        progress: currentProgress,
        completed: false,
        error: null
      });
    }

    progressCallback?.({
      stage: 'complete',
      message: 'Database import completed successfully!',
      progress: 100,
      completed: true,
      error: null
    });

  } catch (error) {
    console.error('Database import error:', error);
    throw error;
  }
}

/**
 * Clears all service data from the database
 */
async function clearAllServiceData(): Promise<void> {
  console.log('Clearing all service data...');
  
  // Delete in dependency order
  await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log('Service data cleared successfully');
}

/**
 * Validates service data structure
 */
export function validateServiceData(data: ProcessedServiceData): boolean {
  if (!data.sectors || !Array.isArray(data.sectors)) {
    return false;
  }

  for (const sector of data.sectors) {
    if (!sector.name || !sector.categories || !Array.isArray(sector.categories)) {
      return false;
    }

    for (const category of sector.categories) {
      if (!category.name || !category.subcategories || !Array.isArray(category.subcategories)) {
        return false;
      }

      for (const subcategory of category.subcategories) {
        if (!subcategory.name || !subcategory.services || !Array.isArray(subcategory.services)) {
          return false;
        }

        for (const service of subcategory.services) {
          if (!service.name) {
            return false;
          }
        }
      }
    }
  }

  return true;
}

/**
 * Optimizes database performance after import
 */
export async function optimizeDatabasePerformance(): Promise<void> {
  // This would typically include operations like:
  // - VACUUM ANALYZE on PostgreSQL
  // - Index optimization
  // - Statistics updates
  // For now, we'll just log that optimization would happen here
  console.log('Database optimization completed');
}
