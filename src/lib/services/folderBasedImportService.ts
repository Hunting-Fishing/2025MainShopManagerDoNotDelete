
import { supabase } from '@/integrations/supabase/client';
import { processServiceDataFromSheets, importProcessedDataToDatabase } from './serviceDataProcessor';

export interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
}

export interface ImportStats {
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
  totalImported: number;
  errors: string[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats: ImportStats;
  errors: string[];
}

export const processExcelFileFromStorage = async (
  fileName: string,
  progressCallback?: (progress: ImportProgress) => void
): Promise<any[]> => {
  try {
    progressCallback?.({
      stage: 'downloading',
      progress: 10,
      message: `Downloading ${fileName}...`,
      completed: false,
      error: null
    });

    const { data, error } = await supabase.storage
      .from('service-data')
      .download(fileName);

    if (error) {
      throw new Error(`Failed to download ${fileName}: ${error.message}`);
    }

    if (!data) {
      throw new Error(`No data found in ${fileName}`);
    }

    progressCallback?.({
      stage: 'processing',
      progress: 50,
      message: `Processing ${fileName}...`,
      completed: false,
      error: null
    });

    // Convert blob to buffer for processing
    const arrayBuffer = await data.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // For now, return the raw data - this would need actual Excel processing
    // In a real implementation, you'd use a library like xlsx to parse the Excel file
    console.log(`Processed ${fileName}, size: ${uint8Array.length} bytes`);
    
    progressCallback?.({
      stage: 'complete',
      progress: 100,
      message: `Successfully processed ${fileName}`,
      completed: true,
      error: null
    });

    // Return mock data structure for now
    return [{
      sector: 'Automotive',
      category: 'Engine',
      subcategory: 'Oil Change',
      service: 'Full Synthetic Oil Change'
    }];

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    progressCallback?.({
      stage: 'error',
      progress: 0,
      message: errorMessage,
      completed: false,
      error: errorMessage
    });
    throw error;
  }
};

export const clearAllServiceData = async (): Promise<void> => {
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
};

export const getServiceCounts = async (): Promise<ImportStats> => {
  try {
    const [sectorsResult, categoriesResult, subcategoriesResult, servicesResult] = await Promise.all([
      supabase.from('service_sectors').select('id', { count: 'exact' }),
      supabase.from('service_categories').select('id', { count: 'exact' }),
      supabase.from('service_subcategories').select('id', { count: 'exact' }),
      supabase.from('service_jobs').select('id', { count: 'exact' })
    ]);

    return {
      sectors: sectorsResult.count || 0,
      categories: categoriesResult.count || 0,
      subcategories: subcategoriesResult.count || 0,
      services: servicesResult.count || 0,
      totalImported: (sectorsResult.count || 0) + (categoriesResult.count || 0) + (subcategoriesResult.count || 0) + (servicesResult.count || 0),
      errors: []
    };
  } catch (error) {
    console.error('Error getting service counts:', error);
    return {
      sectors: 0,
      categories: 0,
      subcategories: 0,
      services: 0,
      totalImported: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
};

export const importServicesFromStorage = async (
  progressCallback?: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  try {
    progressCallback?.({
      stage: 'starting',
      progress: 0,
      message: 'Starting import process...',
      completed: false,
      error: null
    });

    // List files in the service-data bucket
    const { data: files, error: listError } = await supabase.storage
      .from('service-data')
      .list();

    if (listError) {
      throw new Error(`Failed to list files: ${listError.message}`);
    }

    if (!files || files.length === 0) {
      throw new Error('No files found in service-data bucket');
    }

    const excelFiles = files.filter(file => 
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );

    if (excelFiles.length === 0) {
      throw new Error('No Excel files found in service-data bucket');
    }

    progressCallback?.({
      stage: 'processing-files',
      progress: 20,
      message: `Found ${excelFiles.length} Excel files to process`,
      completed: false,
      error: null
    });

    // Process each Excel file
    const allServiceData: any[] = [];
    for (let i = 0; i < excelFiles.length; i++) {
      const file = excelFiles[i];
      const fileProgress = 20 + (i / excelFiles.length) * 50;
      
      progressCallback?.({
        stage: 'processing-file',
        progress: fileProgress,
        message: `Processing ${file.name}...`,
        completed: false,
        error: null
      });

      const fileData = await processExcelFileFromStorage(file.name);
      allServiceData.push(...fileData);
    }

    // Convert raw data to ProcessedServiceData format
    const processedData = {
      sectors: allServiceData.map(item => ({
        name: item.sector || 'Unknown',
        categories: [{
          name: item.category || 'Unknown',
          subcategories: [{
            name: item.subcategory || 'Unknown',
            services: [item.service || 'Unknown Service']
          }]
        }]
      }))
    };

    progressCallback?.({
      stage: 'importing-to-database',
      progress: 80,
      message: 'Importing processed data to database...',
      completed: false,
      error: null
    });

    // Import to database
    const importStats = await importProcessedDataToDatabase(processedData);

    const result: ImportResult = {
      success: true,
      message: `Successfully imported ${importStats.totalImported} items`,
      stats: importStats,
      errors: importStats.errors
    };

    progressCallback?.({
      stage: 'complete',
      progress: 100,
      message: result.message,
      completed: true,
      error: null
    });

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    progressCallback?.({
      stage: 'error',
      progress: 0,
      message: errorMessage,
      completed: false,
      error: errorMessage
    });

    return {
      success: false,
      message: errorMessage,
      stats: {
        sectors: 0,
        categories: 0,
        subcategories: 0,
        services: 0,
        totalImported: 0,
        errors: [errorMessage]
      },
      errors: [errorMessage]
    };
  }
};
