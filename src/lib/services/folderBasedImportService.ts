
import { supabase } from '@/integrations/supabase/client';
import { storageService } from './unifiedStorageService';
import * as XLSX from 'xlsx';

export interface ProcessedServiceData {
  sectors: Array<{
    name: string;
    description?: string;
    categories: Array<{
      name: string;
      description?: string;
      subcategories: Array<{
        name: string;
        description?: string;
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
  totalSubcategories: number;
  totalServices: number;
  filesProcessed: number;
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats?: ImportStats;
  error?: string;
}

// Use service-imports bucket instead of service-data
const BUCKET_NAME = 'service-imports';

export async function processExcelFileFromStorage(
  filePath: string,
  progressCallback?: (progress: ImportProgress) => void
): Promise<any[]> {
  try {
    progressCallback?.({
      stage: 'processing-file',
      message: `Processing file: ${filePath}`,
      progress: 0,
      completed: false,
      error: null
    });

    const fileBlob = await storageService.downloadFile(BUCKET_NAME, filePath);
    if (!fileBlob) {
      throw new Error(`Failed to download file: ${filePath}`);
    }

    // Convert blob to array buffer for XLSX
    const arrayBuffer = await fileBlob.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first worksheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    progressCallback?.({
      stage: 'processing-file',
      message: `Processed ${jsonData.length} rows from ${filePath}`,
      progress: 100,
      completed: false,
      error: null
    });

    return jsonData;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    throw error;
  }
}

export async function importServicesFromStorage(
  progressCallback?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  try {
    // Step 1: Get all sector files
    progressCallback?.({
      stage: 'starting',
      message: 'Starting import process...',
      progress: 0,
      completed: false,
      error: null
    });

    const sectorFiles = await storageService.getAllSectorFiles(BUCKET_NAME);
    
    if (sectorFiles.length === 0) {
      throw new Error('No sector folders found in storage bucket');
    }

    progressCallback?.({
      stage: 'folders-found',
      message: `Found ${sectorFiles.length} sectors with ${sectorFiles.reduce((sum, s) => sum + s.totalFiles, 0)} files`,
      progress: 10,
      completed: false,
      error: null
    });

    // Step 2: Process all files and build service hierarchy
    const processedData: ProcessedServiceData = { sectors: [] };
    let totalFilesProcessed = 0;
    const totalFiles = sectorFiles.reduce((sum, sector) => sum + sector.totalFiles, 0);

    for (const sectorFile of sectorFiles) {
      progressCallback?.({
        stage: 'processing-sector',
        message: `Processing sector: ${sectorFile.sectorName}`,
        progress: 20 + (totalFilesProcessed / totalFiles) * 50,
        completed: false,
        error: null
      });

      const sectorData = {
        name: sectorFile.sectorName,
        description: `${sectorFile.sectorName} services`,
        categories: [] as any[]
      };

      for (const file of sectorFile.excelFiles) {
        try {
          const fileData = await processExcelFileFromStorage(file.path, progressCallback);
          
          // Process the Excel data to extract service hierarchy
          const categoryData = processExcelData(fileData, file.name);
          if (categoryData) {
            sectorData.categories.push(categoryData);
          }
          
          totalFilesProcessed++;
        } catch (error) {
          console.error(`Error processing file ${file.path}:`, error);
          // Continue with other files even if one fails
        }
      }

      processedData.sectors.push(sectorData);
    }

    // Step 3: Save to database
    progressCallback?.({
      stage: 'saving-to-database',
      message: 'Saving processed data to database...',
      progress: 80,
      completed: false,
      error: null
    });

    const stats = await importProcessedDataToDatabase(processedData, progressCallback);

    progressCallback?.({
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
        ...stats,
        filesProcessed: totalFilesProcessed
      }
    };

  } catch (error) {
    console.error('Service import failed:', error);
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
      message: 'Service import failed',
      error: errorMessage
    };
  }
}

function processExcelData(data: any[], fileName: string): any | null {
  if (!data || data.length === 0) return null;

  // Extract category name from filename (remove .xlsx extension)
  const categoryName = fileName.replace('.xlsx', '').trim();
  
  const category = {
    name: categoryName,
    description: `${categoryName} services`,
    subcategories: [] as any[]
  };

  // Skip header row and process data
  const rows = data.slice(1);
  const subcategoriesMap = new Map();

  for (const row of rows) {
    if (!row || row.length < 2) continue;

    const subcategoryName = row[0]?.toString()?.trim();
    const serviceName = row[1]?.toString()?.trim();
    
    if (!subcategoryName || !serviceName) continue;

    if (!subcategoriesMap.has(subcategoryName)) {
      subcategoriesMap.set(subcategoryName, {
        name: subcategoryName,
        description: `${subcategoryName} services`,
        jobs: []
      });
    }

    const subcategory = subcategoriesMap.get(subcategoryName);
    subcategory.jobs.push({
      name: serviceName,
      description: row[2]?.toString()?.trim() || '',
      estimatedTime: parseFloat(row[3]) || 0,
      price: parseFloat(row[4]) || 0
    });
  }

  category.subcategories = Array.from(subcategoriesMap.values());
  return category;
}

export async function importProcessedDataToDatabase(
  data: ProcessedServiceData,
  progressCallback?: (progress: ImportProgress) => void
): Promise<ImportStats> {
  const stats: ImportStats = {
    totalSectors: 0,
    totalCategories: 0,
    totalSubcategories: 0,
    totalServices: 0,
    filesProcessed: 0
  };

  try {
    // Clear existing data first
    await clearAllServiceData();

    progressCallback?.({
      stage: 'database-complete',
      message: 'Cleared existing service data',
      progress: 85,
      completed: false,
      error: null
    });

    // Insert sectors and their hierarchies
    for (const sectorData of data.sectors) {
      progressCallback?.({
        stage: 'inserting-sector',
        message: `Inserting sector: ${sectorData.name}`,
        progress: 90,
        completed: false,
        error: null
      });

      // Insert sector
      const { data: sector, error: sectorError } = await supabase
        .from('service_sectors')
        .insert({
          name: sectorData.name,
          description: sectorData.description,
          position: stats.totalSectors
        })
        .select()
        .single();

      if (sectorError) throw sectorError;
      stats.totalSectors++;

      // Insert categories
      for (const categoryData of sectorData.categories) {
        const { data: category, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            sector_id: sector.id,
            name: categoryData.name,
            description: categoryData.description,
            position: stats.totalCategories
          })
          .select()
          .single();

        if (categoryError) throw categoryError;
        stats.totalCategories++;

        // Insert subcategories
        for (const subcategoryData of categoryData.subcategories) {
          const { data: subcategory, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert({
              category_id: category.id,
              name: subcategoryData.name,
              description: subcategoryData.description
            })
            .select()
            .single();

          if (subcategoryError) throw subcategoryError;
          stats.totalSubcategories++;

          // Insert jobs
          for (const jobData of subcategoryData.jobs) {
            const { error: jobError } = await supabase
              .from('service_jobs')
              .insert({
                subcategory_id: subcategory.id,
                name: jobData.name,
                description: jobData.description,
                estimated_time: jobData.estimatedTime,
                price: jobData.price
              });

            if (jobError) throw jobError;
            stats.totalServices++;
          }
        }
      }
    }

    return stats;
  } catch (error) {
    console.error('Error saving to database:', error);
    throw error;
  }
}

export async function clearAllServiceData(): Promise<void> {
  const { error } = await supabase.rpc('clear_service_data');
  if (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
}

export async function getServiceCounts(): Promise<ImportStats> {
  try {
    const [sectors, categories, subcategories, jobs] = await Promise.all([
      supabase.from('service_sectors').select('id', { count: 'exact' }),
      supabase.from('service_categories').select('id', { count: 'exact' }),
      supabase.from('service_subcategories').select('id', { count: 'exact' }),
      supabase.from('service_jobs').select('id', { count: 'exact' })
    ]);

    return {
      totalSectors: sectors.count || 0,
      totalCategories: categories.count || 0,
      totalSubcategories: subcategories.count || 0,
      totalServices: jobs.count || 0,
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

export function validateServiceData(data: ProcessedServiceData): boolean {
  if (!data.sectors || data.sectors.length === 0) {
    return false;
  }

  for (const sector of data.sectors) {
    if (!sector.name) return false;
    
    for (const category of sector.categories) {
      if (!category.name) return false;
      
      for (const subcategory of category.subcategories) {
        if (!subcategory.name) return false;
        
        for (const job of subcategory.jobs) {
          if (!job.name) return false;
        }
      }
    }
  }

  return true;
}
