
import { storageService, type SectorFiles } from './unifiedStorageService';
import { supabase } from '@/integrations/supabase/client';

export interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
}

export interface ImportStats {
  sectorsProcessed: number;
  categoriesCreated: number;
  subcategoriesCreated: number;
  jobsCreated: number;
  errors: string[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats: ImportStats;
}

export interface ProcessedServiceData {
  sectorName: string;
  categories: Array<{
    name: string;
    subcategories: Array<{
      name: string;
      jobs: Array<{
        name: string;
        description?: string;
        estimatedTime?: number;
        price?: number;
      }>;
    }>;
  }>;
}

// Function to process Excel file data from storage
export async function processExcelFileFromStorage(
  bucketName: string,
  filePath: string
): Promise<ProcessedServiceData[]> {
  try {
    console.log(`Processing Excel file: ${filePath}`);
    
    // Download the file from storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);
    
    if (error) {
      throw new Error(`Failed to download file ${filePath}: ${error.message}`);
    }
    
    if (!data) {
      throw new Error(`No data received for file ${filePath}`);
    }
    
    // For now, return mock data structure
    // In a real implementation, you would parse the Excel file here
    const sectorName = filePath.split('/')[0] || 'Unknown Sector';
    
    return [{
      sectorName,
      categories: [{
        name: 'Sample Category',
        subcategories: [{
          name: 'Sample Subcategory',
          jobs: [{
            name: 'Sample Job',
            description: 'Sample job description',
            estimatedTime: 60,
            price: 100
          }]
        }]
      }]
    }];
  } catch (error) {
    console.error(`Error processing Excel file ${filePath}:`, error);
    throw error;
  }
}

// Function to process service data from sheets (placeholder implementation)
export function processServiceDataFromSheets(data: any): ProcessedServiceData[] {
  // This would contain the actual Excel parsing logic
  // For now, return the data as-is if it's already in the correct format
  if (Array.isArray(data)) {
    return data;
  }
  
  // Convert single data object to array format
  return [data];
}

// Function to import processed data to database
export async function importProcessedDataToDatabase(
  processedData: ProcessedServiceData[]
): Promise<ImportStats> {
  const stats: ImportStats = {
    sectorsProcessed: 0,
    categoriesCreated: 0,
    subcategoriesCreated: 0,
    jobsCreated: 0,
    errors: []
  };
  
  try {
    for (const sectorData of processedData) {
      // Insert sector
      const { data: sector, error: sectorError } = await supabase
        .from('service_sectors')
        .upsert({ name: sectorData.sectorName })
        .select()
        .single();
      
      if (sectorError) {
        stats.errors.push(`Failed to create sector ${sectorData.sectorName}: ${sectorError.message}`);
        continue;
      }
      
      stats.sectorsProcessed++;
      
      // Process categories
      for (const categoryData of sectorData.categories) {
        const { data: category, error: categoryError } = await supabase
          .from('service_categories')
          .upsert({ 
            name: categoryData.name,
            sector_id: sector.id 
          })
          .select()
          .single();
        
        if (categoryError) {
          stats.errors.push(`Failed to create category ${categoryData.name}: ${categoryError.message}`);
          continue;
        }
        
        stats.categoriesCreated++;
        
        // Process subcategories
        for (const subcategoryData of categoryData.subcategories) {
          const { data: subcategory, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .upsert({ 
              name: subcategoryData.name,
              category_id: category.id 
            })
            .select()
            .single();
          
          if (subcategoryError) {
            stats.errors.push(`Failed to create subcategory ${subcategoryData.name}: ${subcategoryError.message}`);
            continue;
          }
          
          stats.subcategoriesCreated++;
          
          // Process jobs
          for (const jobData of subcategoryData.jobs) {
            const { error: jobError } = await supabase
              .from('service_jobs')
              .upsert({
                name: jobData.name,
                description: jobData.description,
                estimated_time: jobData.estimatedTime,
                price: jobData.price,
                subcategory_id: subcategory.id
              });
            
            if (jobError) {
              stats.errors.push(`Failed to create job ${jobData.name}: ${jobError.message}`);
              continue;
            }
            
            stats.jobsCreated++;
          }
        }
      }
    }
  } catch (error) {
    stats.errors.push(`Database import error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return stats;
}

// Main import function
export async function importServicesFromStorage(
  progressCallback?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  const bucketName = 'service-imports';
  
  try {
    // Check if bucket exists
    progressCallback?.({
      stage: 'validation',
      message: 'Checking storage bucket...',
      progress: 10,
      completed: false,
      error: null
    });
    
    const bucketExists = await storageService.checkBucketExists(bucketName);
    if (!bucketExists) {
      throw new Error(`Bucket "${bucketName}" does not exist`);
    }
    
    // Get all sector files
    progressCallback?.({
      stage: 'discovery',
      message: 'Discovering files...',
      progress: 20,
      completed: false,
      error: null
    });
    
    const sectorFiles = await storageService.getAllSectorFiles(bucketName);
    const totalFiles = Object.values(sectorFiles).reduce((total, files) => total + files.length, 0);
    
    if (totalFiles === 0) {
      throw new Error('No Excel files found in sector folders');
    }
    
    // Process files
    progressCallback?.({
      stage: 'processing',
      message: `Processing ${totalFiles} files...`,
      progress: 40,
      completed: false,
      error: null
    });
    
    const allProcessedData: ProcessedServiceData[] = [];
    let processedCount = 0;
    
    for (const [sectorName, files] of Object.entries(sectorFiles)) {
      for (const file of files) {
        try {
          const processedData = await processExcelFileFromStorage(bucketName, file.path);
          allProcessedData.push(...processedData);
          
          processedCount++;
          const progress = 40 + (processedCount / totalFiles) * 40;
          
          progressCallback?.({
            stage: 'processing',
            message: `Processed ${processedCount}/${totalFiles} files...`,
            progress,
            completed: false,
            error: null
          });
        } catch (error) {
          console.error(`Failed to process file ${file.path}:`, error);
          // Continue processing other files
        }
      }
    }
    
    // Import to database
    progressCallback?.({
      stage: 'importing',
      message: 'Importing to database...',
      progress: 80,
      completed: false,
      error: null
    });
    
    const stats = await importProcessedDataToDatabase(allProcessedData);
    
    progressCallback?.({
      stage: 'complete',
      message: 'Import completed successfully!',
      progress: 100,
      completed: true,
      error: null
    });
    
    return {
      success: true,
      message: `Successfully processed ${stats.sectorsProcessed} sectors, ${stats.categoriesCreated} categories, ${stats.subcategoriesCreated} subcategories, and ${stats.jobsCreated} jobs`,
      stats
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    progressCallback?.({
      stage: 'error',
      message: errorMessage,
      progress: 0,
      completed: false,
      error: errorMessage
    });
    
    return {
      success: false,
      message: errorMessage,
      stats: {
        sectorsProcessed: 0,
        categoriesCreated: 0,
        subcategoriesCreated: 0,
        jobsCreated: 0,
        errors: [errorMessage]
      }
    };
  }
}

// Utility functions
export async function clearAllServiceData(): Promise<void> {
  try {
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
}

export async function getServiceCounts(): Promise<{
  sectors: number;
  categories: number;
  subcategories: number;
  jobs: number;
}> {
  try {
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
  } catch (error) {
    console.error('Error getting service counts:', error);
    return {
      sectors: 0,
      categories: 0,
      subcategories: 0,
      jobs: 0
    };
  }
}
