
import { supabase } from '@/integrations/supabase/client';
import { importFromStorage } from './storageImportService';

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
}

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

    // Use the existing storage import service
    const sheetsData = await importFromStorage(bucketName, fileName, onProgress);
    
    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: 'File processed successfully',
        completed: true
      });
    }

    return sheetsData;
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

    const result = await processExcelFileFromStorage(bucketName, fileName, onProgress);
    
    return {
      success: true,
      message: 'Services imported successfully',
      data: result
    };
  } catch (error) {
    console.error('Error importing services from storage:', error);
    return {
      success: false,
      message: 'Failed to import services',
      error: error instanceof Error ? error.message : 'Unknown error'
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
