
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { storageService } from './unifiedStorageService';

export interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
  currentFile?: string;
  filesProcessed?: number;
  totalFiles?: number;
  sectorsProcessed?: number;
  totalSectors?: number;
  servicesImported?: number;
}

export interface ImportStats {
  totalSectors: number;
  totalCategories: number;
  totalSubcategories: number;
  totalServices: number;
  filesProcessed: number;
  sectorsProcessed: number;
  errors: string[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats?: ImportStats;
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

const BUCKET_NAME = 'service-imports';

export async function importServicesFromStorage(
  progressCallback?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  const stats: ImportStats = {
    totalSectors: 0,
    totalCategories: 0,
    totalSubcategories: 0,
    totalServices: 0,
    filesProcessed: 0,
    sectorsProcessed: 0,
    errors: []
  };

  try {
    // Step 1: Discovery phase - no limits
    progressCallback?.({
      stage: 'starting',
      message: 'Discovering sector folders and files...',
      progress: 5,
      completed: false,
      error: null
    });

    console.log('Starting comprehensive import from storage...');
    
    const allSectorFiles = await storageService.getAllSectorFiles(BUCKET_NAME);
    
    if (!allSectorFiles || allSectorFiles.length === 0) {
      throw new Error('No sector folders found in storage bucket');
    }

    const totalFiles = allSectorFiles.reduce((sum, sector) => sum + sector.totalFiles, 0);
    console.log(`Found ${allSectorFiles.length} sectors with ${totalFiles} total files`);

    progressCallback?.({
      stage: 'folders-found',
      message: `Found ${allSectorFiles.length} sectors with ${totalFiles} Excel files`,
      progress: 10,
      completed: false,
      error: null,
      totalSectors: allSectorFiles.length,
      totalFiles: totalFiles
    });

    // Step 2: Process all files without limits
    const processedData: ProcessedServiceData = { sectors: [] };
    let currentFileIndex = 0;

    for (let sectorIndex = 0; sectorIndex < allSectorFiles.length; sectorIndex++) {
      const sectorData = allSectorFiles[sectorIndex];
      
      progressCallback?.({
        stage: 'processing-sector',
        message: `Processing sector: ${sectorData.sectorName} (${sectorData.totalFiles} files)`,
        progress: 15 + (sectorIndex / allSectorFiles.length) * 40,
        completed: false,
        error: null,
        sectorsProcessed: sectorIndex,
        totalSectors: allSectorFiles.length,
        filesProcessed: currentFileIndex,
        totalFiles: totalFiles
      });

      console.log(`Processing sector: ${sectorData.sectorName} with ${sectorData.totalFiles} files`);

      const sectorCategories: any[] = [];
      
      // Process ALL files in this sector
      for (const file of sectorData.excelFiles) {
        try {
          progressCallback?.({
            stage: 'processing-file',
            message: `Processing file: ${file.name}`,
            progress: 15 + (currentFileIndex / totalFiles) * 40,
            completed: false,
            error: null,
            currentFile: file.name,
            filesProcessed: currentFileIndex,
            totalFiles: totalFiles,
            sectorsProcessed: sectorIndex,
            totalSectors: allSectorFiles.length
          });

          console.log(`Processing file: ${file.path}`);
          
          const fileData = await processExcelFileFromStorage(BUCKET_NAME, file.path);
          
          if (fileData && fileData.categories && fileData.categories.length > 0) {
            sectorCategories.push(...fileData.categories);
            stats.totalCategories += fileData.categories.length;
            
            // Count subcategories and services
            fileData.categories.forEach(category => {
              stats.totalSubcategories += category.subcategories?.length || 0;
              category.subcategories?.forEach(subcategory => {
                stats.totalServices += subcategory.jobs?.length || 0;
              });
            });
            
            console.log(`File ${file.name}: ${fileData.categories.length} categories processed`);
          } else {
            console.warn(`No valid data found in file: ${file.name}`);
            stats.errors.push(`No valid data in file: ${file.name}`);
          }
          
          currentFileIndex++;
          stats.filesProcessed++;
          
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          stats.errors.push(`Error in file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          currentFileIndex++;
        }
      }

      if (sectorCategories.length > 0) {
        processedData.sectors.push({
          name: sectorData.sectorName,
          categories: sectorCategories
        });
        stats.totalSectors++;
      }
      
      stats.sectorsProcessed++;
    }

    console.log('Processing complete. Stats:', stats);

    // Step 3: Database import with comprehensive validation
    progressCallback?.({
      stage: 'saving-to-database',
      message: `Importing ${stats.totalServices} services to database...`,
      progress: 60,
      completed: false,
      error: null,
      servicesImported: 0
    });

    const importResult = await importProcessedDataToDatabase(processedData, (imported) => {
      progressCallback?.({
        stage: 'saving-to-database',
        message: `Imported ${imported} services to database...`,
        progress: 60 + (imported / stats.totalServices) * 35,
        completed: false,
        error: null,
        servicesImported: imported
      });
    });

    if (!importResult.success) {
      throw new Error(importResult.message || 'Database import failed');
    }

    // Step 4: Final validation
    progressCallback?.({
      stage: 'database-complete',
      message: 'Validating imported data...',
      progress: 95,
      completed: false,
      error: null
    });

    const finalCounts = await getServiceCounts();
    console.log('Final database counts:', finalCounts);

    // Success
    progressCallback?.({
      stage: 'complete',
      message: `Successfully imported ${stats.totalServices} services across ${stats.totalSectors} sectors`,
      progress: 100,
      completed: true,
      error: null
    });

    const successMessage = `Import completed successfully! 
Imported: ${finalCounts.sectors} sectors, ${finalCounts.categories} categories, ${finalCounts.subcategories} subcategories, ${finalCounts.services} services.
Files processed: ${stats.filesProcessed}/${totalFiles}`;

    if (stats.errors.length > 0) {
      console.warn('Import completed with warnings:', stats.errors);
    }

    return {
      success: true,
      message: successMessage,
      stats
    };

  } catch (error) {
    console.error('Import failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Import failed with unknown error';
    
    stats.errors.push(errorMessage);
    
    return {
      success: false,
      message: errorMessage,
      stats
    };
  }
}

export async function processExcelFileFromStorage(
  bucketName: string, 
  filePath: string
): Promise<ProcessedServiceData | null> {
  try {
    console.log(`Processing Excel file: ${filePath}`);
    
    const fileBlob = await storageService.downloadFile(bucketName, filePath);
    if (!fileBlob) {
      throw new Error(`Failed to download file: ${filePath}`);
    }

    const arrayBuffer = await fileBlob.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('No sheets found in Excel file');
    }

    const categories: any[] = [];
    
    // Process ALL sheets in the workbook
    for (const sheetName of workbook.SheetNames) {
      console.log(`Processing sheet: ${sheetName}`);
      
      try {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (!jsonData || jsonData.length === 0) {
          console.warn(`Sheet ${sheetName} is empty, skipping`);
          continue;
        }

        const categoryData = processSheetData(jsonData, sheetName);
        if (categoryData) {
          categories.push(categoryData);
          console.log(`Sheet ${sheetName}: processed successfully`);
        }
      } catch (sheetError) {
        console.error(`Error processing sheet ${sheetName}:`, sheetError);
        // Continue with other sheets instead of failing completely
      }
    }

    if (categories.length === 0) {
      console.warn(`No valid categories found in file: ${filePath}`);
      return null;
    }

    console.log(`File ${filePath}: processed ${categories.length} categories`);
    return { sectors: [{ name: 'Unknown', categories }] };
    
  } catch (error) {
    console.error(`Error processing Excel file ${filePath}:`, error);
    throw error;
  }
}

function processSheetData(data: any[][], sheetName: string) {
  try {
    if (!data || data.length < 2) {
      console.warn(`Sheet ${sheetName} has insufficient data`);
      return null;
    }

    // Skip empty rows and find the header
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(5, data.length); i++) {
      const row = data[i];
      if (row && Array.isArray(row) && row.length > 0) {
        // Look for common service data indicators
        const rowStr = row.join('').toLowerCase();
        if (rowStr.includes('service') || rowStr.includes('job') || rowStr.includes('description')) {
          headerRowIndex = i;
          break;
        }
      }
    }

    if (headerRowIndex === -1) {
      headerRowIndex = 0; // Fallback to first row
    }

    const subcategories: any[] = [];
    const jobs: any[] = [];

    // Process all data rows without limits
    for (let i = headerRowIndex + 1; i < data.length; i++) {
      const row = data[i];
      if (!row || !Array.isArray(row) || row.length === 0) continue;

      // Extract service information from row
      const serviceName = row[0]?.toString()?.trim();
      if (!serviceName) continue;

      const job = {
        name: serviceName,
        description: row[1]?.toString()?.trim() || '',
        estimatedTime: parseFloat(row[2]?.toString()) || undefined,
        price: parseFloat(row[3]?.toString()) || undefined
      };

      jobs.push(job);
    }

    if (jobs.length === 0) {
      console.warn(`No jobs found in sheet: ${sheetName}`);
      return null;
    }

    // Create subcategory for this sheet
    subcategories.push({
      name: sheetName,
      jobs: jobs
    });

    console.log(`Sheet ${sheetName}: found ${jobs.length} jobs`);

    return {
      name: sheetName,
      subcategories: subcategories
    };

  } catch (error) {
    console.error(`Error processing sheet data for ${sheetName}:`, error);
    return null;
  }
}

export async function importProcessedDataToDatabase(
  data: ProcessedServiceData,
  progressCallback?: (imported: number) => void
): Promise<ImportResult> {
  try {
    console.log('Starting database import...');
    
    // Clear existing data first
    await clearAllServiceData();
    
    let totalImported = 0;
    
    // Import all sectors without limits
    for (const sector of data.sectors) {
      console.log(`Importing sector: ${sector.name}`);
      
      const { data: sectorResult, error: sectorError } = await supabase
        .from('service_sectors')
        .insert([{ name: sector.name, description: `Imported sector: ${sector.name}` }])
        .select('id')
        .single();

      if (sectorError) {
        console.error('Error inserting sector:', sectorError);
        throw new Error(`Failed to insert sector ${sector.name}: ${sectorError.message}`);
      }

      const sectorId = sectorResult.id;
      
      // Import all categories for this sector
      for (const category of sector.categories) {
        console.log(`Importing category: ${category.name} for sector: ${sector.name}`);
        
        const { data: categoryResult, error: categoryError } = await supabase
          .from('service_categories')
          .insert([{ 
            name: category.name, 
            description: `Imported category: ${category.name}`,
            sector_id: sectorId 
          }])
          .select('id')
          .single();

        if (categoryError) {
          console.error('Error inserting category:', categoryError);
          throw new Error(`Failed to insert category ${category.name}: ${categoryError.message}`);
        }

        const categoryId = categoryResult.id;
        
        // Import all subcategories and jobs
        for (const subcategory of category.subcategories) {
          console.log(`Importing subcategory: ${subcategory.name}`);
          
          const { data: subcategoryResult, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert([{ 
              name: subcategory.name, 
              description: `Imported subcategory: ${subcategory.name}`,
              category_id: categoryId 
            }])
            .select('id')
            .single();

          if (subcategoryError) {
            console.error('Error inserting subcategory:', subcategoryError);
            throw new Error(`Failed to insert subcategory ${subcategory.name}: ${subcategoryError.message}`);
          }

          const subcategoryId = subcategoryResult.id;
          
          // Import ALL jobs for this subcategory
          if (subcategory.jobs && subcategory.jobs.length > 0) {
            const jobsToInsert = subcategory.jobs.map(job => ({
              name: job.name,
              description: job.description || '',
              estimated_time: job.estimatedTime || null,
              price: job.price || null,
              subcategory_id: subcategoryId
            }));

            const { error: jobsError } = await supabase
              .from('service_jobs')
              .insert(jobsToInsert);

            if (jobsError) {
              console.error('Error inserting jobs:', jobsError);
              throw new Error(`Failed to insert jobs for ${subcategory.name}: ${jobsError.message}`);
            }

            totalImported += jobsToInsert.length;
            progressCallback?.(totalImported);
            console.log(`Imported ${jobsToInsert.length} jobs for subcategory: ${subcategory.name}`);
          }
        }
      }
    }

    console.log(`Database import completed. Total services imported: ${totalImported}`);
    
    return {
      success: true,
      message: `Successfully imported ${totalImported} services to database`
    };

  } catch (error) {
    console.error('Database import failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Database import failed'
    };
  }
}

export async function clearAllServiceData(): Promise<void> {
  try {
    console.log('Clearing all existing service data...');
    
    // Delete in correct order due to foreign key constraints
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

export async function getServiceCounts() {
  try {
    const [sectorsResult, categoriesResult, subcategoriesResult, servicesResult] = await Promise.all([
      supabase.from('service_sectors').select('*', { count: 'exact', head: true }),
      supabase.from('service_categories').select('*', { count: 'exact', head: true }),
      supabase.from('service_subcategories').select('*', { count: 'exact', head: true }),
      supabase.from('service_jobs').select('*', { count: 'exact', head: true })
    ]);

    return {
      sectors: sectorsResult.count || 0,
      categories: categoriesResult.count || 0,
      subcategories: subcategoriesResult.count || 0,
      services: servicesResult.count || 0
    };
  } catch (error) {
    console.error('Error getting service counts:', error);
    return { sectors: 0, categories: 0, subcategories: 0, services: 0 };
  }
}

export function validateServiceData(data: ProcessedServiceData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || !data.sectors || data.sectors.length === 0) {
    errors.push('No sectors found in data');
    return { isValid: false, errors };
  }

  data.sectors.forEach((sector, sectorIndex) => {
    if (!sector.name || sector.name.trim() === '') {
      errors.push(`Sector ${sectorIndex} is missing a name`);
    }
    
    if (!sector.categories || sector.categories.length === 0) {
      errors.push(`Sector "${sector.name}" has no categories`);
    } else {
      sector.categories.forEach((category, categoryIndex) => {
        if (!category.name || category.name.trim() === '') {
          errors.push(`Category ${categoryIndex} in sector "${sector.name}" is missing a name`);
        }
        
        if (!category.subcategories || category.subcategories.length === 0) {
          errors.push(`Category "${category.name}" in sector "${sector.name}" has no subcategories`);
        } else {
          category.subcategories.forEach((subcategory, subcategoryIndex) => {
            if (!subcategory.name || subcategory.name.trim() === '') {
              errors.push(`Subcategory ${subcategoryIndex} in category "${category.name}" is missing a name`);
            }
            
            if (!subcategory.jobs || subcategory.jobs.length === 0) {
              errors.push(`Subcategory "${subcategory.name}" in category "${category.name}" has no jobs`);
            }
          });
        }
      });
    }
  });

  return { isValid: errors.length === 0, errors };
}
