
import { supabase } from '@/integrations/supabase/client';
import { processServiceDataFromSheets, importProcessedDataToDatabase } from './serviceDataProcessor';

export interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
}

export interface ImportResult {
  totalImported: number;
  errors: string[];
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
}

export interface ImportStats {
  totalImported: number;
  errors: string[];
}

export interface ProcessedServiceData {
  sectors: {
    name: string;
    description?: string;
    categories: {
      name: string;
      description?: string;
      subcategories: {
        name: string;
        description?: string;
        jobs: {
          name: string;
          description?: string;
          estimatedTime?: number;
          price?: number;
        }[];
      }[];
    }[];
  }[];
}

export async function processExcelFileFromStorage(fileName: string): Promise<any[]> {
  try {
    console.log(`Processing Excel file: ${fileName}`);
    
    // Download file from storage
    const { data, error } = await supabase.storage
      .from('service-data')
      .download(fileName);
    
    if (error) {
      console.error(`Error downloading ${fileName}:`, error);
      throw new Error(`Failed to download ${fileName}: ${error.message}`);
    }
    
    if (!data) {
      throw new Error(`No data received for ${fileName}`);
    }
    
    console.log(`Downloaded ${fileName}, size: ${data.size} bytes`);
    
    // Process the file using the existing service processor
    const processedData = await processServiceDataFromSheets([data]);
    console.log(`Processed data from ${fileName}:`, processedData);
    
    return processedData;
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error);
    throw error;
  }
}

export async function clearAllServiceData(): Promise<void> {
  try {
    console.log('Starting to clear all service data...');
    
    // Clear in reverse dependency order
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('Successfully cleared all service data');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
}

export async function getServiceCounts(): Promise<{
  sectors: number;
  categories: number;
  subcategories: number;
  jobs: number;
}> {
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

export async function importServicesFromStorage(
  progressCallback?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  try {
    console.log('Starting import from storage...');
    
    progressCallback?.({
      stage: 'listing-files',
      progress: 10,
      message: 'Listing files in storage...',
      completed: false,
      error: null
    });

    // List all files in the service-data bucket
    const { data: files, error: listError } = await supabase.storage
      .from('service-data')
      .list('', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (listError) {
      throw new Error(`Failed to list files: ${listError.message}`);
    }

    if (!files || files.length === 0) {
      throw new Error('No files found in service-data storage bucket');
    }

    console.log(`Found ${files.length} files in storage`);

    progressCallback?.({
      stage: 'processing-files',
      progress: 20,
      message: `Processing ${files.length} files...`,
      completed: false,
      error: null
    });

    // Process all Excel files
    const allProcessedData: any[] = [];
    let processedFileCount = 0;

    for (const file of files) {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        try {
          console.log(`Processing file: ${file.name}`);
          const fileData = await processExcelFileFromStorage(file.name);
          allProcessedData.push(...fileData);
          processedFileCount++;
          
          const progress = 20 + (processedFileCount / files.length) * 60;
          progressCallback?.({
            stage: 'processing-files',
            progress,
            message: `Processed ${processedFileCount}/${files.length} files...`,
            completed: false,
            error: null
          });
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          // Continue with other files
        }
      }
    }

    if (allProcessedData.length === 0) {
      throw new Error('No valid service data found in any files');
    }

    progressCallback?.({
      stage: 'organizing-data',
      progress: 85,
      message: 'Organizing service data...',
      completed: false,
      error: null
    });

    // Transform the flat data into hierarchical structure
    const organizedData = organizeServiceData(allProcessedData);

    progressCallback?.({
      stage: 'importing-to-database',
      progress: 90,
      message: 'Importing to database...',
      completed: false,
      error: null
    });

    // Import the organized data to database
    const importStats = await importProcessedDataToDatabase(organizedData);

    const result: ImportResult = {
      totalImported: importStats.totalImported,
      errors: importStats.errors,
      sectors: organizedData.sectors.length,
      categories: organizedData.sectors.reduce((sum, s) => sum + s.categories.length, 0),
      subcategories: organizedData.sectors.reduce((sum, s) => 
        sum + s.categories.reduce((catSum, c) => catSum + c.subcategories.length, 0), 0),
      services: organizedData.sectors.reduce((sum, s) => 
        sum + s.categories.reduce((catSum, c) => 
          catSum + c.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0), 0)
    };

    console.log('Import completed successfully:', result);
    return result;
    
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

function organizeServiceData(data: any[]): ProcessedServiceData {
  const sectorsMap = new Map();
  
  data.forEach(row => {
    const sectorName = row.sector || row.Sector || 'Unknown Sector';
    const categoryName = row.category || row.Category || 'Unknown Category';
    const subcategoryName = row.subcategory || row.Subcategory || 'Unknown Subcategory';
    const serviceName = row.service || row.Service || row.job || row.Job || 'Unknown Service';
    
    // Get or create sector
    if (!sectorsMap.has(sectorName)) {
      sectorsMap.set(sectorName, {
        name: sectorName,
        categories: new Map()
      });
    }
    const sector = sectorsMap.get(sectorName);
    
    // Get or create category
    if (!sector.categories.has(categoryName)) {
      sector.categories.set(categoryName, {
        name: categoryName,
        subcategories: new Map()
      });
    }
    const category = sector.categories.get(categoryName);
    
    // Get or create subcategory
    if (!category.subcategories.has(subcategoryName)) {
      category.subcategories.set(subcategoryName, {
        name: subcategoryName,
        jobs: []
      });
    }
    const subcategory = category.subcategories.get(subcategoryName);
    
    // Add service/job
    subcategory.jobs.push({
      name: serviceName,
      description: row.description || row.Description || '',
      estimatedTime: row.estimatedTime || row.EstimatedTime || 0,
      price: row.price || row.Price || 0
    });
  });
  
  // Convert maps to arrays
  const sectors = Array.from(sectorsMap.values()).map(sector => ({
    name: sector.name,
    categories: Array.from(sector.categories.values()).map(category => ({
      name: category.name,
      subcategories: Array.from(category.subcategories.values())
    }))
  }));
  
  return { sectors };
}
