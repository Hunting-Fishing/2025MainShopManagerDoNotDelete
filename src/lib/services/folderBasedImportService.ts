import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { v4 as uuidv4 } from 'uuid';

export interface ImportStats {
  sectorsCount: number;
  categoriesCount: number;
  subcategoriesCount: number;
  jobsCount: number;
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats?: ImportStats;
  errors?: string[];
}

export interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
}

export interface ProcessedServiceData {
  sectors: any[];
}

const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const extractAndNameSectors = (workbook: XLSX.WorkBook): string[] => {
  return workbook.SheetNames.filter(name => name.toLowerCase().includes('sector'));
};

const processExcelFileFromStorage = async (
  fileName: string,
  bucketName: string = 'service-data'
): Promise<XLSX.WorkBook> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileName);

    if (error) {
      console.error('Error downloading file:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data received from storage.');
    }

    const fileArrayBuffer = await data.arrayBuffer();
    const workbook = XLSX.read(fileArrayBuffer, { type: 'array' });
    return workbook;

  } catch (error: any) {
    console.error('Error processing Excel file from storage:', error);
    throw new Error(error.message || 'Failed to process Excel file from storage.');
  }
};

const importServicesFromStorage = async (
  progressCallback?: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  let workbook: XLSX.WorkBook;
  let sectorSheetNames: string[];
  let processedData: ProcessedServiceData | null = null;

  try {
    // Initial progress update
    progressCallback?.({
      stage: 'initial',
      message: 'Starting service import...',
      progress: 5,
      completed: false,
      error: null,
    });

    // 1. Fetch file list from storage bucket
    const { data: files, error: listError } = await supabase.storage
      .from('service-data')
      .list();

    if (listError) {
      console.error('Error listing files:', listError);
      throw new Error(`Failed to list files in storage: ${listError.message}`);
    }

    const excelFiles = files?.filter(file => file.name.endsWith('.xlsx') || file.name.endsWith('.xls'));

    if (!excelFiles || excelFiles.length === 0) {
      throw new Error('No Excel files found in the storage bucket.');
    }

    // Assuming only one Excel file for now, you might want to iterate and merge later
    const excelFile = excelFiles[0];

    progressCallback?.({
      stage: 'downloading',
      message: `Downloading ${excelFile.name}...`,
      progress: 10,
      completed: false,
      error: null,
    });

    // 2. Process the Excel file from storage
    workbook = await processExcelFileFromStorage(excelFile.name);
    sectorSheetNames = extractAndNameSectors(workbook);

    if (!sectorSheetNames || sectorSheetNames.length === 0) {
      throw new Error('No "sector" sheets found in the Excel file.');
    }

    progressCallback?.({
      stage: 'processing',
      message: 'Processing Excel data...',
      progress: 20,
      completed: false,
      error: null,
    });

    processedData = processServiceDataFromSheets(workbook, sectorSheetNames);

    if (!processedData || !processedData.sectors || processedData.sectors.length === 0) {
      throw new Error('No service data extracted from the Excel file.');
    }

    progressCallback?.({
      stage: 'importing',
      message: 'Importing data to database...',
      progress: 50,
      completed: false,
      error: null,
    });

    // 3. Import the processed data into the database
    const importResult = await importProcessedDataToDatabase(processedData.sectors, progressCallback);

    progressCallback?.({
      stage: 'finalizing',
      message: 'Finalizing import...',
      progress: 90,
      completed: false,
      error: null,
    });

    return {
      success: true,
      message: `Successfully imported ${importResult.stats?.jobsCount} services across ${importResult.stats?.sectorsCount} sectors`,
      stats: importResult.stats,
    };

  } catch (error: any) {
    console.error('Service import failed:', error);
    return {
      success: false,
      message: error.message || 'Service import failed',
      errors: [error.message || 'An unexpected error occurred'],
    };
  }
};

const processServiceDataFromSheets = (workbook: XLSX.WorkBook, sectorSheetNames: string[]): ProcessedServiceData => {
  const sectors: ServiceSector[] = [];

  sectorSheetNames.forEach(sectorSheetName => {
    const sectorSheet = workbook.Sheets[sectorSheetName];
    if (!sectorSheet) {
      console.warn(`Sector sheet "${sectorSheetName}" not found, skipping`);
      return;
    }

    const sectorData: any[] = XLSX.utils.sheet_to_json(sectorSheet, { header: 1 });
    if (!sectorData || sectorData.length === 0) {
      console.warn(`No data found in sector sheet "${sectorSheetName}", skipping`);
      return;
    }

    const sectorName = sectorSheetName.replace(/sector/i, '').trim();
    if (!sectorName) {
      console.warn(`Invalid sector name "${sectorSheetName}", skipping`);
      return;
    }

    const sector: ServiceSector = {
      id: uuidv4(),
      name: sectorName,
      categories: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let currentCategory: ServiceMainCategory | null = null;
    let currentSubcategory: ServiceSubcategory | null = null;

    sectorData.forEach((row: any[], rowIndex: number) => {
      if (rowIndex === 0) return; // Skip header row

      const categoryName = row[0]?.trim();
      const subcategoryName = row[1]?.trim();
      const jobName = row[2]?.trim();
      const jobDescription = row[3]?.trim();

      if (categoryName) {
        currentCategory = {
          id: uuidv4(),
          name: categoryName,
          sector_id: sector.id,
          subcategories: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        sector.categories.push(currentCategory);
        currentSubcategory = null; // Reset subcategory when a new category is encountered
      }

      if (subcategoryName && currentCategory) {
        currentSubcategory = {
          id: uuidv4(),
          name: subcategoryName,
          category_id: currentCategory.id,
          jobs: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        currentCategory.subcategories.push(currentSubcategory);
      }

      if (jobName && currentSubcategory) {
        const job: ServiceJob = {
          id: uuidv4(),
          name: jobName,
          subcategory_id: currentSubcategory.id,
          description: jobDescription || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        currentSubcategory.jobs.push(job);
      }
    });

    sectors.push(sector);
  });

  return { sectors };
};

const importProcessedDataToDatabase = async (
  sectors: ServiceSector[],
  progressCallback?: (progress: ImportProgress) => void
): Promise<{ stats: ImportStats }> => {
  let totalSectors = 0;
  let totalCategories = 0;
  let totalSubcategories = 0;
  let totalJobs = 0;

  try {
    // 1. Clear existing data
    await clearAllServiceData();

    // 2. Insert sectors
    for (const sector of sectors) {
      const { error: sectorError } = await supabase
        .from('service_sectors')
        .insert([
          {
            id: sector.id,
            name: sector.name,
            created_at: sector.created_at,
            updated_at: sector.updated_at
          }
        ]);

      if (sectorError) {
        throw new Error(`Failed to insert sector ${sector.name}: ${sectorError.message}`);
      }
      totalSectors++;

      // 3. Insert categories
      for (const category of sector.categories) {
        const { error: categoryError } = await supabase
          .from('service_categories')
          .insert([
            {
              id: category.id,
              name: category.name,
              sector_id: sector.id,
              created_at: category.created_at,
              updated_at: category.updated_at
            }
          ]);

        if (categoryError) {
          throw new Error(`Failed to insert category ${category.name}: ${categoryError.message}`);
        }
        totalCategories++;

        // 4. Insert subcategories
        for (const subcategory of category.subcategories) {
          const { error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert([
              {
                id: subcategory.id,
                name: subcategory.name,
                category_id: category.id,
                created_at: subcategory.created_at,
                updated_at: subcategory.updated_at
              }
            ]);

          if (subcategoryError) {
            throw new Error(`Failed to insert subcategory ${subcategory.name}: ${subcategoryError.message}`);
          }
          totalSubcategories++;

          // 5. Insert jobs
          for (const job of subcategory.jobs) {
            const { error: jobError } = await supabase
              .from('service_jobs')
              .insert([
                {
                  id: job.id,
                  name: job.name,
                  subcategory_id: subcategory.id,
                  description: job.description,
                  created_at: job.created_at,
                  updated_at: job.updated_at
                }
              ]);

            if (jobError) {
              throw new Error(`Failed to insert job ${job.name}: ${jobError.message}`);
            }
            totalJobs++;
          }
        }
      }
    }

    return {
      stats: {
        sectorsCount: totalSectors,
        categoriesCount: totalCategories,
        subcategoriesCount: totalSubcategories,
        jobsCount: totalJobs
      }
    };
  } catch (error: any) {
    console.error('Error importing data to database:', error);
    throw error;
  }
};

const clearAllServiceData = async () => {
  try {
    // Delete all records from service_jobs
    const { error: jobsError } = await supabase
      .from('service_jobs')
      .delete()
      .neq('id', null); // To delete all rows

    if (jobsError) {
      throw new Error(`Failed to clear service jobs: ${jobsError.message}`);
    }

    // Delete all records from service_subcategories
    const { error: subcategoriesError } = await supabase
      .from('service_subcategories')
      .delete()
      .neq('id', null);

    if (subcategoriesError) {
      throw new Error(`Failed to clear service subcategories: ${subcategoriesError.message}`);
    }

    // Delete all records from service_categories
    const { error: categoriesError } = await supabase
      .from('service_categories')
      .delete()
      .neq('id', null);

    if (categoriesError) {
      throw new Error(`Failed to clear service categories: ${categoriesError.message}`);
    }

    // Delete all records from service_sectors
    const { error: sectorsError } = await supabase
      .from('service_sectors')
      .delete()
      .neq('id', null);

    if (sectorsError) {
      throw new Error(`Failed to clear service sectors: ${sectorsError.message}`);
    }

    console.log('All service data cleared successfully.');
  } catch (error: any) {
    console.error('Error clearing service data:', error);
    throw error;
  }
};

const getServiceCounts = async (): Promise<{ sectors: number; categories: number; subcategories: number; jobs: number }> => {
  try {
    const { count: sectorsCount, error: sectorsError } = await supabase
      .from('service_sectors')
      .select('*', { count: 'exact', head: true });

    if (sectorsError) {
      throw new Error(`Failed to count service sectors: ${sectorsError.message}`);
    }

    const { count: categoriesCount, error: categoriesError } = await supabase
      .from('service_categories')
      .select('*', { count: 'exact', head: true });

    if (categoriesError) {
      throw new Error(`Failed to count service categories: ${categoriesError.message}`);
    }

    const { count: subcategoriesCount, error: subcategoriesError } = await supabase
      .from('service_subcategories')
      .select('*', { count: 'exact', head: true });

    if (subcategoriesError) {
      throw new Error(`Failed to count service subcategories: ${subcategoriesError.message}`);
    }

    const { count: jobsCount, error: jobsError } = await supabase
      .from('service_jobs')
      .select('*', { count: 'exact', head: true });

    if (jobsError) {
      throw new Error(`Failed to count service jobs: ${jobsError.message}`);
    }

    return {
      sectors: sectorsCount || 0,
      categories: categoriesCount || 0,
      subcategories: subcategoriesCount || 0,
      jobs: jobsCount || 0,
    };
  } catch (error: any) {
    console.error('Error getting service counts:', error);
    throw error;
  }
};

export {
  processExcelFileFromStorage,
  processServiceDataFromSheets,
  importProcessedDataToDatabase,
  clearAllServiceData,
  getServiceCounts,
  importServicesFromStorage
};
