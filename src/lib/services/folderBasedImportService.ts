import { supabase } from '@/integrations/supabase/client';
import { getAllSectorFiles, getFolderFiles } from './storageUtils';

export interface SectorFiles {
  sectorName: string;
  excelFiles: string[];
  totalFiles: number;
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

export interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
}

export interface ImportStats {
  totalSectors: number;
  totalCategories: number;
  totalServices: number;
  filesProcessed: number;
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats?: ImportStats;
}

export async function importServicesFromStorage(
  onProgress: (progress: ImportProgress) => void
): Promise<ImportResult> {
  try {
    onProgress({
      stage: 'fetching',
      message: 'Fetching service files from storage...',
      progress: 10,
      completed: false,
      error: null
    });

    const sectorFilesArray = await getAllSectorFiles();
    
    if (!sectorFilesArray || sectorFilesArray.length === 0) {
      throw new Error('No sector files found in storage');
    }

    let totalFilesProcessed = 0;
    let totalSectors = 0;
    let totalCategories = 0;
    let totalServices = 0;

    // Process each sector
    for (let i = 0; i < sectorFilesArray.length; i++) {
      const sectorFiles = sectorFilesArray[i];
      
      onProgress({
        stage: 'processing',
        message: `Processing ${sectorFiles.sectorName} sector...`,
        progress: 20 + (i / sectorFilesArray.length) * 60,
        completed: false,
        error: null
      });

      const sectorData = await processExcelFileFromStorage(sectorFiles);
      const result = await importProcessedDataToDatabase(sectorData);
      
      if (result.success && result.stats) {
        totalSectors += result.stats.totalSectors;
        totalCategories += result.stats.totalCategories;
        totalServices += result.stats.totalServices;
        totalFilesProcessed += sectorFiles.totalFiles;
      }
    }

    onProgress({
      stage: 'complete',
      message: 'Import completed successfully!',
      progress: 100,
      completed: true,
      error: null
    });

    return {
      success: true,
      message: 'Service import completed successfully',
      stats: {
        totalSectors,
        totalCategories,
        totalServices,
        filesProcessed: totalFilesProcessed
      }
    };

  } catch (error) {
    console.error('Import failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    onProgress({
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
}

export async function processExcelFileFromStorage(sectorFiles: SectorFiles): Promise<ProcessedServiceData> {
  try {
    console.log(`Processing ${sectorFiles.sectorName} with ${sectorFiles.totalFiles} files`);
    
    // Mock implementation for now - in real implementation this would:
    // 1. Download each Excel file from storage
    // 2. Parse the Excel data
    // 3. Structure it according to the hierarchy
    
    const mockData: ProcessedServiceData = {
      sectors: [{
        name: sectorFiles.sectorName,
        categories: [{
          name: `${sectorFiles.sectorName} Category`,
          subcategories: [{
            name: `${sectorFiles.sectorName} Subcategory`,
            jobs: [{
              name: `Sample ${sectorFiles.sectorName} Service`,
              description: `A sample service for ${sectorFiles.sectorName}`,
              estimatedTime: 60,
              price: 100
            }]
          }]
        }]
      }]
    };
    
    return mockData;
  } catch (error) {
    console.error('Error processing Excel files:', error);
    throw new Error(`Failed to process Excel files for ${sectorFiles.sectorName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function importProcessedDataToDatabase(data: ProcessedServiceData): Promise<ImportResult> {
  try {
    let totalSectors = 0;
    let totalCategories = 0;
    let totalServices = 0;

    for (const sectorData of data.sectors) {
      // Insert sector
      const { data: sector, error: sectorError } = await supabase
        .from('service_sectors')
        .insert({
          name: sectorData.name,
          description: `Imported sector: ${sectorData.name}`,
          position: totalSectors
        })
        .select('id')
        .single();

      if (sectorError) {
        console.error('Error inserting sector:', sectorError);
        throw new Error(`Failed to insert sector ${sectorData.name}: ${sectorError.message}`);
      }

      totalSectors++;

      for (const categoryData of sectorData.categories) {
        // Insert category
        const { data: category, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            name: categoryData.name,
            description: `Imported category: ${categoryData.name}`,
            sector_id: sector.id,
            position: totalCategories
          })
          .select('id')
          .single();

        if (categoryError) {
          console.error('Error inserting category:', categoryError);
          throw new Error(`Failed to insert category ${categoryData.name}: ${categoryError.message}`);
        }

        totalCategories++;

        for (const subcategoryData of categoryData.subcategories) {
          // Insert subcategory
          const { data: subcategory, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert({
              name: subcategoryData.name,
              description: `Imported subcategory: ${subcategoryData.name}`,
              category_id: category.id
            })
            .select('id')
            .single();

          if (subcategoryError) {
            console.error('Error inserting subcategory:', subcategoryError);
            throw new Error(`Failed to insert subcategory ${subcategoryData.name}: ${subcategoryError.message}`);
          }

          for (const jobData of subcategoryData.jobs) {
            // Insert job
            const { error: jobError } = await supabase
              .from('service_jobs')
              .insert({
                name: jobData.name,
                description: jobData.description,
                estimated_time: jobData.estimatedTime,
                price: jobData.price,
                subcategory_id: subcategory.id
              });

            if (jobError) {
              console.error('Error inserting job:', jobError);
              throw new Error(`Failed to insert job ${jobData.name}: ${jobError.message}`);
            }

            totalServices++;
          }
        }
      }
    }

    return {
      success: true,
      message: 'Data imported successfully',
      stats: {
        totalSectors,
        totalCategories,
        totalServices,
        filesProcessed: 1
      }
    };

  } catch (error) {
    console.error('Database import failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Database import failed'
    };
  }
}

export function validateServiceData(data: ProcessedServiceData): boolean {
  if (!data.sectors || data.sectors.length === 0) {
    return false;
  }

  for (const sector of data.sectors) {
    if (!sector.name || !sector.categories || sector.categories.length === 0) {
      return false;
    }

    for (const category of sector.categories) {
      if (!category.name || !category.subcategories || category.subcategories.length === 0) {
        return false;
      }

      for (const subcategory of category.subcategories) {
        if (!subcategory.name || !subcategory.jobs || subcategory.jobs.length === 0) {
          return false;
        }

        for (const job of subcategory.jobs) {
          if (!job.name) {
            return false;
          }
        }
      }
    }
  }

  return true;
}

export async function clearAllServiceData(): Promise<void> {
  try {
    console.log('Clearing all service data...');
    
    // Delete in correct order due to foreign key constraints
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('Service data cleared successfully');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw new Error(`Failed to clear service data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

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
    return {
      sectors: 0,
      categories: 0,
      subcategories: 0,
      jobs: 0
    };
  }
}
