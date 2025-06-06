
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

export interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
}

export interface ImportResult {
  totalImported: number;
  errors?: string[];
  sectors?: number;
  categories?: number;
  subcategories?: number;
  services?: number;
}

export interface ProcessedServiceData {
  sectors: any[];
}

export interface ImportStats {
  totalImported: number;
  errors: string[];
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
}

export async function importServicesFromStorage(
  progressCallback: (progress: ImportProgress) => void
): Promise<ImportResult> {
  return processExcelFileFromStorage(progressCallback);
}

export async function processExcelFileFromStorage(
  progressCallback: (progress: ImportProgress) => void
): Promise<ImportResult> {
  try {
    // Start by getting the list of files from the storage bucket
    progressCallback({
      stage: 'Initializing',
      message: 'Fetching Excel files from storage...',
      progress: 5,
      completed: false,
      error: null
    });
    
    const { data: files, error: filesError } = await supabase
      .storage
      .from('service-data')
      .list();
      
    if (filesError) {
      throw new Error(`Error fetching files: ${filesError.message}`);
    }
    
    if (!files || files.length === 0) {
      throw new Error('No files found in the service-data bucket');
    }
    
    // Filter for Excel files
    const excelFiles = files.filter(file => 
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );
    
    if (excelFiles.length === 0) {
      throw new Error('No Excel files found in the service-data bucket');
    }

    let totalServicesImported = 0;
    let totalSectors = 0;
    let totalCategories = 0;
    let totalSubcategories = 0;
    let totalServices = 0;
    const errors: string[] = [];

    // Process each Excel file
    for (let i = 0; i < excelFiles.length; i++) {
      const file = excelFiles[i];
      const fileProgress = i / excelFiles.length * 100;
      
      progressCallback({
        stage: 'Processing files',
        message: `Processing file ${i + 1} of ${excelFiles.length}: ${file.name}`,
        progress: 5 + fileProgress * 0.4, // 5-45% progress during file processing
        completed: false,
        error: null
      });
      
      // Download the file
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from('service-data')
        .download(file.name);
        
      if (downloadError) {
        errors.push(`Error downloading ${file.name}: ${downloadError.message}`);
        console.error(`Error downloading ${file.name}:`, downloadError);
        continue;
      }
      
      if (!fileData) {
        errors.push(`No data in file: ${file.name}`);
        console.error(`No data in file: ${file.name}`);
        continue;
      }
      
      try {
        // Process the Excel file
        const buffer = await fileData.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        
        // Assume the first sheet contains our data
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with proper type assertion
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          errors.push(`No valid data in file: ${file.name}`);
          console.error(`No valid data in file: ${file.name}`);
          continue;
        }
        
        // Process the data from this file
        const { 
          sectors,
          categories,
          subcategories,
          services
        } = await processSheetData(jsonData, file.name, progressCallback, fileProgress);
        
        // Update totals
        totalSectors += sectors;
        totalCategories += categories;
        totalSubcategories += subcategories;
        totalServices += services;
        totalServicesImported += services;
      } catch (err: any) {
        const errorMessage = `Error processing ${file.name}: ${err.message || 'Unknown error'}`;
        errors.push(errorMessage);
        console.error(errorMessage, err);
      }
    }

    // Now import the processed data into the database
    progressCallback({
      stage: 'Saving to database',
      message: 'Importing processed service data to database...',
      progress: 60,
      completed: false,
      error: null
    });

    await clearExistingData(progressCallback);
    
    const result = {
      totalImported: totalServicesImported,
      errors: errors.length > 0 ? errors : undefined,
      sectors: totalSectors,
      categories: totalCategories,
      subcategories: totalSubcategories,
      services: totalServices,
    };

    console.log(`Import completed with ${result.totalImported} services imported`);
    
    return result;
  } catch (error: any) {
    console.error("Error in processExcelFileFromStorage:", error);
    throw error;
  }
}

async function processSheetData(
  jsonData: any[], 
  fileName: string,
  progressCallback: (progress: ImportProgress) => void,
  baseProgress: number
): Promise<{ sectors: number; categories: number; subcategories: number; services: number }> {
  try {
    // Log the structure for debugging
    console.log(`Processing sheet data from ${fileName} with ${jsonData.length} rows`);

    // Initialize counters
    let sectorCount = 0;
    let categoryCount = 0;
    let subcategoryCount = 0;
    let serviceCount = 0;

    // Create a map to track sectors and categories
    const sectorsMap = new Map<string, any>();
    
    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      // Update progress periodically
      if (i % 20 === 0) {
        progressCallback({
          stage: 'Processing data',
          message: `Processing row ${i + 1} of ${jsonData.length} in ${fileName}`,
          progress: 5 + baseProgress + (i / jsonData.length * 10),
          completed: false,
          error: null
        });
      }

      // Skip invalid rows
      if (!row) continue;

      // Extract data from row (adapt this based on your Excel structure)
      const sectorName = row.Sector || row.sector || 'General';
      const categoryName = row.Category || row.category || 'Miscellaneous';
      const subcategoryName = row.Subcategory || row.subcategory || 'General';
      const serviceName = row.Service || row.service || row.Name || row.name;
      
      if (!serviceName) {
        console.warn('Skipping row with no service name:', row);
        continue;
      }

      // Create sector if it doesn't exist
      if (!sectorsMap.has(sectorName)) {
        sectorsMap.set(sectorName, {
          name: sectorName,
          categories: new Map<string, any>()
        });
        sectorCount++;
      }
      
      const sector = sectorsMap.get(sectorName);
      
      // Create category if it doesn't exist
      if (!sector.categories.has(categoryName)) {
        sector.categories.set(categoryName, {
          name: categoryName,
          subcategories: new Map<string, any>()
        });
        categoryCount++;
      }
      
      const category = sector.categories.get(categoryName);
      
      // Create subcategory if it doesn't exist
      if (!category.subcategories.has(subcategoryName)) {
        category.subcategories.set(subcategoryName, {
          name: subcategoryName,
          jobs: []
        });
        subcategoryCount++;
      }
      
      const subcategory = category.subcategories.get(subcategoryName);
      
      // Add service to subcategory
      subcategory.jobs.push({
        name: serviceName,
        description: row.Description || row.description || '',
        estimatedTime: row.EstimatedTime || row.estimatedTime || row.Time || row.time,
        price: row.Price || row.price
      });
      
      serviceCount++;
    }

    // Convert map to array structure
    const sectorsArray = Array.from(sectorsMap.entries()).map(([name, sectorData]) => {
      const categoriesArray = Array.from(sectorData.categories.entries()).map(([name, categoryData]) => {
        const subcategoriesArray = Array.from(categoryData.subcategories.entries()).map(([name, subcategoryData]) => {
          return {
            name: subcategoryData.name,
            jobs: subcategoryData.jobs
          };
        });
        
        return {
          name: categoryData.name,
          subcategories: subcategoriesArray
        };
      });
      
      return {
        name: sectorData.name,
        categories: categoriesArray
      };
    });

    // Log the processed structure
    sectorsArray.forEach(sector => {
      console.log(`Sector "${sector.name}": ${sector.categories.length} categories, ${
        sector.categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)
      } subcategories, ${
        sector.categories.reduce((sum, cat) => 
          sum + cat.subcategories.reduce((subSum, subcat) => 
            subSum + subcat.jobs.length, 0), 0)
      } jobs`);
    });

    // Import the data to our database
    for (const sector of sectorsArray) {
      // Insert sector
      const { data: sectorData, error: sectorError } = await supabase
        .from('service_sectors')
        .insert({
          name: sector.name,
          description: `Services in the ${sector.name} sector`,
          is_active: true,
          position: 0
        })
        .select();

      if (sectorError) {
        console.error(`Error inserting sector ${sector.name}:`, sectorError);
        throw new Error(`Error inserting sector: ${sectorError.message}`);
      }

      if (!sectorData || sectorData.length === 0) {
        console.error(`No data returned after inserting sector ${sector.name}`);
        throw new Error(`No data returned after inserting sector ${sector.name}`);
      }

      const sectorId = sectorData[0].id;

      // Insert categories
      for (let catIdx = 0; catIdx < sector.categories.length; catIdx++) {
        const category = sector.categories[catIdx];
        
        const { data: categoryData, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            name: category.name,
            description: `${category.name} services in the ${sector.name} sector`,
            sector_id: sectorId,
            position: catIdx
          })
          .select();

        if (categoryError) {
          console.error(`Error inserting category ${category.name}:`, categoryError);
          throw new Error(`Error inserting category: ${categoryError.message}`);
        }

        if (!categoryData || categoryData.length === 0) {
          console.error(`No data returned after inserting category ${category.name}`);
          throw new Error(`No data returned after inserting category ${category.name}`);
        }

        const categoryId = categoryData[0].id;

        // Insert subcategories
        for (let subcatIdx = 0; subcatIdx < category.subcategories.length; subcatIdx++) {
          const subcategory = category.subcategories[subcatIdx];
          
          const { data: subcategoryData, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert({
              name: subcategory.name,
              description: `${subcategory.name} services in ${category.name}`,
              category_id: categoryId
            })
            .select();

          if (subcategoryError) {
            console.error(`Error inserting subcategory ${subcategory.name}:`, subcategoryError);
            throw new Error(`Error inserting subcategory: ${subcategoryError.message}`);
          }

          if (!subcategoryData || subcategoryData.length === 0) {
            console.error(`No data returned after inserting subcategory ${subcategory.name}`);
            throw new Error(`No data returned after inserting subcategory ${subcategory.name}`);
          }

          const subcategoryId = subcategoryData[0].id;

          // Insert jobs
          if (subcategory.jobs && subcategory.jobs.length > 0) {
            for (const job of subcategory.jobs) {
              const { error: jobError } = await supabase
                .from('service_jobs')
                .insert({
                  name: job.name,
                  description: job.description,
                  estimated_time: job.estimatedTime,
                  price: job.price,
                  subcategory_id: subcategoryId
                });

              if (jobError) {
                console.error(`Error inserting job ${job.name}:`, jobError);
                throw new Error(`Error inserting job: ${jobError.message}`);
              }
            }
          }
        }
      }
    }

    return {
      sectors: sectorCount,
      categories: categoryCount,
      subcategories: subcategoryCount,
      services: serviceCount
    };
  } catch (error: any) {
    console.error("Error processing sheet data:", error);
    throw error;
  }
}

async function clearExistingData(progressCallback: (progress: ImportProgress) => void): Promise<void> {
  try {
    progressCallback({
      stage: 'Clearing existing data',
      message: 'Removing previous service data...',
      progress: 50,
      completed: false,
      error: null
    });

    // Delete all jobs first
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Delete all subcategories
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Delete all categories
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Delete all sectors
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    progressCallback({
      stage: 'Cleared existing data',
      message: 'Previous service data removed successfully',
      progress: 55,
      completed: false,
      error: null
    });
  } catch (error: any) {
    console.error("Error clearing existing data:", error);
    throw new Error(`Error clearing existing data: ${error.message}`);
  }
}

export async function clearAllServiceData(): Promise<void> {
  try {
    console.log("Clearing all service data...");

    // Delete all jobs first (child tables first to maintain referential integrity)
    const { error: jobsError } = await supabase
      .from('service_jobs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (jobsError) throw new Error(`Error deleting jobs: ${jobsError.message}`);
    console.log("Jobs deleted");

    // Delete all subcategories
    const { error: subcategoriesError } = await supabase
      .from('service_subcategories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (subcategoriesError) throw new Error(`Error deleting subcategories: ${subcategoriesError.message}`);
    console.log("Subcategories deleted");

    // Delete all categories
    const { error: categoriesError } = await supabase
      .from('service_categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (categoriesError) throw new Error(`Error deleting categories: ${categoriesError.message}`);
    console.log("Categories deleted");

    // Delete all sectors
    const { error: sectorsError } = await supabase
      .from('service_sectors')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (sectorsError) throw new Error(`Error deleting sectors: ${sectorsError.message}`);
    console.log("Sectors deleted");

  } catch (error: any) {
    console.error("Error in clearAllServiceData:", error);
    throw error;
  }
}

export async function getServiceCounts(): Promise<{
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
}> {
  try {
    const { count: sectorsCount } = await supabase
      .from('service_sectors')
      .select('*', { count: 'exact', head: true });

    const { count: categoriesCount } = await supabase
      .from('service_categories')
      .select('*', { count: 'exact', head: true });

    const { count: subcategoriesCount } = await supabase
      .from('service_subcategories')
      .select('*', { count: 'exact', head: true });

    const { count: servicesCount } = await supabase
      .from('service_jobs')
      .select('*', { count: 'exact', head: true });

    return {
      sectors: sectorsCount || 0,
      categories: categoriesCount || 0,
      subcategories: subcategoriesCount || 0,
      services: servicesCount || 0
    };
  } catch (error) {
    console.error("Error fetching service counts:", error);
    return {
      sectors: 0,
      categories: 0,
      subcategories: 0,
      services: 0
    };
  }
}
