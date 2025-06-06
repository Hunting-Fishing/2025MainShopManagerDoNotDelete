
import { storageService } from './unifiedStorageService';
import { supabase } from '@/lib/supabase';
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
  totalServices: number;
  filesProcessed: number;
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats?: ImportStats;
  error?: string;
}

// Updated interface to match the data structure we're working with
interface ProcessedServiceData {
  sectorName: string;
  categories: ServiceMainCategory[];
}

interface ServiceMainCategory {
  id: string;
  name: string;
  description: string;
  subcategories: ServiceSubcategory[];
}

interface ServiceSubcategory {
  id: string;
  name: string;
  description: string;
  jobs: ServiceJob[];
}

interface ServiceJob {
  id: string;
  name: string;
  description: string;
  estimatedTime?: number;
  price?: number;
}

/**
 * Import services from storage with comprehensive error handling and unlimited processing
 */
export async function importServicesFromStorage(
  onProgress: (progress: ImportProgress) => void
): Promise<ImportResult> {
  try {
    console.log('Starting comprehensive service import from storage...');
    
    onProgress({
      stage: 'starting',
      message: 'Initializing import process...',
      progress: 0,
      completed: false,
      error: null
    });

    // Get all sector files from storage (unlimited)
    onProgress({
      stage: 'folders-found',
      message: 'Discovering sector folders and files...',
      progress: 5,
      completed: false,
      error: null
    });

    const sectorFiles = await storageService.getAllSectorFiles('service-imports');
    console.log('Retrieved sector files:', sectorFiles);

    // Convert SectorFiles object to array for processing
    const sectorEntries = Object.entries(sectorFiles);
    const totalSectors = sectorEntries.length;
    
    if (totalSectors === 0) {
      throw new Error('No sector folders found in storage. Please upload Excel files organized by sector folders.');
    }

    // Calculate total files for progress tracking
    const totalFiles = sectorEntries.reduce((total, [_, files]) => total + files.length, 0);
    
    onProgress({
      stage: 'folders-found',
      message: `Found ${totalSectors} sectors with ${totalFiles} Excel files to process`,
      progress: 10,
      completed: false,
      error: null
    });

    const allProcessedData: ProcessedServiceData[] = [];
    let processedFiles = 0;
    let totalCategories = 0;
    let totalServices = 0;

    // Process each sector and its files
    for (let sectorIndex = 0; sectorIndex < sectorEntries.length; sectorIndex++) {
      const [sectorName, files] = sectorEntries[sectorIndex];
      
      onProgress({
        stage: 'processing-sector',
        message: `Processing sector: ${sectorName} (${files.length} files)`,
        progress: 15 + (sectorIndex / totalSectors) * 40,
        completed: false,
        error: null
      });

      console.log(`Processing sector: ${sectorName} with ${files.length} files`);

      // Process all files in this sector
      const sectorData = await processSectorFiles(sectorName, files, (fileProgress) => {
        processedFiles++;
        onProgress({
          stage: 'processing-file',
          message: `Processing file ${processedFiles}/${totalFiles}: ${fileProgress.fileName}`,
          progress: 15 + (processedFiles / totalFiles) * 40,
          completed: false,
          error: null
        });
      });

      if (sectorData && sectorData.categories.length > 0) {
        allProcessedData.push(sectorData);
        totalCategories += sectorData.categories.length;
        totalServices += sectorData.categories.reduce((sum, cat) => 
          sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0
        );
      }
    }

    // Save to database
    onProgress({
      stage: 'saving-to-database',
      message: 'Saving processed data to database...',
      progress: 60,
      completed: false,
      error: null
    });

    console.log(`Saving ${allProcessedData.length} sectors to database...`);
    await saveSectorsToDatabase(allProcessedData, onProgress);

    const stats: ImportStats = {
      totalSectors: allProcessedData.length,
      totalCategories,
      totalServices,
      filesProcessed: processedFiles
    };

    onProgress({
      stage: 'complete',
      message: `Import completed successfully! Processed ${stats.totalSectors} sectors, ${stats.totalCategories} categories, and ${stats.totalServices} services from ${stats.filesProcessed} files.`,
      progress: 100,
      completed: true,
      error: null
    });

    console.log('Import completed successfully:', stats);

    return {
      success: true,
      message: 'Service import completed successfully!',
      stats
    };

  } catch (error) {
    console.error('Import failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during import';
    
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

/**
 * Process all Excel files for a specific sector
 */
async function processSectorFiles(
  sectorName: string,
  files: any[],
  onFileProgress: (progress: { fileName: string }) => void
): Promise<ProcessedServiceData | null> {
  console.log(`Processing sector: ${sectorName} with ${files.length} files`);

  const allCategories: ServiceMainCategory[] = [];

  // Process each Excel file in this sector
  for (const file of files) {
    try {
      onFileProgress({ fileName: file.name });
      console.log(`Processing file: ${file.name}`);

      // Download and process the Excel file
      const fileData = await storageService.downloadFile('service-imports', file.path);
      const processedData = await processExcelFile(fileData, file.name);
      
      if (processedData && processedData.categories) {
        allCategories.push(...processedData.categories);
        console.log(`Processed ${processedData.categories.length} categories from ${file.name}`);
      }
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      // Continue processing other files even if one fails
    }
  }

  if (allCategories.length === 0) {
    console.warn(`No valid data found for sector: ${sectorName}`);
    return null;
  }

  return {
    sectorName,
    categories: allCategories
  };
}

/**
 * Process a single Excel file and extract service data
 */
async function processExcelFile(fileData: ArrayBuffer, fileName: string): Promise<ProcessedServiceData | null> {
  try {
    console.log(`Processing Excel file: ${fileName}`);
    
    const workbook = XLSX.read(fileData, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    if (!worksheet) {
      console.warn(`No worksheet found in ${fileName}`);
      return null;
    }

    // Convert to array of arrays, ensuring we get array data
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
    
    if (!Array.isArray(rawData) || rawData.length === 0) {
      console.warn(`No valid data found in ${fileName}`);
      return null;
    }

    console.log(`Raw data rows: ${rawData.length}`);

    const categories = parseExcelData(rawData, fileName);
    
    return {
      sectorName: fileName.replace('.xlsx', '').replace('.xls', ''),
      categories
    };
  } catch (error) {
    console.error(`Error processing Excel file ${fileName}:`, error);
    return null;
  }
}

/**
 * Parse Excel data into structured service categories
 */
function parseExcelData(data: any[][], fileName: string): ServiceMainCategory[] {
  console.log(`Parsing data from ${fileName}, rows: ${data.length}`);
  
  const categories: ServiceMainCategory[] = [];
  let currentCategory: ServiceMainCategory | null = null;
  let currentSubcategory: ServiceSubcategory | null = null;

  for (let i = 1; i < data.length; i++) { // Skip header row
    const row = data[i];
    if (!row || row.length === 0) continue;

    const [categoryName, subcategoryName, jobName, description, estimatedTime, price] = row;

    // Skip empty rows
    if (!categoryName && !subcategoryName && !jobName) continue;

    // New category
    if (categoryName && categoryName !== currentCategory?.name) {
      currentCategory = {
        id: generateId(),
        name: String(categoryName).trim(),
        description: `Services in ${categoryName}`,
        subcategories: []
      };
      categories.push(currentCategory);
      currentSubcategory = null;
    }

    // New subcategory
    if (subcategoryName && currentCategory && subcategoryName !== currentSubcategory?.name) {
      currentSubcategory = {
        id: generateId(),
        name: String(subcategoryName).trim(),
        description: `Services for ${subcategoryName}`,
        jobs: []
      };
      currentCategory.subcategories.push(currentSubcategory);
    }

    // New job/service
    if (jobName && currentSubcategory) {
      const job: ServiceJob = {
        id: generateId(),
        name: String(jobName).trim(),
        description: description ? String(description).trim() : '',
        estimatedTime: estimatedTime ? Number(estimatedTime) : undefined,
        price: price ? Number(price) : undefined
      };
      currentSubcategory.jobs.push(job);
    }
  }

  console.log(`Parsed ${categories.length} categories from ${fileName}`);
  return categories;
}

/**
 * Save all processed sector data to database
 */
async function saveSectorsToDatabase(
  sectorsData: ProcessedServiceData[],
  onProgress: (progress: ImportProgress) => void
): Promise<void> {
  console.log(`Saving ${sectorsData.length} sectors to database...`);

  for (let i = 0; i < sectorsData.length; i++) {
    const sectorData = sectorsData[i];
    
    onProgress({
      stage: 'inserting-sector',
      message: `Saving sector: ${sectorData.sectorName} (${i + 1}/${sectorsData.length})`,
      progress: 60 + (i / sectorsData.length) * 35,
      completed: false,
      error: null
    });

    await saveSectorToDatabase(sectorData);
  }

  onProgress({
    stage: 'database-complete',
    message: 'All data saved to database successfully',
    progress: 95,
    completed: false,
    error: null
  });
}

/**
 * Save a single sector to database
 */
async function saveSectorToDatabase(sectorData: ProcessedServiceData): Promise<void> {
  console.log(`Saving sector: ${sectorData.sectorName}`);

  // Insert sector
  const { data: sector, error: sectorError } = await supabase
    .from('service_sectors')
    .upsert({
      name: sectorData.sectorName,
      description: `Services for ${sectorData.sectorName}`,
      is_active: true,
      position: 1
    }, {
      onConflict: 'name'
    })
    .select()
    .single();

  if (sectorError) {
    console.error('Error inserting sector:', sectorError);
    throw new Error(`Failed to insert sector ${sectorData.sectorName}: ${sectorError.message}`);
  }

  // Insert categories and their subcategories/jobs
  for (const category of sectorData.categories) {
    await saveCategoryToDatabase(sector.id, category);
  }

  console.log(`Successfully saved sector: ${sectorData.sectorName}`);
}

/**
 * Save a category and its subcategories to database
 */
async function saveCategoryToDatabase(sectorId: string, category: ServiceMainCategory): Promise<void> {
  // Insert category
  const { data: categoryData, error: categoryError } = await supabase
    .from('service_categories')
    .upsert({
      sector_id: sectorId,
      name: category.name,
      description: category.description,
      position: 1,
      is_active: true
    }, {
      onConflict: 'sector_id,name'
    })
    .select()
    .single();

  if (categoryError) {
    console.error('Error inserting category:', categoryError);
    throw new Error(`Failed to insert category ${category.name}: ${categoryError.message}`);
  }

  // Insert subcategories
  for (const subcategory of category.subcategories) {
    await saveSubcategoryToDatabase(categoryData.id, subcategory);
  }
}

/**
 * Save a subcategory and its jobs to database
 */
async function saveSubcategoryToDatabase(categoryId: string, subcategory: ServiceSubcategory): Promise<void> {
  // Insert subcategory
  const { data: subcategoryData, error: subcategoryError } = await supabase
    .from('service_subcategories')
    .upsert({
      category_id: categoryId,
      name: subcategory.name,
      description: subcategory.description,
      position: 1,
      is_active: true
    }, {
      onConflict: 'category_id,name'
    })
    .select()
    .single();

  if (subcategoryError) {
    console.error('Error inserting subcategory:', subcategoryError);
    throw new Error(`Failed to insert subcategory ${subcategory.name}: ${subcategoryError.message}`);
  }

  // Insert jobs
  if (subcategory.jobs.length > 0) {
    const jobsToInsert = subcategory.jobs.map(job => ({
      subcategory_id: subcategoryData.id,
      name: job.name,
      description: job.description,
      estimated_time: job.estimatedTime,
      price: job.price,
      position: 1,
      is_active: true
    }));

    const { error: jobsError } = await supabase
      .from('service_jobs')
      .upsert(jobsToInsert, {
        onConflict: 'subcategory_id,name'
      });

    if (jobsError) {
      console.error('Error inserting jobs:', jobsError);
      throw new Error(`Failed to insert jobs for ${subcategory.name}: ${jobsError.message}`);
    }
  }
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
