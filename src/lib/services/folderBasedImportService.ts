
import { supabase } from '@/integrations/supabase/client';
import { getAllSectorFiles } from './storageUtils';
import * as XLSX from 'xlsx';

export interface ProcessedServiceData {
  sector: string;
  category: string;
  subcategory: string;
  job: string;
  categories?: any[]; // Add this for compatibility
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

interface SectorFiles {
  [sectorName: string]: string[]; // Each sector maps to an array of file URLs
}

// Helper function to get total files count from SectorFiles object
function getTotalFilesCount(sectorFiles: SectorFiles): number {
  return Object.values(sectorFiles).reduce((total, files) => total + files.length, 0);
}

// Helper function to get all files from SectorFiles object
function getAllFiles(sectorFiles: SectorFiles): Array<{ sectorName: string; fileUrl: string }> {
  const allFiles: Array<{ sectorName: string; fileUrl: string }> = [];
  
  for (const [sectorName, files] of Object.entries(sectorFiles)) {
    for (const fileUrl of files) {
      allFiles.push({ sectorName, fileUrl });
    }
  }
  
  return allFiles;
}

export async function importServicesFromStorage(
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  try {
    onProgress?.({
      stage: 'fetching',
      message: 'Fetching sector files from storage...',
      progress: 5,
      completed: false,
      error: null
    });

    // Get all sector files from storage
    const sectorFiles = await getAllSectorFiles();
    
    if (!sectorFiles || Object.keys(sectorFiles).length === 0) {
      throw new Error('No sector files found in storage');
    }

    const totalFiles = getTotalFilesCount(sectorFiles);
    const allFiles = getAllFiles(sectorFiles);
    
    onProgress?.({
      stage: 'processing',
      message: `Found ${totalFiles} files across ${Object.keys(sectorFiles).length} sectors. Processing...`,
      progress: 10,
      completed: false,
      error: null
    });

    // Process all files
    const allProcessedData: ProcessedServiceData[] = [];
    let processedFiles = 0;

    for (const { sectorName, fileUrl } of allFiles) {
      try {
        onProgress?.({
          stage: 'processing',
          message: `Processing ${sectorName} file ${processedFiles + 1} of ${totalFiles}...`,
          progress: 10 + (processedFiles / totalFiles) * 70,
          completed: false,
          error: null
        });

        const processedData = await processExcelFileFromStorage(fileUrl, sectorName);
        allProcessedData.push(...processedData);
        processedFiles++;

      } catch (fileError) {
        console.error(`Error processing file ${fileUrl}:`, fileError);
        // Continue with other files instead of failing completely
      }
    }

    if (allProcessedData.length === 0) {
      throw new Error('No valid service data was processed from any files');
    }

    onProgress?.({
      stage: 'importing',
      message: `Importing ${allProcessedData.length} services to database...`,
      progress: 85,
      completed: false,
      error: null
    });

    // Import to database
    await importProcessedDataToDatabase(allProcessedData);

    // Calculate stats
    const sectors = [...new Set(allProcessedData.map(item => item.sector))];
    const categories = [...new Set(allProcessedData.map(item => `${item.sector}|${item.category}`))];
    const subcategories = [...new Set(allProcessedData.map(item => `${item.sector}|${item.category}|${item.subcategory}`))];

    const stats: ImportStats = {
      totalSectors: sectors.length,
      totalCategories: categories.length,
      totalSubcategories: subcategories.length,
      totalServices: allProcessedData.length,
      filesProcessed
    };

    onProgress?.({
      stage: 'complete',
      message: `Successfully imported ${allProcessedData.length} services from ${processedFiles} files!`,
      progress: 100,
      completed: true,
      error: null
    });

    return {
      success: true,
      message: `Import completed successfully! Processed ${processedFiles} files and imported ${allProcessedData.length} services.`,
      stats
    };

  } catch (error) {
    console.error('Import failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    onProgress?.({
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

export async function processExcelFileFromStorage(
  fileUrl: string, 
  sectorName: string
): Promise<ProcessedServiceData[]> {
  try {
    // Download the file from storage
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Process the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const processedData: ProcessedServiceData[] = [];
    
    // Skip header row and process data
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row && row.length >= 3) {
        const [category, subcategory, job] = row;
        
        if (category && subcategory && job) {
          processedData.push({
            sector: sectorName,
            category: String(category).trim(),
            subcategory: String(subcategory).trim(),
            job: String(job).trim()
          });
        }
      }
    }
    
    return processedData;
  } catch (error) {
    console.error(`Error processing Excel file ${fileUrl}:`, error);
    throw error;
  }
}

export async function importProcessedDataToDatabase(data: ProcessedServiceData[]): Promise<void> {
  // Clear existing data first
  await clearAllServiceData();
  
  // Group data by sector
  const sectorMap = new Map<string, ProcessedServiceData[]>();
  
  for (const item of data) {
    if (!sectorMap.has(item.sector)) {
      sectorMap.set(item.sector, []);
    }
    sectorMap.get(item.sector)!.push(item);
  }
  
  // Process each sector
  for (const [sectorName, sectorData] of sectorMap.entries()) {
    // Insert sector
    const { data: sector, error: sectorError } = await supabase
      .from('service_sectors')
      .insert([{ name: sectorName, description: `${sectorName} services` }])
      .select()
      .single();
    
    if (sectorError) {
      console.error('Error inserting sector:', sectorError);
      continue;
    }
    
    // Group by category within sector
    const categoryMap = new Map<string, ProcessedServiceData[]>();
    
    for (const item of sectorData) {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, []);
      }
      categoryMap.get(item.category)!.push(item);
    }
    
    // Process each category
    for (const [categoryName, categoryData] of categoryMap.entries()) {
      // Insert category
      const { data: category, error: categoryError } = await supabase
        .from('service_main_categories')
        .insert([{ 
          name: categoryName,
          description: `${categoryName} in ${sectorName}`,
          sector_id: sector.id
        }])
        .select()
        .single();
      
      if (categoryError) {
        console.error('Error inserting category:', categoryError);
        continue;
      }
      
      // Group by subcategory within category
      const subcategoryMap = new Map<string, ProcessedServiceData[]>();
      
      for (const item of categoryData) {
        if (!subcategoryMap.has(item.subcategory)) {
          subcategoryMap.set(item.subcategory, []);
        }
        subcategoryMap.get(item.subcategory)!.push(item);
      }
      
      // Process each subcategory
      for (const [subcategoryName, subcategoryData] of subcategoryMap.entries()) {
        // Insert subcategory
        const { data: subcategory, error: subcategoryError } = await supabase
          .from('service_subcategories')
          .insert([{
            name: subcategoryName,
            description: `${subcategoryName} services`,
            main_category_id: category.id
          }])
          .select()
          .single();
        
        if (subcategoryError) {
          console.error('Error inserting subcategory:', subcategoryError);
          continue;
        }
        
        // Insert all jobs for this subcategory
        const jobsToInsert = subcategoryData.map(item => ({
          name: item.job,
          description: `${item.job} service`,
          subcategory_id: subcategory.id
        }));
        
        const { error: jobsError } = await supabase
          .from('service_jobs')
          .insert(jobsToInsert);
        
        if (jobsError) {
          console.error('Error inserting jobs:', jobsError);
        }
      }
    }
  }
}

export async function validateServiceData(data: ProcessedServiceData[]): Promise<boolean> {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }
  
  return data.every(item => 
    item.sector && 
    item.category && 
    item.subcategory && 
    item.job &&
    typeof item.sector === 'string' &&
    typeof item.category === 'string' &&
    typeof item.subcategory === 'string' &&
    typeof item.job === 'string'
  );
}

export async function clearAllServiceData(): Promise<void> {
  try {
    // Delete in correct order due to foreign key constraints
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_main_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('All service data cleared successfully');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
}

export async function getServiceCounts(): Promise<ImportStats> {
  try {
    const [sectorsResult, categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
      supabase.from('service_sectors').select('id', { count: 'exact' }),
      supabase.from('service_main_categories').select('id', { count: 'exact' }),
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
