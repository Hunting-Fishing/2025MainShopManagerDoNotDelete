
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { processServiceDataFromSheets, importProcessedDataToDatabase } from './serviceDataProcessor';
import { getFolderFiles } from './storageUtils';

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
  filesProcessed: number;
  servicesImported: number;
  errors: string[];
}

export interface ProcessedServiceData {
  sector: string;
  category: string;
  subcategory: string;
  job: string;
  description?: string;
}

/**
 * Process Excel file from storage and return structured service data
 */
export const processExcelFileFromStorage = async (bucketName: string, filePath: string): Promise<ProcessedServiceData[]> => {
  try {
    // Download file from storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      throw new Error(`Failed to download file ${filePath}: ${error.message}`);
    }

    // Convert blob to array buffer
    const arrayBuffer = await data.arrayBuffer();
    
    // Parse Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Process the workbook and extract service data
    const serviceData = await processServiceDataFromSheets(workbook, filePath);
    
    return serviceData;
  } catch (error) {
    console.error(`Error processing Excel file ${filePath}:`, error);
    throw error;
  }
};

/**
 * Clear all service data from the database
 */
export const clearAllServiceData = async (): Promise<void> => {
  try {
    // Delete in order to maintain foreign key constraints
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('Successfully cleared all service data');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw new Error(`Failed to clear service data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get counts of service hierarchy items
 */
export const getServiceCounts = async () => {
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
    throw error;
  }
};

/**
 * Import services from storage bucket with sector-based folder structure
 */
export const importServicesFromStorage = async (
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  const bucketName = 'service-imports';
  
  try {
    onProgress?.({
      stage: 'initializing',
      message: 'Starting import process...',
      progress: 0,
      completed: false,
      error: null
    });

    // Get bucket info and folders
    const { data: folders, error: listError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 100 });

    if (listError) {
      throw new Error(`Failed to list folders in bucket: ${listError.message}`);
    }

    const sectorFolders = folders.filter(item => !item.name.includes('.') && item.name);
    
    if (sectorFolders.length === 0) {
      throw new Error('No sector folders found in storage bucket');
    }

    onProgress?.({
      stage: 'scanning',
      message: `Found ${sectorFolders.length} sector folders`,
      progress: 10,
      completed: false,
      error: null
    });

    const stats: ImportStats = {
      sectorsProcessed: 0,
      filesProcessed: 0,
      servicesImported: 0,
      errors: []
    };

    let allServiceData: ProcessedServiceData[] = [];

    // Process each sector folder
    for (let i = 0; i < sectorFolders.length; i++) {
      const folder = sectorFolders[i];
      const sectorName = folder.name;
      
      onProgress?.({
        stage: 'processing_sector',
        message: `Processing sector: ${sectorName}`,
        progress: 10 + (i / sectorFolders.length) * 40,
        completed: false,
        error: null
      });

      try {
        // Get Excel files in this sector folder
        const files = await getFolderFiles(bucketName, sectorName);
        
        if (files.length === 0) {
          console.warn(`No Excel files found in sector folder: ${sectorName}`);
          continue;
        }

        // Process each Excel file in the sector
        for (const file of files) {
          try {
            onProgress?.({
              stage: 'processing_file',
              message: `Processing file: ${file.name} in ${sectorName}`,
              progress: 10 + (i / sectorFolders.length) * 40,
              completed: false,
              error: null
            });

            const serviceData = await processExcelFileFromStorage(bucketName, file.path);
            
            // Add sector information to each service
            const sectorServiceData = serviceData.map(service => ({
              ...service,
              sector: sectorName
            }));
            
            allServiceData.push(...sectorServiceData);
            stats.filesProcessed++;
            
          } catch (fileError) {
            const errorMsg = `Error processing file ${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`;
            console.error(errorMsg);
            stats.errors.push(errorMsg);
          }
        }
        
        stats.sectorsProcessed++;
        
      } catch (sectorError) {
        const errorMsg = `Error processing sector ${sectorName}: ${sectorError instanceof Error ? sectorError.message : 'Unknown error'}`;
        console.error(errorMsg);
        stats.errors.push(errorMsg);
      }
    }

    onProgress?.({
      stage: 'importing',
      message: 'Importing processed data to database...',
      progress: 60,
      completed: false,
      error: null
    });

    // Import all processed data to database
    if (allServiceData.length > 0) {
      await importProcessedDataToDatabase(allServiceData);
      stats.servicesImported = allServiceData.length;
    }

    onProgress?.({
      stage: 'complete',
      message: 'Import completed successfully!',
      progress: 100,
      completed: true,
      error: null
    });

    return {
      success: true,
      message: `Successfully imported ${stats.servicesImported} services from ${stats.filesProcessed} files across ${stats.sectorsProcessed} sectors`,
      stats
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Import failed:', error);
    
    onProgress?.({
      stage: 'error',
      message: errorMessage,
      progress: 0,
      completed: false,
      error: errorMessage
    });

    throw new Error(errorMessage);
  }
};
