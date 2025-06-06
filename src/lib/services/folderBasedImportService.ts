import { supabase } from '@/integrations/supabase/client';
import { getAllSectorFiles, getFolderFiles } from './storageUtils';
import { processServiceDataFromSheets, importProcessedDataToDatabase } from './serviceDataProcessor';

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
 * Process Excel files from storage bucket and import service data
 */
export async function importServicesFromStorage(
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  try {
    // Step 1: Get all sector files
    onProgress?.({
      stage: 'fetching',
      message: 'Fetching files from storage...',
      progress: 10,
      completed: false,
      error: null
    });

    const sectorFiles = await getAllSectorFiles('service-imports');
    const totalSectors = Object.keys(sectorFiles).length;
    
    if (totalSectors === 0) {
      throw new Error('No sector folders found in service-imports bucket');
    }

    // Step 2: Process each sector
    onProgress?.({
      stage: 'processing',
      message: `Processing ${totalSectors} sectors...`,
      progress: 20,
      completed: false,
      error: null
    });

    const allProcessedData: ProcessedServiceData = { sectors: [] };
    let processedSectors = 0;

    for (const [sectorName, files] of Object.entries(sectorFiles)) {
      if (files.length === 0) continue;

      onProgress?.({
        stage: 'processing',
        message: `Processing sector: ${sectorName} (${files.length} files)`,
        progress: 20 + (processedSectors / totalSectors) * 40,
        completed: false,
        error: null
      });

      // Process each file in the sector
      const sectorData = await processServiceDataFromSheets(files);
      
      // Add sector name to the processed data
      if (sectorData.sectors.length > 0) {
        const sectorWithName = {
          ...sectorData.sectors[0],
          name: sectorName
        };
        allProcessedData.sectors.push(sectorWithName);
      }

      processedSectors++;
    }

    // Step 3: Import to database
    onProgress?.({
      stage: 'importing',
      message: 'Importing data to database...',
      progress: 70,
      completed: false,
      error: null
    });

    await importProcessedDataToDatabase(allProcessedData);

    // Step 4: Complete
    onProgress?.({
      stage: 'complete',
      message: 'Import completed successfully!',
      progress: 100,
      completed: true,
      error: null
    });

    const stats: ImportStats = {
      sectorsProcessed: allProcessedData.sectors.length,
      categoriesCreated: allProcessedData.sectors.reduce((acc, s) => acc + s.categories.length, 0),
      subcategoriesCreated: allProcessedData.sectors.reduce((acc, s) => 
        acc + s.categories.reduce((catAcc, c) => catAcc + c.subcategories.length, 0), 0),
      jobsCreated: allProcessedData.sectors.reduce((acc, s) => 
        acc + s.categories.reduce((catAcc, c) => 
          catAcc + c.subcategories.reduce((subAcc, sub) => subAcc + sub.jobs.length, 0), 0), 0),
      filesProcessed: Object.values(sectorFiles).reduce((acc, files) => acc + files.length, 0)
    };

    return {
      success: true,
      message: `Successfully imported ${stats.sectorsProcessed} sectors with ${stats.jobsCreated} total services`,
      stats
    };

  } catch (error) {
    console.error('Import failed:', error);
    
    onProgress?.({
      stage: 'error',
      message: error instanceof Error ? error.message : 'Import failed',
      progress: 0,
      completed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Import failed'
    };
  }
}

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
