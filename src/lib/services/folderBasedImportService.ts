
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { 
  ServiceSector, 
  ServiceMainCategory, 
  ServiceSubcategory, 
  ServiceJob 
} from '@/types/serviceHierarchy';

export interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
}

export interface ProcessedServiceData {
  sectors: ServiceSector[];
  categories: ServiceMainCategory[];
  subcategories: ServiceSubcategory[];
  jobs: ServiceJob[];
}

export interface ImportStats {
  totalSectors: number;
  totalCategories: number;
  totalSubcategories: number;
  totalJobs: number;
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats?: ImportStats;
  errors?: string[];
}

// Function to clear all service data from the database
export const clearAllServiceData = async () => {
  try {
    const { error } = await supabase.rpc('clear_service_data');
    if (error) {
      throw new Error(`Failed to clear service data: ${error.message}`);
    }
    return true;
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
};

// Get the current counts of service data in the database
export const getServiceCounts = async (): Promise<ImportStats> => {
  try {
    // Get count of sectors
    const { data: sectors, error: sectorsError } = await supabase
      .from('service_sectors')
      .select('id');
    
    if (sectorsError) throw new Error(`Failed to get sectors: ${sectorsError.message}`);

    // Get count of categories
    const { data: categories, error: categoriesError } = await supabase
      .from('service_categories')
      .select('id');
    
    if (categoriesError) throw new Error(`Failed to get categories: ${categoriesError.message}`);

    // Get count of subcategories
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('service_subcategories')
      .select('id');
    
    if (subcategoriesError) throw new Error(`Failed to get subcategories: ${subcategoriesError.message}`);

    // Get count of jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('service_jobs')
      .select('id');
    
    if (jobsError) throw new Error(`Failed to get jobs: ${jobsError.message}`);

    return {
      totalSectors: sectors ? sectors.length : 0,
      totalCategories: categories ? categories.length : 0,
      totalSubcategories: subcategories ? subcategories.length : 0,
      totalJobs: jobs ? jobs.length : 0
    };
  } catch (error) {
    console.error('Error getting service counts:', error);
    throw error;
  }
};

// Process an Excel file from storage
export const processExcelFileFromStorage = async (filePath: string): Promise<ProcessedServiceData> => {
  try {
    // Download the file from storage
    const { data, error } = await supabase.storage
      .from('service-data')
      .download(filePath);
    
    if (error) {
      throw new Error(`Failed to download file from storage: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data received from storage');
    }

    // Parse the Excel file
    const buffer = await data.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    
    // Process the worksheets to extract service data
    return processServiceDataFromSheets(workbook.Sheets);
  } catch (error) {
    console.error(`Error processing Excel file ${filePath}:`, error);
    throw error;
  }
};

// Process service data from Excel worksheets
export const processServiceDataFromSheets = (sheets: XLSX.WorkSheet | { [sheet: string]: XLSX.WorkSheet }): ProcessedServiceData => {
  const sectors: ServiceSector[] = [];
  const categories: ServiceMainCategory[] = [];
  const subcategories: ServiceSubcategory[] = [];
  const jobs: ServiceJob[] = [];
  
  // Helper function to detect column names in the sheet
  const detectColumns = (sheet: XLSX.WorkSheet) => {
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
    const headerRow = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];
    
    const cols: Record<string, number> = {};
    headerRow.forEach((header, index) => {
      if (typeof header === 'string') {
        const normalizedHeader = header.toLowerCase().trim();
        switch (normalizedHeader) {
          case 'sector':
          case 'sectors':
            cols.sector = index;
            break;
          case 'category':
          case 'categories':
          case 'main category':
            cols.category = index;
            break;
          case 'subcategory':
          case 'subcategories':
          case 'sub-category':
            cols.subcategory = index;
            break;
          case 'job':
          case 'jobs':
          case 'service':
          case 'services':
            cols.job = index;
            break;
          case 'description':
          case 'desc':
            cols.description = index;
            break;
          case 'price':
          case 'cost':
          case 'fee':
            cols.price = index;
            break;
          case 'time':
          case 'hours':
          case 'duration':
          case 'estimated time':
            cols.time = index;
            break;
        }
      }
    });
    
    return cols;
  };

  // Process each sheet in the workbook
  const processSheet = (sheet: XLSX.WorkSheet, sheetName: string) => {
    const data = XLSX.utils.sheet_to_json(sheet);
    const columns = detectColumns(sheet);
    
    // Validate that we have the minimum required columns
    if (!columns.sector && !columns.category && !columns.subcategory && !columns.job) {
      console.warn(`Sheet ${sheetName} does not contain recognizable service hierarchy columns`);
      return;
    }
    
    // Process each row to build the service hierarchy
    data.forEach((row: any, index: number) => {
      // Skip header row
      if (index === 0) return;
      
      // Extract values with fallbacks
      const sectorName = columns.sector !== undefined ? row[Object.keys(row)[columns.sector]] : '';
      const categoryName = columns.category !== undefined ? row[Object.keys(row)[columns.category]] : '';
      const subcategoryName = columns.subcategory !== undefined ? row[Object.keys(row)[columns.subcategory]] : '';
      const jobName = columns.job !== undefined ? row[Object.keys(row)[columns.job]] : '';
      const description = columns.description !== undefined ? row[Object.keys(row)[columns.description]] : '';
      const price = columns.price !== undefined ? parseFloat(row[Object.keys(row)[columns.price]]) : null;
      const estimatedTime = columns.time !== undefined ? parseFloat(row[Object.keys(row)[columns.time]]) : null;
      
      // Process sector
      if (sectorName && typeof sectorName === 'string') {
        let sector = sectors.find(s => s.name === sectorName);
        if (!sector) {
          const newSector: ServiceSector = {
            id: `temp_sector_${sectors.length}`,
            name: sectorName,
            description: '',
            categories: [],
            position: sectors.length,
            is_active: true
          };
          sectors.push(newSector);
          sector = newSector;
        }
        
        // Process category
        if (categoryName && typeof categoryName === 'string') {
          let category = categories.find(c => c.name === categoryName && c.sector_id === sector.id);
          if (!category) {
            const newCategory: ServiceMainCategory = {
              id: `temp_category_${categories.length}`,
              name: categoryName,
              description: '',
              subcategories: [],
              position: categories.filter(c => c.sector_id === sector.id).length,
              sector_id: sector.id
            };
            categories.push(newCategory);
            category = newCategory;
          }
          
          // Process subcategory
          if (subcategoryName && typeof subcategoryName === 'string') {
            let subcategory = subcategories.find(
              sc => sc.name === subcategoryName && sc.category_id === category.id
            );
            if (!subcategory) {
              const newSubcategory: ServiceSubcategory = {
                id: `temp_subcategory_${subcategories.length}`,
                name: subcategoryName,
                description: '',
                jobs: [],
                category_id: category.id
              };
              subcategories.push(newSubcategory);
              subcategory = newSubcategory;
            }
            
            // Process job
            if (jobName && typeof jobName === 'string') {
              const existingJob = jobs.find(
                j => j.name === jobName && j.subcategory_id === subcategory.id
              );
              
              if (!existingJob) {
                const newJob: ServiceJob = {
                  id: `temp_job_${jobs.length}`,
                  name: jobName,
                  description: description || '',
                  estimatedTime: estimatedTime || undefined,
                  price: price || undefined,
                  subcategory_id: subcategory.id
                };
                jobs.push(newJob);
              }
            }
          }
        }
      }
    });
  };
  
  // If sheets is a workbook with multiple sheets
  if (typeof sheets !== 'object' || sheets['!ref']) {
    // Single sheet case (deprecated format)
    processSheet(sheets as XLSX.WorkSheet, 'Sheet1');
  } else {
    // Multiple sheets
    Object.entries(sheets).forEach(([name, sheet]) => {
      processSheet(sheet, name);
    });
  }
  
  // Build the relationships between the entities
  sectors.forEach(sector => {
    sector.categories = categories
      .filter(category => category.sector_id === sector.id)
      .map(category => {
        category.subcategories = subcategories
          .filter(subcategory => subcategory.category_id === category.id)
          .map(subcategory => {
            subcategory.jobs = jobs
              .filter(job => job.subcategory_id === subcategory.id);
            return subcategory;
          });
        return category;
      });
  });
  
  return {
    sectors,
    categories,
    subcategories,
    jobs
  };
};

// Import the processed service data to the database
export const importProcessedDataToDatabase = async (data: ProcessedServiceData): Promise<ImportStats> => {
  const stats: ImportStats = {
    totalSectors: 0,
    totalCategories: 0,
    totalSubcategories: 0,
    totalJobs: 0
  };

  try {
    // Step 1: Insert sectors
    for (const sector of data.sectors) {
      const { data: sectorData, error: sectorError } = await supabase
        .from('service_sectors')
        .insert({
          name: sector.name,
          description: sector.description || '',
          position: sector.position || 0,
          is_active: true
        })
        .select('id')
        .single();

      if (sectorError) throw new Error(`Failed to insert sector ${sector.name}: ${sectorError.message}`);
      stats.totalSectors++;

      // Update the temporary ID to the real one
      const realSectorId = sectorData.id;
      
      // Step 2: Insert categories for this sector
      const sectorCategories = data.categories.filter(c => c.sector_id === sector.id);
      for (const category of sectorCategories) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            name: category.name,
            description: category.description || '',
            position: category.position || 0,
            sector_id: realSectorId
          })
          .select('id')
          .single();

        if (categoryError) throw new Error(`Failed to insert category ${category.name}: ${categoryError.message}`);
        stats.totalCategories++;

        // Update the temporary ID to the real one
        const realCategoryId = categoryData.id;
        
        // Step 3: Insert subcategories for this category
        const categorySubcategories = data.subcategories.filter(sc => sc.category_id === category.id);
        for (const subcategory of categorySubcategories) {
          const { data: subcategoryData, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert({
              name: subcategory.name,
              description: subcategory.description || '',
              category_id: realCategoryId
            })
            .select('id')
            .single();

          if (subcategoryError) throw new Error(`Failed to insert subcategory ${subcategory.name}: ${subcategoryError.message}`);
          stats.totalSubcategories++;

          // Update the temporary ID to the real one
          const realSubcategoryId = subcategoryData.id;
          
          // Step 4: Insert jobs for this subcategory
          const subcategoryJobs = data.jobs.filter(j => j.subcategory_id === subcategory.id);
          for (const job of subcategoryJobs) {
            const { error: jobError } = await supabase
              .from('service_jobs')
              .insert({
                name: job.name,
                description: job.description || '',
                estimated_time: job.estimatedTime || null,
                price: job.price || null,
                subcategory_id: realSubcategoryId
              });

            if (jobError) throw new Error(`Failed to insert job ${job.name}: ${jobError.message}`);
            stats.totalJobs++;
          }
        }
      }
    }

    return stats;
  } catch (error) {
    console.error('Error importing service data to database:', error);
    throw error;
  }
};

// Main function to import services from storage
export const importServicesFromStorage = async (
  progressCallback: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  try {
    // Step 1: Get the list of files in the storage bucket
    progressCallback({
      stage: 'listing',
      message: 'Checking for service data files in storage...',
      progress: 10,
      completed: false,
      error: null
    });

    const { data: files, error: listError } = await supabase
      .storage
      .from('service-data')
      .list();

    if (listError) {
      throw new Error(`Failed to list files in storage: ${listError.message}`);
    }

    // Filter to only include Excel files
    const excelFiles = files?.filter(file => 
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    ) || [];

    if (excelFiles.length === 0) {
      return {
        success: false,
        message: 'No Excel files found in the service-data bucket',
        errors: ['No Excel files found']
      };
    }

    progressCallback({
      stage: 'processing',
      message: `Found ${excelFiles.length} Excel file(s). Processing...`,
      progress: 20,
      completed: false,
      error: null
    });

    // Step 2: Clear existing service data
    progressCallback({
      stage: 'clearing',
      message: 'Clearing existing service data...',
      progress: 30,
      completed: false,
      error: null
    });

    await clearAllServiceData();

    // Step 3: Process each Excel file
    let processedData: ProcessedServiceData = {
      sectors: [],
      categories: [],
      subcategories: [],
      jobs: []
    };

    for (let i = 0; i < excelFiles.length; i++) {
      const file = excelFiles[i];
      progressCallback({
        stage: 'processing',
        message: `Processing file ${i + 1} of ${excelFiles.length}: ${file.name}`,
        progress: 30 + (i / excelFiles.length) * 30,
        completed: false,
        error: null
      });

      const fileData = await processExcelFileFromStorage(file.name);
      
      // Merge the data
      processedData.sectors = [...processedData.sectors, ...fileData.sectors];
      processedData.categories = [...processedData.categories, ...fileData.categories];
      processedData.subcategories = [...processedData.subcategories, ...fileData.subcategories];
      processedData.jobs = [...processedData.jobs, ...fileData.jobs];
    }

    // Step 4: Import processed data to database
    progressCallback({
      stage: 'importing',
      message: 'Importing service data to database...',
      progress: 70,
      completed: false,
      error: null
    });

    const stats = await importProcessedDataToDatabase(processedData);

    // Step 5: Complete
    progressCallback({
      stage: 'complete',
      message: 'Service data import completed successfully!',
      progress: 100,
      completed: true,
      error: null
    });

    return {
      success: true,
      message: `Successfully imported ${stats.totalSectors} sectors, ${stats.totalCategories} categories, ${stats.totalSubcategories} subcategories, and ${stats.totalJobs} jobs.`,
      stats
    };

  } catch (error) {
    console.error('Error importing services from storage:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
};

// Function to remove test data
export const removeTestData = async (): Promise<boolean> => {
  try {
    // Implementation pending
    return true;
  } catch (error) {
    console.error('Error removing test data:', error);
    throw error;
  }
};

// Function to cleanup misplaced service data
export const cleanupMisplacedServiceData = async (): Promise<boolean> => {
  try {
    // Implementation pending
    return true;
  } catch (error) {
    console.error('Error cleaning up misplaced service data:', error);
    throw error;
  }
};
