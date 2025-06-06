import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { storageService, type StorageFile } from './unifiedStorageService';
import type { ProcessedServiceData } from './serviceDataProcessor';

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
  stats: ImportStats;
}

export interface ImportStats {
  totalSectors: number;
  totalCategories: number;
  totalSubcategories: number;
  totalJobs: number;
  importedSectors: number;
  importedCategories: number;
  importedSubcategories: number;
  importedJobs: number;
  errors: string[];
}

async function processExcelFile(file: File): Promise<ProcessedServiceData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const data: string = (e.target as FileReader).result as string;
        const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'binary' });
        const sheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[sheetName];

        // Convert worksheet to JSON array
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Process the jsonData to match the ProcessedServiceData structure
        const processedData: ProcessedServiceData[] = processServiceData(jsonData);
        resolve(processedData);
      } catch (error) {
        console.error("Error processing Excel file:", error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      console.error("Error reading Excel file:", error);
      reject(error);
    };

    reader.readAsBinaryString(file);
  });
}

async function processExcelFileFromStorage(bucketName: string, filePath: string): Promise<ProcessedServiceData[]> {
  try {
    const blob = await storageService.downloadFile(bucketName, filePath);
    if (!blob) {
      throw new Error(`Failed to download file from storage: ${bucketName}/${filePath}`);
    }

    const arrayBuffer = await blob.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const processedData: ProcessedServiceData[] = processServiceData(jsonData);
    return processedData;

  } catch (error) {
    console.error('Error processing Excel file from storage:', error);
    throw error;
  }
}

function processServiceData(jsonData: any[]): ProcessedServiceData[] {
  const sectors: { [key: string]: ProcessedServiceData } = {};

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];

    if (!row || row.length < 4) {
      console.warn('Skipping row due to insufficient data:', row);
      continue;
    }

    const sectorName = row[0]?.toString().trim();
    const categoryName = row[1]?.toString().trim();
    const subcategoryName = row[2]?.toString().trim();
    const jobName = row[3]?.toString().trim();
    const jobPrice = parseFloat(row[4]) || 0;
    const jobDescription = row[5]?.toString().trim() || '';

    if (!sectorName || !categoryName || !subcategoryName || !jobName) {
      console.warn('Skipping row due to missing data:', row);
      continue;
    }

    if (!sectors[sectorName]) {
      sectors[sectorName] = {
        sectorName: sectorName,
        categories: {}
      };
    }

    if (!sectors[sectorName].categories[categoryName]) {
      sectors[sectorName].categories[categoryName] = {
        name: categoryName,
        subcategories: {}
      };
    }

    if (!sectors[sectorName].categories[categoryName].subcategories[subcategoryName]) {
      sectors[sectorName].categories[categoryName].subcategories[subcategoryName] = {
        name: subcategoryName,
        jobs: []
      };
    }

    sectors[sectorName].categories[categoryName].subcategories[subcategoryName].jobs.push({
      name: jobName,
      price: jobPrice,
      description: jobDescription
    });
  }

  // Convert the sectors object into the desired array format
  return Object.values(sectors).map(sector => ({
    ...sector,
    categories: Object.values(sector.categories).map(category => ({
      ...category,
      subcategories: Object.values(category.subcategories)
    }))
  }));
}

async function clearAllServiceData(): Promise<void> {
  try {
    // Delete all rows from the 'service_sectors' table
    const { error: sectorsError } = await supabase
      .from('service_sectors')
      .delete()
      .neq('id', -1); // This is a workaround to delete all rows

    if (sectorsError) {
      throw new Error(`Error clearing service_sectors table: ${sectorsError.message}`);
    }

    // Delete all rows from the 'service_categories' table
    const { error: categoriesError } = await supabase
      .from('service_categories')
      .delete()
      .neq('id', -1);

    if (categoriesError) {
      throw new Error(`Error clearing service_categories table: ${categoriesError.message}`);
    }

    // Delete all rows from the 'service_subcategories' table
    const { error: subcategoriesError } = await supabase
      .from('service_subcategories')
      .delete()
      .neq('id', -1);

    if (subcategoriesError) {
      throw new Error(`Error clearing service_subcategories table: ${subcategoriesError.message}`);
    }

    // Delete all rows from the 'services' table
    const { error: servicesError } = await supabase
      .from('services')
      .delete()
      .neq('id', -1);

    if (servicesError) {
      throw new Error(`Error clearing services table: ${servicesError.message}`);
    }

    console.log('All service data cleared successfully');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
}

async function getServiceCounts(): Promise<{
  sectorCount: number;
  categoryCount: number;
  subcategoryCount: number;
  jobCount: number;
}> {
  try {
    const { count: sectorCount, error: sectorError } = await supabase
      .from('service_sectors')
      .select('*', { count: 'exact' });

    if (sectorError) {
      throw new Error(`Error fetching service_sectors count: ${sectorError.message}`);
    }

    const { count: categoryCount, error: categoryError } = await supabase
      .from('service_categories')
      .select('*', { count: 'exact' });

    if (categoryError) {
      throw new Error(`Error fetching service_categories count: ${categoryError.message}`);
    }

    const { count: subcategoryCount, error: subcategoryError } = await supabase
      .from('service_subcategories')
      .select('*', { count: 'exact' });

    if (subcategoryError) {
      throw new Error(`Error fetching service_subcategories count: ${subcategoryError.message}`);
    }

    const { count: jobCount, error: jobError } = await supabase
      .from('services')
      .select('*', { count: 'exact' });

    if (jobError) {
      throw new Error(`Error fetching services count: ${jobError.message}`);
    }

    return {
      sectorCount: sectorCount || 0,
      categoryCount: categoryCount || 0,
      subcategoryCount: subcategoryCount || 0,
      jobCount: jobCount || 0
    };
  } catch (error) {
    console.error('Error fetching service counts:', error);
    throw error;
  }
}

export async function importServicesFromStorage(
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  const updateProgress = (stage: string, message: string, progress: number, error?: string) => {
    console.log(`Import Progress: ${stage} - ${message} (${progress}%)`);
    onProgress?.({
      stage,
      message,
      progress,
      completed: progress >= 100,
      error: error || null
    });
  };

  try {
    updateProgress('validation', 'Checking storage bucket...', 0);
    
    // Check if bucket exists
    const bucketExists = await storageService.checkBucketExists('service-imports');
    if (!bucketExists) {
      throw new Error('Storage bucket "service-imports" not found');
    }

    // Get bucket information
    const bucketInfo = await storageService.getBucketInfo('service-imports');
    console.log('Bucket info:', bucketInfo);

    if (bucketInfo.folders.length === 0) {
      throw new Error('No sector folders found in storage bucket');
    }

    updateProgress('discovery', `Found ${bucketInfo.folders.length} sector folders`, 10);

    // Process each sector folder
    const allProcessedData: ProcessedServiceData[] = [];
    const totalFolders = bucketInfo.folders.length;

    for (let i = 0; i < bucketInfo.folders.length; i++) {
      const folder = bucketInfo.folders[i];
      const progressPercent = 10 + (i / totalFolders) * 60; // 10-70% for processing
      
      updateProgress('processing', `Processing sector: ${folder.name}`, progressPercent);
      
      try {
        const filesInFolder = await storageService.getFilesInFolder('service-imports', folder.path, ['.xlsx']);
        console.log(`Files in ${folder.name}:`, filesInFolder);

        for (const file of filesInFolder) {
          console.log(`Processing file: ${file.name}`);
          const processedData = await processExcelFileFromStorage('service-imports', file.path);
          
          if (processedData && processedData.length > 0) {
            allProcessedData.push(...processedData);
          }
        }
      } catch (error) {
        console.error(`Error processing folder ${folder.name}:`, error);
        updateProgress('error', `Failed to process folder: ${folder.name}`, progressPercent, error instanceof Error ? error.message : 'Unknown error');
        // Continue with other folders instead of failing completely
      }
    }

    updateProgress('validation', 'Validating processed data...', 70);

    // Validate processed data
    const validationErrors = await validateServiceData(allProcessedData);
    if (validationErrors.length > 0) {
      console.warn('Validation warnings:', validationErrors);
      // Log warnings but don't fail the import
    }

    updateProgress('import', 'Importing to database...', 80);

    // Import to database
    const importStats = await importProcessedDataToDatabase(allProcessedData);

    updateProgress('complete', 'Import completed successfully!', 100);

    return {
      success: true,
      message: `Successfully imported ${importStats.totalJobs} services from ${bucketInfo.folders.length} sectors`,
      stats: importStats
    };

  } catch (error) {
    console.error('Import failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    updateProgress('error', errorMessage, 0, errorMessage);
    
    return {
      success: false,
      message: errorMessage,
      stats: {
        totalSectors: 0,
        totalCategories: 0,
        totalSubcategories: 0,
        totalJobs: 0,
        importedSectors: 0,
        importedCategories: 0,
        importedSubcategories: 0,
        importedJobs: 0,
        errors: [errorMessage]
      }
    };
  }
}

