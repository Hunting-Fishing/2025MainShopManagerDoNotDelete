
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
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
  message: string;
}

export const processExcelFileFromStorage = async (
  filePath: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<{ data: Record<string, any[]>; errors: string[] }> => {
  try {
    onProgress?.({
      stage: 'Loading file',
      message: `Reading ${filePath}`,
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

    onProgress?.({
      stage: 'Processing file',
      message: 'Reading Excel data',
      progress: 30,
      completed: false,
      error: null
    });

    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Read the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    onProgress?.({
      stage: 'Parsing sheets',
      message: 'Extracting service data',
      progress: 50,
      completed: false,
      error: null
    });

    const result: Record<string, any[]> = {};
    const errors: string[] = [];

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      try {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Skip empty sheets
        if (jsonData.length > 0) {
          result[sheetName] = jsonData as any[];
        }
      } catch (error) {
        const errorMsg = `Error processing sheet "${sheetName}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    onProgress?.({
      stage: 'File processed',
      message: `Processed ${Object.keys(result).length} sheets`,
      progress: 70,
      completed: false,
      error: null
    });

    return { data: result, errors };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to process Excel file: ${errorMessage}`);
  }
};

export const importServicesFromStorage = async (
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  try {
    onProgress?.({
      stage: 'Starting import',
      message: 'Initializing service import process',
      progress: 0,
      completed: false,
      error: null
    });

    // List files in the service-data bucket
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
      throw new Error('No files found in service-data bucket');
    }

    onProgress?.({
      stage: 'Processing files',
      message: `Found ${files.length} files to process`,
      progress: 5,
      completed: false,
      error: null
    });

    let totalImported = 0;
    const allErrors: string[] = [];

    // Process each Excel file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Skip non-Excel files
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        continue;
      }

      try {
        const fileProgress = (i / files.length) * 80 + 10; // 10-90% for file processing
        
        onProgress?.({
          stage: 'Processing file',
          message: `Processing ${file.name} (${i + 1}/${files.length})`,
          progress: fileProgress,
          completed: false,
          error: null
        });

        // Process the Excel file
        const { data: excelData, errors: fileErrors } = await processExcelFileFromStorage(
          file.name,
          (fileProgress) => {
            const overallProgress = fileProgress.progress * 0.8 + (i / files.length) * 80 + 10;
            onProgress?.({
              ...fileProgress,
              progress: overallProgress
            });
          }
        );

        if (fileErrors.length > 0) {
          allErrors.push(...fileErrors);
        }

        // Convert the sheets data to the format expected by processServiceDataFromSheets
        const sheetsArray = Object.entries(excelData).map(([sheetName, data]) => ({
          name: sheetName,
          data: data
        }));

        // Process the service data from sheets
        const processedData = processServiceDataFromSheets(sheetsArray);
        
        // Import to database
        const importResult = await importProcessedDataToDatabase(processedData);
        
        totalImported += importResult.importedCount;
        
        if (importResult.errors.length > 0) {
          allErrors.push(...importResult.errors);
        }

      } catch (error) {
        const errorMsg = `Error processing file "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`;
        allErrors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    onProgress?.({
      stage: 'Import complete',
      message: `Successfully imported ${totalImported} services`,
      progress: 100,
      completed: true,
      error: null
    });

    return {
      success: true,
      importedCount: totalImported,
      errors: allErrors,
      message: `Successfully imported ${totalImported} services${allErrors.length > 0 ? ` with ${allErrors.length} errors` : ''}`
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    onProgress?.({
      stage: 'Import failed',
      message: errorMessage,
      progress: 0,
      completed: false,
      error: errorMessage
    });

    return {
      success: false,
      importedCount: 0,
      errors: [errorMessage],
      message: `Import failed: ${errorMessage}`
    };
  }
};

export const clearAllServiceData = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Starting to clear all service data...');
    
    // Delete in the correct order due to foreign key constraints
    const { error: jobsError } = await supabase
      .from('service_jobs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (jobsError) {
      console.error('Error deleting jobs:', jobsError);
      throw new Error(`Failed to delete jobs: ${jobsError.message}`);
    }

    const { error: subcategoriesError } = await supabase
      .from('service_subcategories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (subcategoriesError) {
      console.error('Error deleting subcategories:', subcategoriesError);
      throw new Error(`Failed to delete subcategories: ${subcategoriesError.message}`);
    }

    const { error: categoriesError } = await supabase
      .from('service_categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (categoriesError) {
      console.error('Error deleting categories:', categoriesError);
      throw new Error(`Failed to delete categories: ${categoriesError.message}`);
    }

    const { error: sectorsError } = await supabase
      .from('service_sectors')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (sectorsError) {
      console.error('Error deleting sectors:', sectorsError);
      throw new Error(`Failed to delete sectors: ${sectorsError.message}`);
    }

    console.log('Successfully cleared all service data');
    return { success: true, message: 'All service data cleared successfully' };
  } catch (error) {
    console.error('Error clearing service data:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

export const getServiceCounts = async (): Promise<{
  sectors: number;
  categories: number;
  subcategories: number;
  jobs: number;
}> => {
  try {
    const [sectorsCount, categoriesCount, subcategoriesCount, jobsCount] = await Promise.all([
      supabase.from('service_sectors').select('*', { count: 'exact', head: true }),
      supabase.from('service_categories').select('*', { count: 'exact', head: true }),
      supabase.from('service_subcategories').select('*', { count: 'exact', head: true }),
      supabase.from('service_jobs').select('*', { count: 'exact', head: true })
    ]);

    return {
      sectors: sectorsCount.count || 0,
      categories: categoriesCount.count || 0,
      subcategories: subcategoriesCount.count || 0,
      jobs: jobsCount.count || 0
    };
  } catch (error) {
    console.error('Error getting service counts:', error);
    return { sectors: 0, categories: 0, subcategories: 0, jobs: 0 };
  }
};
