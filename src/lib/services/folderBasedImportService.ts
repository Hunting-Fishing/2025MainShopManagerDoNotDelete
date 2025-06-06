import { supabase } from '@/integrations/supabase/client';
import { storageService } from './unifiedStorageService';

import * as XLSX from 'xlsx';

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
  categoriesCreated: number;
  subcategoriesCreated: number;
  jobsCreated: number;
  filesProcessed: number;
}

export interface ProcessedServiceData {
  sectors: Array<{
    name: string;
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
  }>;
}

/**
 * Process Excel file from Supabase storage
 */
export const processExcelFileFromStorage = async (
  bucketName: string,
  filePath: string,
  progressCallback?: (progress: ImportProgress) => void
): Promise<ProcessedServiceData> => {
  try {
    progressCallback?.({
      stage: 'downloading',
      message: `Downloading file: ${filePath}`,
      progress: 10,
      completed: false,
      error: null
    });

    // Check if bucket exists first
    const bucketExists = await storageService.checkBucketExists(bucketName);
    if (!bucketExists) {
      throw new Error(`Bucket "${bucketName}" does not exist`);
    }

    // Download file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    if (!fileData) {
      throw new Error('No file data received');
    }

    progressCallback?.({
      stage: 'processing',
      message: `Processing Excel file: ${filePath}`,
      progress: 30,
      completed: false,
      error: null
    });

    // Convert blob to array buffer and process with xlsx
    const arrayBuffer = await fileData.arrayBuffer();
    const processedData = await processServiceDataFromSheets(arrayBuffer, progressCallback);

    progressCallback?.({
      stage: 'completed',
      message: `Successfully processed: ${filePath}`,
      progress: 100,
      completed: true,
      error: null
    });

    return processedData;
  } catch (error) {
    console.error('Error processing Excel file from storage:', error);
    throw error;
  }
};

/**
 * Import services from all Excel files in the storage bucket folders
 */
export const importServicesFromStorage = async (
  progressCallback?: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  const bucketName = 'service-imports';
  
  try {
    progressCallback?.({
      stage: 'initializing',
      message: 'Checking storage bucket...',
      progress: 0,
      completed: false,
      error: null
    });

    // Check if bucket exists
    const bucketExists = await storageService.checkBucketExists(bucketName);
    if (!bucketExists) {
      throw new Error(`Bucket "${bucketName}" does not exist. Please create the bucket and upload your Excel files.`);
    }

    // Get all sector files using the new storage service
    const sectorFiles = await storageService.getAllSectorFiles(bucketName);
    
    if (Object.keys(sectorFiles).length === 0) {
      throw new Error('No sector folders with Excel files found in the storage bucket');
    }

    const totalFiles = Object.values(sectorFiles).reduce((sum, files) => sum + files.length, 0);
    let processedFiles = 0;
    let totalImported = 0;

    progressCallback?.({
      stage: 'processing',
      message: `Found ${totalFiles} Excel files across ${Object.keys(sectorFiles).length} sectors`,
      progress: 5,
      completed: false,
      error: null
    });

    // Clear existing service data
    await clearAllServiceData();

    progressCallback?.({
      stage: 'processing',
      message: 'Cleared existing service data',
      progress: 10,
      completed: false,
      error: null
    });

    // Process each sector's files
    for (const [sectorName, files] of Object.entries(sectorFiles)) {
      console.log(`Processing sector: ${sectorName} with ${files.length} files`);
      
      for (const file of files) {
        try {
          progressCallback?.({
            stage: 'processing',
            message: `Processing ${file.name} from ${sectorName}`,
            progress: 10 + (processedFiles / totalFiles) * 80,
            completed: false,
            error: null
          });

          const processedData = await processExcelFileFromStorage(
            bucketName,
            file.path,
            (fileProgress) => {
              // Relay file-level progress with overall context
              progressCallback?.({
                ...fileProgress,
                message: `${fileProgress.message} (${processedFiles + 1}/${totalFiles})`
              });
            }
          );

          // Import the processed data
          const importStats = await importProcessedDataToDatabase(processedData);
          totalImported += importStats.totalImported;
          
          processedFiles++;
          
          console.log(`Completed processing ${file.name}: imported ${importStats.totalImported} services`);
          
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          processedFiles++;
          // Continue with other files even if one fails
        }
      }
    }

    const result: ImportResult = {
      success: true,
      message: `Successfully imported ${totalImported} services from ${processedFiles} files`,
      stats: {
        totalFiles: processedFiles,
        totalImported,
        sectorsProcessed: Object.keys(sectorFiles).length
      }
    };

    progressCallback?.({
      stage: 'completed',
      message: result.message,
      progress: 100,
      completed: true,
      error: null
    });

    return result;

  } catch (error) {
    console.error('Error importing services from storage:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
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
      stats: { totalFiles: 0, totalImported: 0, sectorsProcessed: 0 }
    };
  }
};

/**
 * Process a single Excel file from storage
 */
export async function processExcelFileFromStorage(
  bucketName: string,
  filePath: string
): Promise<ProcessedServiceData> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data received from file download');
    }

    // Convert blob to array buffer for processing
    const arrayBuffer = await data.arrayBuffer();
    
    // Process the Excel data (this would need to be implemented)
    // For now, return empty structure
    return {
      sectors: []
    };

  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    throw error;
  }
}

/**
 * Clear all service data from the database
 */
export async function clearAllServiceData(): Promise<void> {
  try {
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

/**
 * Get counts of service data in the database
 */
export async function getServiceCounts() {
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
    return { sectors: 0, categories: 0, subcategories: 0, jobs: 0 };
  }
}
