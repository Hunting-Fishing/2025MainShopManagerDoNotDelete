
import { supabase } from '@/integrations/supabase/client';
import { storageService, type SectorFiles } from './unifiedStorageService';
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
  error?: string;
}

export interface ImportStats {
  totalSectors: number;
  totalCategories: number;
  totalSubcategories: number;
  totalServices: number;
  filesProcessed: number;
}

export interface ProcessedServiceData {
  sectorName: string;
  categories: Array<{
    name: string;
    subcategories: Array<{
      name: string;
      services: string[];
    }>;
  }>;
}

// Helper function to get total files count from SectorFiles
function getTotalFilesCount(sectorFiles: SectorFiles): number {
  return Object.values(sectorFiles).reduce((total, files) => total + files.length, 0);
}

// Helper function to get all files from SectorFiles
function getAllFiles(sectorFiles: SectorFiles): Array<{ sectorName: string; files: any[] }> {
  return Object.entries(sectorFiles).map(([sectorName, files]) => ({
    sectorName,
    files
  }));
}

export async function importServicesFromStorage(
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  try {
    // Step 1: Discovery - Find all sector files
    onProgress?.({
      stage: 'starting',
      message: 'Discovering service files in storage...',
      progress: 0,
      completed: false,
      error: null
    });

    const sectorFiles = await storageService.getAllSectorFiles('service-data');
    
    if (!sectorFiles || Object.keys(sectorFiles).length === 0) {
      throw new Error('No service files found in storage');
    }

    const totalFiles = getTotalFilesCount(sectorFiles);
    const sectorsFound = Object.keys(sectorFiles).length;

    onProgress?.({
      stage: 'folders-found',
      message: `Found ${sectorsFound} sectors with ${totalFiles} total files`,
      progress: 10,
      completed: false,
      error: null
    });

    // Step 2: Process each sector and its files
    const allProcessedData: ProcessedServiceData[] = [];
    let filesProcessed = 0;

    const allSectorData = getAllFiles(sectorFiles);

    for (const { sectorName, files } of allSectorData) {
      onProgress?.({
        stage: 'processing-sector',
        message: `Processing sector: ${sectorName} (${files.length} files)`,
        progress: 20 + (filesProcessed / totalFiles) * 50,
        completed: false,
        error: null
      });

      for (const file of files) {
        onProgress?.({
          stage: 'processing-file',
          message: `Processing file: ${file.name} in ${sectorName}`,
          progress: 20 + (filesProcessed / totalFiles) * 50,
          completed: false,
          error: null
        });

        try {
          const processedData = await processExcelFileFromStorage('service-data', file.path);
          if (processedData) {
            // Override the sector name with the folder name
            processedData.sectorName = sectorName;
            allProcessedData.push(processedData);
          }
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          // Continue with other files even if one fails
        }

        filesProcessed++;
      }
    }

    // Step 3: Import to database
    onProgress?.({
      stage: 'saving-to-database',
      message: 'Saving processed data to database...',
      progress: 70,
      completed: false,
      error: null
    });

    const importStats = await importProcessedDataToDatabase(allProcessedData, onProgress);

    onProgress?.({
      stage: 'complete',
      message: 'Service import completed successfully!',
      progress: 100,
      completed: true,
      error: null
    });

    return {
      success: true,
      message: `Successfully imported services from ${sectorsFound} sectors`,
      stats: {
        ...importStats,
        filesProcessed
      }
    };

  } catch (error) {
    console.error('Service import failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during import';
    
    onProgress?.({
      stage: 'error',
      message: errorMessage,
      progress: 0,
      completed: false,
      error: errorMessage
    });

    return {
      success: false,
      message: errorMessage,
      error: errorMessage
    };
  }
}

export async function processExcelFileFromStorage(
  bucketName: string,
  filePath: string
): Promise<ProcessedServiceData | null> {
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

    // Convert blob to array buffer
    const arrayBuffer = await data.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('No sheets found in Excel file');
    }

    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
    
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      throw new Error('No data found in Excel sheet');
    }

    return parseExcelData(jsonData, filePath);
  } catch (error) {
    console.error(`Error processing Excel file ${filePath}:`, error);
    throw error;
  }
}

function parseExcelData(data: any[][], filePath: string): ProcessedServiceData {
  const processedData: ProcessedServiceData = {
    sectorName: extractSectorFromPath(filePath),
    categories: []
  };

  let currentCategory: { name: string; subcategories: Array<{ name: string; services: string[] }> } | null = null;
  let currentSubcategory: { name: string; services: string[] } | null = null;

  for (const row of data) {
    if (!row || row.length === 0) continue;

    const cellA = String(row[0] || '').trim();
    const cellB = String(row[1] || '').trim();
    const cellC = String(row[2] || '').trim();

    // Category detection (first column has value, others are empty or minimal)
    if (cellA && (!cellB || cellB.length < 3) && (!cellC || cellC.length < 3)) {
      // Save previous category
      if (currentCategory && currentSubcategory) {
        currentCategory.subcategories.push(currentSubcategory);
      }
      if (currentCategory) {
        processedData.categories.push(currentCategory);
      }

      // Start new category
      currentCategory = { name: cellA, subcategories: [] };
      currentSubcategory = null;
    }
    // Subcategory detection (indented or second column)
    else if (cellB && !cellC) {
      // Save previous subcategory
      if (currentSubcategory && currentCategory) {
        currentCategory.subcategories.push(currentSubcategory);
      }

      // Start new subcategory
      currentSubcategory = { name: cellB, services: [] };
    }
    // Service detection (third column or continuation)
    else if (cellC && currentSubcategory) {
      currentSubcategory.services.push(cellC);
    }
    // Handle single-column services
    else if (cellA && currentSubcategory && !cellB && !cellC) {
      currentSubcategory.services.push(cellA);
    }
  }

  // Save final subcategory and category
  if (currentSubcategory && currentCategory) {
    currentCategory.subcategories.push(currentSubcategory);
  }
  if (currentCategory) {
    processedData.categories.push(currentCategory);
  }

  return processedData;
}

function extractSectorFromPath(filePath: string): string {
  const pathParts = filePath.split('/');
  return pathParts[pathParts.length - 2] || 'Unknown';
}

export async function importProcessedDataToDatabase(
  processedDataArray: ProcessedServiceData[],
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportStats> {
  const stats: ImportStats = {
    totalSectors: 0,
    totalCategories: 0,
    totalSubcategories: 0,
    totalServices: 0,
    filesProcessed: processedDataArray.length
  };

  for (let i = 0; i < processedDataArray.length; i++) {
    const processedData = processedDataArray[i];
    
    onProgress?.({
      stage: 'inserting-sector',
      message: `Inserting sector: ${processedData.sectorName}`,
      progress: 70 + (i / processedDataArray.length) * 25,
      completed: false,
      error: null
    });

    // Insert sector
    const { data: sectorData, error: sectorError } = await supabase
      .from('service_sectors')
      .insert({ name: processedData.sectorName })
      .select('id')
      .single();

    if (sectorError) {
      console.error('Error inserting sector:', sectorError);
      continue;
    }

    stats.totalSectors++;

    // Insert categories, subcategories, and jobs
    for (const category of processedData.categories) {
      const { data: categoryData, error: categoryError } = await supabase
        .from('service_categories')
        .insert({ 
          name: category.name,
          sector_id: sectorData.id
        })
        .select('id')
        .single();

      if (categoryError) {
        console.error('Error inserting category:', categoryError);
        continue;
      }

      stats.totalCategories++;

      for (const subcategory of category.subcategories) {
        const { data: subcategoryData, error: subcategoryError } = await supabase
          .from('service_subcategories')
          .insert({
            name: subcategory.name,
            category_id: categoryData.id
          })
          .select('id')
          .single();

        if (subcategoryError) {
          console.error('Error inserting subcategory:', subcategoryError);
          continue;
        }

        stats.totalSubcategories++;

        for (const service of subcategory.services) {
          const { error: jobError } = await supabase
            .from('service_jobs')
            .insert({
              name: service,
              subcategory_id: subcategoryData.id
            });

          if (jobError) {
            console.error('Error inserting job:', jobError);
            continue;
          }

          stats.totalServices++;
        }
      }
    }
  }

  onProgress?.({
    stage: 'database-complete',
    message: 'Database import completed',
    progress: 95,
    completed: false,
    error: null
  });

  return stats;
}

export async function validateServiceData(data: ProcessedServiceData[]): Promise<boolean> {
  // Add validation logic here
  return data.length > 0;
}

export async function clearAllServiceData(): Promise<void> {
  // Delete in reverse order to respect foreign key constraints
  await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

export async function getServiceCounts(): Promise<ImportStats> {
  const [sectorsResult, categoriesResult, subcategoriesResult, servicesResult] = await Promise.all([
    supabase.from('service_sectors').select('id', { count: 'exact' }),
    supabase.from('service_categories').select('id', { count: 'exact' }),
    supabase.from('service_subcategories').select('id', { count: 'exact' }),
    supabase.from('service_jobs').select('id', { count: 'exact' })
  ]);

  return {
    totalSectors: sectorsResult.count || 0,
    totalCategories: categoriesResult.count || 0,
    totalSubcategories: subcategoriesResult.count || 0,
    totalServices: servicesResult.count || 0,
    filesProcessed: 0
  };
}
