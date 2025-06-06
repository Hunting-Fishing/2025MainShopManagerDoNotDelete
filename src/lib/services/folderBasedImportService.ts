
import { supabase } from '@/integrations/supabase/client';
import { storageService } from './unifiedStorageService';

// Define types locally to avoid circular imports
export interface ProcessedServiceData {
  sectorName: string;
  categories: {
    name: string;
    subcategories: {
      name: string;
      jobs: {
        name: string;
        description?: string;
        estimatedTime?: number;
        price?: number;
      }[];
    }[];
  }[];
}

export interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats?: ImportStats;
}

export interface ImportStats {
  sectorsProcessed: number;
  categoriesProcessed: number;
  subcategoriesProcessed: number;
  jobsProcessed: number;
  errors: string[];
}

// Export the main import function
export async function importServicesFromStorage(
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  try {
    onProgress?.({
      stage: 'checking',
      message: 'Checking storage bucket...',
      progress: 10,
      completed: false,
      error: null
    });

    // Check if bucket exists
    const bucketExists = await storageService.checkBucketExists('service-data');
    if (!bucketExists) {
      throw new Error('Service data bucket does not exist');
    }

    onProgress?.({
      stage: 'loading',
      message: 'Loading files from storage...',
      progress: 20,
      completed: false,
      error: null
    });

    // Get all files from the bucket
    const bucketInfo = await storageService.getBucketInfo('service-data');
    if (!bucketInfo.files || bucketInfo.files.length === 0) {
      throw new Error('No files found in service data bucket');
    }

    onProgress?.({
      stage: 'processing',
      message: 'Processing service data files...',
      progress: 40,
      completed: false,
      error: null
    });

    // Process the files into structured data
    const processedData = await processFilesFromStorage(bucketInfo.files);

    onProgress?.({
      stage: 'validating',
      message: 'Validating service data...',
      progress: 60,
      completed: false,
      error: null
    });

    // Validate the data
    const validationErrors = await validateServiceData(processedData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    onProgress?.({
      stage: 'importing',
      message: 'Importing to database...',
      progress: 80,
      completed: false,
      error: null
    });

    // Import to database
    const importStats = await importProcessedDataToDatabase(processedData);

    onProgress?.({
      stage: 'complete',
      message: 'Import completed successfully!',
      progress: 100,
      completed: true,
      error: null
    });

    return {
      success: true,
      message: `Successfully imported ${importStats.sectorsProcessed} sectors, ${importStats.categoriesProcessed} categories, ${importStats.subcategoriesProcessed} subcategories, and ${importStats.jobsProcessed} jobs`,
      stats: importStats
    };

  } catch (error) {
    console.error('Import failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Import failed with unknown error'
    };
  }
}

async function processFilesFromStorage(files: any[]): Promise<ProcessedServiceData[]> {
  // This is a placeholder - in reality you'd process Excel/CSV files
  const processedData: ProcessedServiceData[] = [];
  
  for (const file of files) {
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
      // Process each file and extract service data
      // For now, return mock data
      processedData.push({
        sectorName: 'Automotive',
        categories: [{
          name: 'Engine',
          subcategories: [{
            name: 'Oil Change',
            jobs: [{
              name: 'Standard Oil Change',
              description: 'Change engine oil and filter',
              estimatedTime: 30,
              price: 45.00
            }]
          }]
        }]
      });
    }
  }
  
  return processedData;
}

async function validateServiceData(data: ProcessedServiceData[]): Promise<string[]> {
  const errors: string[] = [];
  
  for (const sectorData of data) {
    if (!sectorData.sectorName || sectorData.sectorName.trim() === '') {
      errors.push('Sector name is required');
    }
    
    for (const category of sectorData.categories) {
      if (!category.name || category.name.trim() === '') {
        errors.push(`Category name is required in sector: ${sectorData.sectorName}`);
      }
      
      for (const subcategory of category.subcategories) {
        if (!subcategory.name || subcategory.name.trim() === '') {
          errors.push(`Subcategory name is required in category: ${category.name}`);
        }
        
        for (const job of subcategory.jobs) {
          if (!job.name || job.name.trim() === '') {
            errors.push(`Job name is required in subcategory: ${subcategory.name}`);
          }
        }
      }
    }
  }
  
  return errors;
}

async function importProcessedDataToDatabase(data: ProcessedServiceData[]): Promise<ImportStats> {
  const stats: ImportStats = {
    sectorsProcessed: 0,
    categoriesProcessed: 0,
    subcategoriesProcessed: 0,
    jobsProcessed: 0,
    errors: []
  };

  for (const sectorData of data) {
    try {
      // Insert sector
      const { data: sector, error: sectorError } = await supabase
        .from('service_sectors')
        .insert([{
          name: sectorData.sectorName,
          description: `Imported sector: ${sectorData.sectorName}`,
          position: stats.sectorsProcessed + 1
        }])
        .select()
        .single();

      if (sectorError) {
        stats.errors.push(`Failed to insert sector ${sectorData.sectorName}: ${sectorError.message}`);
        continue;
      }

      stats.sectorsProcessed++;

      // Insert categories for this sector
      for (const categoryData of sectorData.categories) {
        const { data: category, error: categoryError } = await supabase
          .from('service_categories')
          .insert([{
            sector_id: sector.id,
            name: categoryData.name,
            description: `Category in ${sectorData.sectorName}`
          }])
          .select()
          .single();

        if (categoryError) {
          stats.errors.push(`Failed to insert category ${categoryData.name}: ${categoryError.message}`);
          continue;
        }

        stats.categoriesProcessed++;

        // Insert subcategories for this category
        for (const subcategoryData of categoryData.subcategories) {
          const { data: subcategory, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert([{
              category_id: category.id,
              name: subcategoryData.name,
              description: `Subcategory in ${categoryData.name}`
            }])
            .select()
            .single();

          if (subcategoryError) {
            stats.errors.push(`Failed to insert subcategory ${subcategoryData.name}: ${subcategoryError.message}`);
            continue;
          }

          stats.subcategoriesProcessed++;

          // Insert jobs for this subcategory
          for (const jobData of subcategoryData.jobs) {
            const { error: jobError } = await supabase
              .from('service_jobs')
              .insert([{
                subcategory_id: subcategory.id,
                name: jobData.name,
                description: jobData.description,
                estimated_time: jobData.estimatedTime,
                price: jobData.price
              }]);

            if (jobError) {
              stats.errors.push(`Failed to insert job ${jobData.name}: ${jobError.message}`);
              continue;
            }

            stats.jobsProcessed++;
          }
        }
      }
    } catch (error) {
      stats.errors.push(`Error processing sector ${sectorData.sectorName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return stats;
}

// Export additional utility functions
export async function processExcelFileFromStorage(filePath: string): Promise<ProcessedServiceData[]> {
  // Placeholder for Excel processing
  return [];
}

export async function clearAllServiceData(): Promise<void> {
  // Clear all service data from the database
  await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

export async function getServiceCounts(): Promise<{ sectors: number; categories: number; subcategories: number; jobs: number }> {
  const [sectorsResult, categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
    supabase.from('service_sectors').select('id', { count: 'exact', head: true }),
    supabase.from('service_categories').select('id', { count: 'exact', head: true }),
    supabase.from('service_subcategories').select('id', { count: 'exact', head: true }),
    supabase.from('service_jobs').select('id', { count: 'exact', head: true })
  ]);

  return {
    sectors: sectorsResult.count || 0,
    categories: categoriesResult.count || 0,
    subcategories: subcategoriesResult.count || 0,
    jobs: jobsResult.count || 0
  };
}

// Re-export functions for serviceDataProcessor
export { validateServiceData as processServiceDataFromSheets };
export { importProcessedDataToDatabase };
