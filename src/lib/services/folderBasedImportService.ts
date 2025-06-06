import { supabase } from '@/integrations/supabase/client';
import { storageService, type StorageFile } from './unifiedStorageService';
import type { SectorFiles as UnifiedSectorFiles } from './unifiedStorageService';

export interface ProcessedServiceData {
  sectors: ServiceSector[];
  stats: ImportStats;
}

export interface ImportStats {
  totalSectors: number;
  totalCategories: number;
  totalSubcategories: number;
  totalServices: number;
  filesProcessed: number;
}

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

interface ServiceSector {
  name: string;
  categories: ServiceCategory[];
}

interface ServiceCategory {
  name: string;
  subcategories: ServiceSubcategory[];
}

interface ServiceSubcategory {
  name: string;
  jobs: string[];
}

// Local SectorFiles interface that matches what we need internally
interface LocalSectorFiles {
  sectorName: string;
  excelFiles: string[];
  totalFiles: number;
}

/**
 * Main function to import services from storage
 */
export async function importServicesFromStorage(
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  const bucketName = 'service-data';
  
  try {
    onProgress?.({
      stage: 'fetching',
      message: 'Fetching sector files from storage...',
      progress: 10,
      completed: false,
      error: null
    });

    // Get all sector files from storage
    const allSectorFiles = await storageService.getAllSectorFiles(bucketName);
    
    if (allSectorFiles.length === 0) {
      return {
        success: false,
        message: 'No sector files found in storage'
      };
    }

    // Convert UnifiedSectorFiles to LocalSectorFiles format
    const localSectorFiles: LocalSectorFiles[] = allSectorFiles.map(sectorFile => ({
      sectorName: sectorFile.sectorName,
      excelFiles: sectorFile.excelFiles.map(file => file.path),
      totalFiles: sectorFile.totalFiles
    }));

    // Process each sector
    let totalStats: ImportStats = {
      totalSectors: 0,
      totalCategories: 0,
      totalSubcategories: 0,
      totalServices: 0,
      filesProcessed: 0
    };

    for (let i = 0; i < localSectorFiles.length; i++) {
      const sectorFile = localSectorFiles[i];
      
      onProgress?.({
        stage: 'processing',
        message: `Processing sector: ${sectorFile.sectorName}`,
        progress: 20 + (i / localSectorFiles.length) * 60,
        completed: false,
        error: null
      });

      const sectorResult = await processSectorFiles(sectorFile);
      if (sectorResult) {
        totalStats.totalSectors += 1;
        totalStats.totalCategories += sectorResult.stats.totalCategories;
        totalStats.totalSubcategories += sectorResult.stats.totalSubcategories;
        totalStats.totalServices += sectorResult.stats.totalServices;
        totalStats.filesProcessed += sectorResult.stats.filesProcessed;

        // Import to database
        await importProcessedDataToDatabase(sectorResult.sectors);
      }
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
      message: `Successfully imported ${totalStats.totalServices} services from ${totalStats.totalSectors} sectors`,
      stats: totalStats
    };

  } catch (error) {
    console.error('Import failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Import failed'
    };
  }
}

/**
 * Process files for a specific sector
 */
async function processSectorFiles(sectorFiles: LocalSectorFiles): Promise<ProcessedServiceData | null> {
  const bucketName = 'service-data';
  const sectors: ServiceSector[] = [];
  
  let stats: ImportStats = {
    totalSectors: 0,
    totalCategories: 0,
    totalSubcategories: 0,
    totalServices: 0,
    filesProcessed: 0
  };

  try {
    for (const filePath of sectorFiles.excelFiles) {
      const result = await processExcelFileFromStorage(bucketName, filePath);
      if (result) {
        const existingSector = sectors.find(s => s.name === result.sectorName);
        if (existingSector) {
          existingSector.categories.push(...result.categories);
        } else {
          sectors.push({
            name: result.sectorName,
            categories: result.categories
          });
        }
        
        stats.totalCategories += result.categories.length;
        result.categories.forEach(cat => {
          stats.totalSubcategories += cat.subcategories.length;
          cat.subcategories.forEach(sub => {
            stats.totalServices += sub.jobs.length;
          });
        });
        stats.filesProcessed += 1;
      }
    }

    stats.totalSectors = sectors.length;
    
    return { sectors, stats };
  } catch (error) {
    console.error(`Error processing sector ${sectorFiles.sectorName}:`, error);
    return null;
  }
}

/**
 * Process an Excel file from storage and extract service data
 */
export async function processExcelFileFromStorage(bucketName: string, filePath: string): Promise<{
  sectorName: string;
  categories: ServiceCategory[];
} | null> {
  try {
    // This is a placeholder - in a real implementation, you would:
    // 1. Download the file from storage
    // 2. Parse the Excel file
    // 3. Extract and structure the service data
    
    console.log(`Processing Excel file: ${filePath}`);
    
    // For now, return mock data structure
    const pathParts = filePath.split('/');
    const sectorName = pathParts[0] || 'Unknown Sector';
    
    return {
      sectorName,
      categories: []
    };
  } catch (error) {
    console.error(`Error processing Excel file ${filePath}:`, error);
    return null;
  }
}

/**
 * Import processed service data to the database
 */
export async function importProcessedDataToDatabase(sectors: ServiceSector[]): Promise<void> {
  try {
    for (const sector of sectors) {
      // Insert sector
      const { data: sectorData, error: sectorError } = await supabase
        .from('service_sectors')
        .upsert({ name: sector.name })
        .select('id')
        .single();

      if (sectorError) throw sectorError;

      for (const category of sector.categories) {
        // Insert category
        const { data: categoryData, error: categoryError } = await supabase
          .from('service_categories')
          .upsert({ 
            name: category.name,
            sector_id: sectorData.id 
          })
          .select('id')
          .single();

        if (categoryError) throw categoryError;

        for (const subcategory of category.subcategories) {
          // Insert subcategory
          const { data: subcategoryData, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .upsert({ 
              name: subcategory.name,
              category_id: categoryData.id 
            })
            .select('id')
            .single();

          if (subcategoryError) throw subcategoryError;

          // Insert jobs
          for (const job of subcategory.jobs) {
            const { error: jobError } = await supabase
              .from('service_jobs')
              .upsert({ 
                name: job,
                subcategory_id: subcategoryData.id 
              });

            if (jobError) throw jobError;
          }
        }
      }
    }
  } catch (error) {
    console.error('Error importing to database:', error);
    throw error;
  }
}

/**
 * Validate service data structure
 */
export function validateServiceData(data: any): boolean {
  if (!data || !Array.isArray(data.sectors)) {
    return false;
  }

  return data.sectors.every((sector: any) => 
    sector.name && 
    Array.isArray(sector.categories) &&
    sector.categories.every((category: any) =>
      category.name &&
      Array.isArray(category.subcategories) &&
      category.subcategories.every((subcategory: any) =>
        subcategory.name &&
        Array.isArray(subcategory.jobs)
      )
    )
  );
}

/**
 * Clear all service data from the database
 */
export async function clearAllServiceData(): Promise<void> {
  try {
    // Delete in reverse order due to foreign key constraints
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
}

/**
 * Get counts of service data
 */
export async function getServiceCounts(): Promise<ImportStats> {
  try {
    const [sectorsResult, categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
      supabase.from('service_sectors').select('id', { count: 'exact' }),
      supabase.from('service_categories').select('id', { count: 'exact' }),
      supabase.from('service_subcategories').select('id', { count: 'exact' }),
      supabase.from('service_jobs').select('id', { count: 'exact' })
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
