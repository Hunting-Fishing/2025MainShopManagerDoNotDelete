import { supabase } from '@/integrations/supabase/client';
import { processServiceDataFromSheets, importProcessedDataToDatabase } from './serviceDataProcessor';
import * as XLSX from 'xlsx';

export interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
  error?: string;
  completed?: boolean;
}

export interface ImportResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  imported?: {
    sectors: number;
    categories: number;
    subcategories: number;
    services: number;
  };
  sectors?: number;
  categories?: number;
  subcategories?: number;
  services?: number;
  errors?: string[];
}

const importFromStorage = async (
  bucketName: string,
  fileName: string,
  onProgress?: (progress: ImportProgress) => void
) => {
  try {
    if (onProgress) {
      onProgress({
        stage: 'downloading',
        progress: 10,
        message: 'Downloading file from storage...'
      });
    }

    // Download the file from Supabase storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileName);

    if (error) {
      console.error('Error downloading file:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }

    if (onProgress) {
      onProgress({
        stage: 'parsing',
        progress: 30,
        message: 'Parsing Excel file...'
      });
    }

    // Convert blob to array buffer
    const arrayBuffer = await data.arrayBuffer();
    
    // Parse the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Convert all sheets to JSON
    const sheetsData: Record<string, any[]> = {};
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      sheetsData[sheetName] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    });

    if (onProgress) {
      onProgress({
        stage: 'parsed',
        progress: 50,
        message: `Successfully parsed ${workbook.SheetNames.length} sheets`
      });
    }

    return sheetsData;
  } catch (error) {
    console.error('Error in importFromStorage:', error);
    throw error;
  }
};

export const processExcelFileFromStorage = async (
  bucketName: string,
  fileName: string,
  onProgress?: (progress: ImportProgress) => void
) => {
  try {
    if (onProgress) {
      onProgress({
        stage: 'starting',
        progress: 0,
        message: 'Starting file processing...'
      });
    }

    // Use the storage import service to get raw data
    const sheetsData = await importFromStorage(bucketName, fileName, onProgress);
    
    if (onProgress) {
      onProgress({
        stage: 'processing',
        progress: 70,
        message: 'Processing service data...'
      });
    }
    
    // Process the raw sheet data into structured service data
    const processedData = processServiceDataFromSheets(sheetsData);
    
    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: 'File processed successfully',
        completed: true
      });
    }

    return processedData;
  } catch (error) {
    console.error('Error processing Excel file from storage:', error);
    if (onProgress) {
      onProgress({
        stage: 'error',
        progress: 0,
        message: 'Failed to process file',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    throw error;
  }
};

export const importServicesFromStorage = async (
  bucketName: string,
  fileName: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  try {
    if (onProgress) {
      onProgress({
        stage: 'starting',
        progress: 0,
        message: 'Starting service import from storage...'
      });
    }

    // Process the Excel file to get structured data
    const processedData = await processExcelFileFromStorage(bucketName, fileName, onProgress);
    
    if (onProgress) {
      onProgress({
        stage: 'importing',
        progress: 20,
        message: 'Importing data to database...'
      });
    }
    
    // Import the processed data to the database
    const importStats = await importProcessedDataToDatabase(processedData, onProgress);
    
    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: 'Services imported successfully',
        completed: true
      });
    }
    
    return {
      success: true,
      message: `Services imported successfully: ${importStats.services} services across ${importStats.categories} categories`,
      data: processedData,
      imported: importStats,
      sectors: importStats.sectors,
      categories: importStats.categories,
      subcategories: importStats.subcategories,
      services: importStats.services,
      errors: []
    };
  } catch (error) {
    console.error('Error importing services from storage:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (onProgress) {
      onProgress({
        stage: 'error',
        progress: 0,
        message: 'Failed to import services',
        error: errorMessage
      });
    }
    
    return {
      success: false,
      message: 'Failed to import services',
      error: errorMessage,
      errors: [errorMessage],
      imported: {
        sectors: 0,
        categories: 0,
        subcategories: 0,
        services: 0
      },
      sectors: 0,
      categories: 0,
      subcategories: 0,
      services: 0
    };
  }
};

export const clearAllServiceData = async () => {
  try {
    // Clear all service-related tables
    const { error: jobsError } = await supabase
      .from('service_jobs')
      .delete()
      .neq('id', '');

    if (jobsError) throw jobsError;

    const { error: subcategoriesError } = await supabase
      .from('service_subcategories')
      .delete()
      .neq('id', '');

    if (subcategoriesError) throw subcategoriesError;

    const { error: categoriesError } = await supabase
      .from('service_categories')
      .delete()
      .neq('id', '');

    if (categoriesError) throw categoriesError;

    const { error: sectorsError } = await supabase
      .from('service_sectors')
      .delete()
      .neq('id', '');

    if (sectorsError) throw sectorsError;

    console.log('All service data cleared successfully');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
};

export const getServiceCounts = async () => {
  try {
    const [sectorsResult, categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
      supabase.from('service_sectors').select('id', { count: 'exact' }),
      supabase.from('service_categories').select('id', { count: 'exact' }),
      supabase.from('service_subcategories').select('id', { count: 'exact' }),
      supabase.from('service_jobs').select('id', { count: 'exact' })
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
