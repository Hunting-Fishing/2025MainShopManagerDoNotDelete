
import { supabase } from '@/integrations/supabase/client';
import { bucketViewerService } from './bucketViewerService';
import type { ImportProgress, ImportResult, ImportStats, ProcessedServiceData, SectorFiles } from './types';

// Excel processing functions
export const processExcelFileFromStorage = async (
  bucketName: string,
  filePath: string,
  progressCallback?: (progress: ImportProgress) => void
): Promise<any[]> => {
  try {
    progressCallback?.({
      stage: 'downloading',
      message: `Downloading ${filePath}...`,
      progress: 10,
      completed: false,
      error: null
    });

    const { data: fileBlob, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) throw error;
    if (!fileBlob) throw new Error('No file data received');

    progressCallback?.({
      stage: 'processing',
      message: `Processing ${filePath}...`,
      progress: 50,
      completed: false,
      error: null
    });

    // Mock processing - replace with actual Excel parsing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return []; // Return processed data
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw error;
  }
};

export const importServicesFromStorage = async (
  progressCallback?: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  try {
    progressCallback?.({
      stage: 'initializing',
      message: 'Initializing import process...',
      progress: 0,
      completed: false,
      error: null
    });

    // Get all sector files using the new service
    const allSectorFiles = await bucketViewerService.getAllSectorFiles();
    
    if (allSectorFiles.length === 0) {
      throw new Error('No sector folders with Excel files found in storage');
    }

    progressCallback?.({
      stage: 'analyzing',
      message: `Found ${allSectorFiles.length} sectors to process...`,
      progress: 10,
      completed: false,
      error: null
    });

    let processedSectors = 0;
    let totalFilesProcessed = 0;
    const processedData: ProcessedServiceData = {
      sectors: [],
      stats: {
        totalSectors: allSectorFiles.length,
        totalCategories: 0,
        totalSubcategories: 0,
        totalServices: 0,
        filesProcessed: 0
      }
    };

    // Process each sector
    for (const sectorFiles of allSectorFiles) {
      progressCallback?.({
        stage: 'processing',
        message: `Processing sector: ${sectorFiles.sectorName}...`,
        progress: 20 + (processedSectors / allSectorFiles.length) * 60,
        completed: false,
        error: null
      });

      // Process Excel files in this sector
      for (const excelFile of sectorFiles.excelFiles) {
        try {
          await processExcelFileFromStorage('service-data', excelFile.path, progressCallback);
          totalFilesProcessed++;
        } catch (error) {
          console.error(`Error processing file ${excelFile.path}:`, error);
          // Continue with other files
        }
      }

      processedSectors++;
    }

    processedData.stats.filesProcessed = totalFilesProcessed;

    // Import to database
    await importProcessedDataToDatabase(processedData, progressCallback);

    progressCallback?.({
      stage: 'complete',
      message: 'Import completed successfully!',
      progress: 100,
      completed: true,
      error: null
    });

    return {
      success: true,
      message: `Successfully imported services from ${totalFilesProcessed} files across ${allSectorFiles.length} sectors`,
      stats: processedData.stats
    };

  } catch (error) {
    console.error('Import failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Import failed';
    
    progressCallback?.({
      stage: 'error',
      message: errorMessage,
      progress: 0,
      completed: false,
      error: errorMessage
    });

    return {
      success: false,
      message: errorMessage
    };
  }
};

export const importProcessedDataToDatabase = async (
  data: ProcessedServiceData,
  progressCallback?: (progress: ImportProgress) => void
): Promise<void> => {
  try {
    progressCallback?.({
      stage: 'database',
      message: 'Importing data to database...',
      progress: 85,
      completed: false,
      error: null
    });

    // Mock database import - replace with actual implementation
    await new Promise(resolve => setTimeout(resolve, 2000));

    progressCallback?.({
      stage: 'database',
      message: 'Database import completed',
      progress: 95,
      completed: false,
      error: null
    });

  } catch (error) {
    console.error('Database import failed:', error);
    throw error;
  }
};

export const validateServiceData = (data: any): boolean => {
  // Add validation logic here
  return true;
};

export const clearAllServiceData = async (): Promise<void> => {
  try {
    const { error } = await supabase.rpc('clear_service_data');
    if (error) throw error;
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
};

export const getServiceCounts = async (): Promise<ImportStats> => {
  try {
    const { data: sectors, error: sectorsError } = await supabase
      .from('service_sectors')
      .select('id');
    
    const { data: categories, error: categoriesError } = await supabase
      .from('service_categories')
      .select('id');
    
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('service_subcategories')
      .select('id');
    
    const { data: jobs, error: jobsError } = await supabase
      .from('service_jobs')
      .select('id');

    if (sectorsError || categoriesError || subcategoriesError || jobsError) {
      throw new Error('Failed to get service counts');
    }

    return {
      totalSectors: sectors?.length || 0,
      totalCategories: categories?.length || 0,
      totalSubcategories: subcategories?.length || 0,
      totalServices: jobs?.length || 0,
      filesProcessed: 0
    };
  } catch (error) {
    console.error('Error getting service counts:', error);
    return {
      totalSectors: 0,
      totalCategories: 0,
      totalSubcategories: 0,
      totalServices: 0,
      filesProcessed: 0
    };
  }
};
