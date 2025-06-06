import { supabase } from '@/integrations/supabase/client';
import { storageService } from './unifiedStorageService';
import * as XLSX from 'xlsx';

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

// Updated ProcessedServiceData type to include categories
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

export async function processExcelFileFromStorage(
  bucketName: string,
  filePath: string,
  sectorName: string,
  onProgress: (progress: ImportProgress) => void
): Promise<any> {
  try {
    onProgress({
      stage: 'processing-file',
      message: `Processing file: ${filePath}`,
      progress: 0,
      completed: false,
      error: null
    });

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (downloadError) {
      throw new Error(`Failed to download file ${filePath}: ${downloadError.message}`);
    }

    // Convert to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Parse Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert to JSON with proper typing
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    if (!jsonData || jsonData.length === 0) {
      throw new Error(`No data found in file: ${filePath}`);
    }

    // Process the data based on your Excel structure
    // This assumes your Excel has columns: Category, Subcategory, Service, Description, EstimatedTime, Price
    const processedData = processExcelData(jsonData, sectorName);

    onProgress({
      stage: 'processing-file',
      message: `Completed processing file: ${filePath}`,
      progress: 100,
      completed: false,
      error: null
    });

    return processedData;

  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw error;
  }
}

function processExcelData(data: any[][], sectorName: string): any {
  const categories: Record<string, any> = {};
  
  // Skip header row and process data
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 3) continue; // Skip empty or incomplete rows
    
    const [categoryName, subcategoryName, serviceName, description, estimatedTime, price] = row;
    
    if (!categoryName || !subcategoryName || !serviceName) continue;
    
    // Initialize category if it doesn't exist
    if (!categories[categoryName]) {
      categories[categoryName] = {
        name: categoryName,
        description: '',
        subcategories: {}
      };
    }
    
    // Initialize subcategory if it doesn't exist
    if (!categories[categoryName].subcategories[subcategoryName]) {
      categories[categoryName].subcategories[subcategoryName] = {
        name: subcategoryName,
        description: '',
        jobs: []
      };
    }
    
    // Add service/job
    categories[categoryName].subcategories[subcategoryName].jobs.push({
      name: serviceName,
      description: description || '',
      estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
      price: price ? parseFloat(price) : undefined
    });
  }
  
  // Convert to array format
  const categoriesArray = Object.values(categories).map(category => ({
    ...category,
    subcategories: Object.values(category.subcategories)
  }));
  
  return {
    name: sectorName,
    description: '',
    categories: categoriesArray
  };
}

export async function importServicesFromStorage(
  onProgress: (progress: ImportProgress) => void
): Promise<ImportResult> {
  try {
    onProgress({
      stage: 'starting',
      message: 'Starting service import from storage...',
      progress: 0,
      completed: false,
      error: null
    });

    const bucketName = 'service-data';
    
    // Get all sector files without limits
    onProgress({
      stage: 'folders-found',
      message: 'Discovering sector folders...',
      progress: 10,
      completed: false,
      error: null
    });

    const sectorFiles = await storageService.getAllSectorFiles(bucketName);
    
    if (Object.keys(sectorFiles).length === 0) {
      throw new Error('No sector folders found in storage bucket');
    }

    console.log(`Found ${Object.keys(sectorFiles).length} sector folders:`, Object.keys(sectorFiles));

    // Process all sectors
    const processedData: ProcessedServiceData = { sectors: [] };
    let totalFiles = 0;
    Object.values(sectorFiles).forEach(files => totalFiles += files.length);

    let processedFiles = 0;

    for (const [sectorName, files] of Object.entries(sectorFiles)) {
      onProgress({
        stage: 'processing-sector',
        message: `Processing sector: ${sectorName} (${files.length} files)`,
        progress: 20 + (processedFiles / totalFiles) * 60,
        completed: false,
        error: null
      });

      const sectorData = {
        name: sectorName,
        description: '',
        categories: [] as any[]
      };

      // Process all files in this sector
      for (const file of files) {
        try {
          onProgress({
            stage: 'processing-file',
            message: `Processing ${file.name} in ${sectorName}`,
            progress: 20 + (processedFiles / totalFiles) * 60,
            completed: false,
            error: null
          });

          const fileData = await processExcelFileFromStorage(
            bucketName,
            file.path,
            sectorName,
            onProgress
          );

          if (fileData && fileData.categories && Array.isArray(fileData.categories)) {
            sectorData.categories.push(...fileData.categories);
          }

          processedFiles++;
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          // Continue with other files even if one fails
        }
      }

      if (sectorData.categories.length > 0) {
        processedData.sectors.push(sectorData);
      }
    }

    // Import to database
    onProgress({
      stage: 'saving-to-database',
      message: 'Saving processed data to database...',
      progress: 80,
      completed: false,
      error: null
    });

    await importProcessedDataToDatabase(processedData, onProgress);

    // Calculate final stats
    const stats: ImportStats = {
      totalSectors: processedData.sectors.length,
      totalCategories: processedData.sectors.reduce((acc, sector) => acc + sector.categories.length, 0),
      totalSubcategories: processedData.sectors.reduce((acc, sector) => 
        acc + sector.categories.reduce((catAcc, category) => catAcc + category.subcategories.length, 0), 0),
      totalServices: processedData.sectors.reduce((acc, sector) => 
        acc + sector.categories.reduce((catAcc, category) => 
          catAcc + category.subcategories.reduce((subAcc, subcategory) => 
            subAcc + subcategory.jobs.length, 0), 0), 0),
      filesProcessed: totalFiles
    };

    onProgress({
      stage: 'complete',
      message: `Import completed! Processed ${stats.totalServices} services across ${stats.totalSectors} sectors.`,
      progress: 100,
      completed: true,
      error: null
    });

    return {
      success: true,
      message: `Successfully imported ${stats.totalServices} services across ${stats.totalSectors} sectors from ${stats.filesProcessed} files.`,
      stats
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
      message: 'Import failed',
      error: errorMessage
    };
  }
}

export async function importProcessedDataToDatabase(
  data: ProcessedServiceData,
  onProgress: (progress: ImportProgress) => void
): Promise<void> {
  try {
    // Clear existing data first
    onProgress({
      stage: 'database-cleanup',
      message: 'Clearing existing service data...',
      progress: 0,
      completed: false,
      error: null
    });

    await clearAllServiceData();

    let totalItems = 0;
    let processedItems = 0;

    // Count total items to process
    data.sectors.forEach(sector => {
      totalItems++; // sector
      sector.categories.forEach(category => {
        totalItems++; // category
        category.subcategories.forEach(subcategory => {
          totalItems++; // subcategory
          totalItems += subcategory.jobs.length; // jobs
        });
      });
    });

    // Insert sectors and their hierarchies
    for (const sector of data.sectors) {
      onProgress({
        stage: 'inserting-sector',
        message: `Inserting sector: ${sector.name}`,
        progress: (processedItems / totalItems) * 100,
        completed: false,
        error: null
      });

      // Insert sector
      const { data: sectorData, error: sectorError } = await supabase
        .from('service_sectors')
        .insert({
          name: sector.name,
          description: sector.description || '',
          position: processedItems
        })
        .select()
        .single();

      if (sectorError) throw sectorError;
      processedItems++;

      // Insert categories for this sector
      for (const category of sector.categories) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            name: category.name,
            description: category.description || '',
            sector_id: sectorData.id,
            position: processedItems
          })
          .select()
          .single();

        if (categoryError) throw categoryError;
        processedItems++;

        // Insert subcategories for this category
        for (const subcategory of category.subcategories) {
          const { data: subcategoryData, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert({
              name: subcategory.name,
              description: subcategory.description || '',
              category_id: categoryData.id
            })
            .select()
            .single();

          if (subcategoryError) throw subcategoryError;
          processedItems++;

          // Insert jobs for this subcategory
          if (subcategory.jobs.length > 0) {
            const jobsToInsert = subcategory.jobs.map(job => ({
              name: job.name,
              description: job.description || '',
              estimated_time: job.estimatedTime,
              price: job.price,
              subcategory_id: subcategoryData.id
            }));

            const { error: jobsError } = await supabase
              .from('service_jobs')
              .insert(jobsToInsert);

            if (jobsError) throw jobsError;
            processedItems += subcategory.jobs.length;
          }
        }
      }
    }

    onProgress({
      stage: 'database-complete',
      message: 'Database import completed successfully',
      progress: 100,
      completed: false,
      error: null
    });

  } catch (error) {
    console.error('Database import error:', error);
    throw error;
  }
}

export async function clearAllServiceData(): Promise<void> {
  try {
    // Delete in order due to foreign key constraints
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
}

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
    throw error;
  }
}

export async function validateServiceData(data: ProcessedServiceData): Promise<boolean> {
  try {
    if (!data || !data.sectors || !Array.isArray(data.sectors)) {
      return false;
    }

    for (const sector of data.sectors) {
      if (!sector.name || !sector.categories || !Array.isArray(sector.categories)) {
        return false;
      }

      for (const category of sector.categories) {
        if (!category.name || !category.subcategories || !Array.isArray(category.subcategories)) {
          return false;
        }

        for (const subcategory of category.subcategories) {
          if (!subcategory.name || !subcategory.jobs || !Array.isArray(subcategory.jobs)) {
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
  } catch (error) {
    console.error('Error validating service data:', error);
    return false;
  }
}
