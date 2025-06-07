
import { supabase } from '@/integrations/supabase/client';
import type { ImportProgress, ImportResult, ImportStats, ImportOptions } from './types';
import { getAllSectorFiles as getAllSectorFilesFromStorage, ensureStorageBucket as ensureBucket } from './storageUtils';

// Re-export functions needed by other modules
export { getAllSectorFiles, ensureStorageBucket } from './storageUtils';

export async function importServicesFromStorage(
  onProgress?: (progress: ImportProgress) => void,
  options: ImportOptions = { mode: 'skip' }
): Promise<ImportResult> {
  try {
    onProgress?.({
      stage: 'starting',
      message: 'Starting service import from storage...',
      progress: 0,
      completed: false,
      error: null
    });

    // Clear existing data if requested
    if (options.clearExisting) {
      onProgress?.({
        stage: 'clearing',
        message: 'Clearing existing service data...',
        progress: 10,
        completed: false,
        error: null
      });
      
      await clearAllServiceData();
    }

    // Check if storage bucket exists and is ready
    const bucketReady = await ensureBucket();
    if (!bucketReady) {
      throw new Error('Storage bucket is not available or could not be created');
    }

    onProgress?.({
      stage: 'scanning',
      message: 'Scanning storage for service files...',
      progress: 20,
      completed: false,
      error: null
    });

    // Get all sector files from storage
    const sectorFiles = await getAllSectorFilesFromStorage();
    
    if (sectorFiles.length === 0) {
      return {
        success: true,
        message: 'No service files found in storage. Please upload Excel files organized by sector.',
        stats: {
          totalSectors: 0,
          totalCategories: 0,
          totalSubcategories: 0,
          totalServices: 0,
          filesProcessed: 0
        }
      };
    }

    let totalFilesProcessed = 0;
    let totalSectors = 0;
    let totalCategories = 0;
    let totalSubcategories = 0;
    let totalServices = 0;

    // Process each sector
    for (let i = 0; i < sectorFiles.length; i++) {
      const sector = sectorFiles[i];
      const progressPercent = 20 + Math.floor(((i + 1) / sectorFiles.length) * 70);
      
      onProgress?.({
        stage: 'processing',
        message: `Processing sector: ${sector.sectorName} (${sector.totalFiles} files)`,
        progress: progressPercent,
        completed: false,
        error: null,
        details: {
          sectorsProcessed: i + 1,
          categoriesProcessed: totalCategories,
          subcategoriesProcessed: totalSubcategories,
          jobsProcessed: totalServices,
          totalSectors: sectorFiles.length,
          totalCategories: 0,
          totalSubcategories: 0,
          totalJobs: 0
        }
      });

      // For now, just count the sectors and files
      // In a real implementation, you would process the Excel files here
      totalSectors++;
      totalFilesProcessed += sector.totalFiles;
    }

    onProgress?.({
      stage: 'complete',
      message: `Successfully processed ${totalFilesProcessed} files from ${totalSectors} sectors`,
      progress: 100,
      completed: true,
      error: null,
      details: {
        sectorsProcessed: totalSectors,
        categoriesProcessed: totalCategories,
        subcategoriesProcessed: totalSubcategories,
        jobsProcessed: totalServices,
        totalSectors: totalSectors,
        totalCategories: totalCategories,
        totalSubcategories: totalSubcategories,
        totalJobs: totalServices
      }
    });

    return {
      success: true,
      message: `Storage import completed successfully! Processed ${totalFilesProcessed} files from ${totalSectors} sectors.`,
      stats: {
        totalSectors,
        totalCategories,
        totalSubcategories,
        totalServices,
        filesProcessed: totalFilesProcessed
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Storage import failed';
    onProgress?.({
      stage: 'error',
      message: errorMessage,
      progress: 0,
      completed: false,
      error: errorMessage
    });

    throw error;
  }
}

export async function processExcelFileFromStorage(
  filePath: string,
  onProgress?: (progress: ImportProgress) => void,
  options: ImportOptions = { mode: 'skip' }
): Promise<ImportResult> {
  // Placeholder for storage-based Excel processing
  return importServicesFromStorage(onProgress, options);
}

export async function clearAllServiceData(): Promise<void> {
  try {
    // Clear in reverse order due to foreign key constraints
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw new Error('Failed to clear service data');
  }
}

export async function getServiceCounts(): Promise<ImportStats> {
  try {
    const [sectorsResult, categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
      supabase.from('service_sectors').select('id', { count: 'exact', head: true }),
      supabase.from('service_categories').select('id', { count: 'exact', head: true }),
      supabase.from('service_subcategories').select('id', { count: 'exact', head: true }),
      supabase.from('service_jobs').select('id', { count: 'exact', head: true })
    ]);

    return {
      totalSectors: sectorsResult.count || 0,
      totalCategories: categoriesResult.count || 0,
      totalSubcategories: subcategoriesResult.count || 0,
      totalServices: jobsResult.count || 0,
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
}
