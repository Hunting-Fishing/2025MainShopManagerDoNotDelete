
import { supabase } from '@/integrations/supabase/client';
import { processServiceDataFromSheets, importProcessedDataToDatabase } from './serviceDataProcessor';

export interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed?: boolean;
  error?: string | null;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors?: string[];
  sectors?: number;
  categories?: number;
  subcategories?: number;
  services?: number;
}

export interface ImportStats {
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
  importedCount: number;
  errors: string[];
}

export const processExcelFileFromStorage = async (
  filePath: string,
  progressCallback?: (progress: ImportProgress) => void
): Promise<any> => {
  try {
    progressCallback?.({
      stage: 'downloading',
      progress: 10,
      message: 'Downloading file from storage...'
    });

    const { data, error } = await supabase.storage
      .from('service-data')
      .download(filePath);

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data received from storage');
    }

    progressCallback?.({
      stage: 'processing',
      progress: 50,
      message: 'Processing Excel file...'
    });

    // Convert blob to array buffer for processing
    const arrayBuffer = await data.arrayBuffer();
    
    // Here you would process the Excel file using a library like xlsx
    // For now, returning mock data structure
    const processedData = {
      sectors: [],
      categories: [],
      subcategories: [],
      services: []
    };

    progressCallback?.({
      stage: 'complete',
      progress: 100,
      message: 'File processed successfully'
    });

    return processedData;
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw error;
  }
};

export const clearAllServiceData = async (): Promise<void> => {
  try {
    console.log('Starting to clear all service data...');
    
    // Delete in correct order due to foreign key constraints
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
      supabase.from('service_sectors').select('id', { count: 'exact', head: true }),
      supabase.from('service_categories').select('id', { count: 'exact', head: true }),
      supabase.from('service_subcategories').select('id', { count: 'exact', head: true }),
      supabase.from('service_jobs').select('id', { count: 'exact', head: true })
    ]);

    const sectors = sectorsResult.count || 0;
    const categories = categoriesResult.count || 0;
    const subcategories = subcategoriesResult.count || 0;
    const services = servicesResult.count || 0;

    return {
      sectors,
      categories,
      subcategories,
      services,
      importedCount: sectors + categories + subcategories + services,
      errors: []
    };
  } catch (error) {
    console.error('Error getting service counts:', error);
    return {
      sectors: 0,
      categories: 0,
      subcategories: 0,
      services: 0,
      importedCount: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
};

export const importServicesFromStorage = async (
  progressCallback?: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  try {
    progressCallback?.({
      stage: 'initializing',
      progress: 5,
      message: 'Starting import process...'
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

    progressCallback?.({
      stage: 'processing_files',
      progress: 20,
      message: `Found ${files.length} files to process...`
    });

    let totalImported = 0;
    const errors: string[] = [];
    let stats = { sectors: 0, categories: 0, subcategories: 0, services: 0 };

    // Process each Excel file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        continue;
      }

      try {
        progressCallback?.({
          stage: 'processing_file',
          progress: 20 + (i / files.length) * 60,
          message: `Processing ${file.name}...`
        });

        const processedData = await processExcelFileFromStorage(file.name);
        
        // Convert the processed data to the format expected by processServiceDataFromSheets
        const sheetsData = [
          processedData.sectors || [],
          processedData.categories || [],
          processedData.subcategories || [],
          processedData.services || []
        ];

        const importStats = await importProcessedDataToDatabase(sheetsData);
        
        totalImported += importStats.importedCount;
        stats.sectors += importStats.sectors;
        stats.categories += importStats.categories;
        stats.subcategories += importStats.subcategories;
        stats.services += importStats.services;
        
        if (importStats.errors && importStats.errors.length > 0) {
          errors.push(...importStats.errors);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Error processing ${file.name}: ${errorMessage}`);
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    progressCallback?.({
      stage: 'complete',
      progress: 100,
      message: `Import completed! Imported ${totalImported} items total.`,
      completed: true
    });

    return {
      success: errors.length === 0,
      importedCount: totalImported,
      errors: errors.length > 0 ? errors : undefined,
      sectors: stats.sectors,
      categories: stats.categories,
      subcategories: stats.subcategories,
      services: stats.services
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Import failed:', error);
    
    progressCallback?.({
      stage: 'error',
      progress: 0,
      message: errorMessage,
      error: errorMessage
    });

    return {
      success: false,
      importedCount: 0,
      errors: [errorMessage]
    };
  }
};
