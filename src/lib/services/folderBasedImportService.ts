
import { supabase } from '@/integrations/supabase/client';
import { processServiceDataFromSheets, importProcessedDataToDatabase } from './serviceDataProcessor';

export interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
}

export interface ImportStats {
  totalImported: number;
  errors: string[];
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
}

// Get service counts from database
export const getServiceCounts = async () => {
  try {
    console.log('Getting service counts from database...');
    
    const [sectorsResult, categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
      supabase.from('service_sectors').select('id', { count: 'exact' }),
      supabase.from('service_categories').select('id', { count: 'exact' }),
      supabase.from('service_subcategories').select('id', { count: 'exact' }),
      supabase.from('service_jobs').select('id', { count: 'exact' })
    ]);

    const counts = {
      sectors: sectorsResult.count || 0,
      categories: categoriesResult.count || 0,
      subcategories: subcategoriesResult.count || 0,
      services: jobsResult.count || 0
    };

    console.log('Service counts:', counts);
    return counts;
  } catch (error) {
    console.error('Error getting service counts:', error);
    return { sectors: 0, categories: 0, subcategories: 0, services: 0 };
  }
};

// Clear all service data from database
export const clearAllServiceData = async (): Promise<void> => {
  try {
    console.log('Clearing all service data...');
    
    // Delete in correct order due to foreign key constraints
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('All service data cleared successfully');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw new Error(`Failed to clear service data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Process Excel file from storage and import to database
export const processExcelFileFromStorage = async (
  filePath: string,
  progressCallback?: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  try {
    console.log(`Processing Excel file from storage: ${filePath}`);
    
    progressCallback?.({
      stage: 'downloading',
      message: 'Downloading file from storage...',
      progress: 10,
      completed: false,
      error: null
    });

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('service-data')
      .download(filePath);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    if (!fileData) {
      throw new Error('No file data received');
    }

    progressCallback?.({
      stage: 'processing',
      message: 'Processing Excel data...',
      progress: 30,
      completed: false,
      error: null
    });

    // Convert blob to array buffer for processing
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Process the Excel data
    const processedData = await processServiceDataFromSheets(arrayBuffer);
    
    progressCallback?.({
      stage: 'importing',
      message: 'Importing data to database...',
      progress: 60,
      completed: false,
      error: null
    });

    // Import to database
    const importStats = await importProcessedDataToDatabase(processedData);

    progressCallback?.({
      stage: 'complete',
      message: 'Import completed successfully',
      progress: 100,
      completed: true,
      error: null
    });

    return {
      success: true,
      importedCount: importStats.totalImported,
      errors: importStats.errors,
      sectors: importStats.sectors,
      categories: importStats.categories,
      subcategories: importStats.subcategories,
      services: importStats.services
    };

  } catch (error) {
    console.error('Error processing Excel file from storage:', error);
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
      importedCount: 0,
      errors: [errorMessage],
      sectors: 0,
      categories: 0,
      subcategories: 0,
      services: 0
    };
  }
};

// Import services from all Excel files in storage
export const importServicesFromStorage = async (
  progressCallback?: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  try {
    console.log('Starting import from storage...');
    
    progressCallback?.({
      stage: 'listing',
      message: 'Scanning storage for Excel files...',
      progress: 5,
      completed: false,
      error: null
    });

    // List all files in the service-data bucket
    const { data: files, error: listError } = await supabase.storage
      .from('service-data')
      .list('', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (listError) {
      throw new Error(`Failed to list files: ${listError.message}`);
    }

    if (!files || files.length === 0) {
      throw new Error('No files found in service-data storage bucket');
    }

    // Filter for Excel files
    const excelFiles = files.filter(file => 
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );

    if (excelFiles.length === 0) {
      throw new Error('No Excel files found in service-data storage bucket');
    }

    console.log(`Found ${excelFiles.length} Excel files to process`);

    let totalImported = 0;
    let allErrors: string[] = [];
    let totalStats = { sectors: 0, categories: 0, subcategories: 0, services: 0 };

    // Process each Excel file
    for (let i = 0; i < excelFiles.length; i++) {
      const file = excelFiles[i];
      const progressPercent = 10 + (i / excelFiles.length) * 80;
      
      progressCallback?.({
        stage: 'processing',
        message: `Processing ${file.name} (${i + 1}/${excelFiles.length})...`,
        progress: progressPercent,
        completed: false,
        error: null
      });

      try {
        const result = await processExcelFileFromStorage(file.name);
        
        if (result.success) {
          totalImported += result.importedCount;
          totalStats.sectors += result.sectors;
          totalStats.categories += result.categories;
          totalStats.subcategories += result.subcategories;
          totalStats.services += result.services;
        } else {
          allErrors.push(...result.errors);
        }
      } catch (error) {
        const errorMsg = `Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        allErrors.push(errorMsg);
      }
    }

    const finalResult: ImportResult = {
      success: allErrors.length === 0,
      importedCount: totalImported,
      errors: allErrors,
      sectors: totalStats.sectors,
      categories: totalStats.categories,
      subcategories: totalStats.subcategories,
      services: totalStats.services
    };

    if (allErrors.length > 0) {
      progressCallback?.({
        stage: 'completed_with_errors',
        message: `Import completed with ${allErrors.length} errors`,
        progress: 100,
        completed: true,
        error: `${allErrors.length} errors occurred during import`
      });
    } else {
      progressCallback?.({
        stage: 'complete',
        message: `Successfully imported ${totalImported} services`,
        progress: 100,
        completed: true,
        error: null
      });
    }

    return finalResult;

  } catch (error) {
    console.error('Error importing from storage:', error);
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
      importedCount: 0,
      errors: [errorMessage],
      sectors: 0,
      categories: 0,
      subcategories: 0,
      services: 0
    };
  }
};
