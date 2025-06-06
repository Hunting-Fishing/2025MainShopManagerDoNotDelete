
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import { useState } from 'react';

// Define types
export type ImportProgress = {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
};

export type ImportStats = {
  totalImported: number;
  errors: string[];
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
};

export type ImportResult = {
  totalImported: number;
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
  errors?: string[];
};

export type ProcessedServiceData = {
  sectors: Map<string, { 
    id?: string; 
    name: string; 
    description?: string;
    position?: number;
    categories: Map<string, any>; 
  }>;
};

// Add function to check bucket status
export const getStorageBucketInfo = async (bucketName: string) => {
  try {
    // First check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error("Error checking buckets:", bucketError);
      return { exists: false, fileCount: 0 };
    }

    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket '${bucketName}' does not exist`);
      return { exists: false, fileCount: 0 };
    }

    // Check for files in the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from(bucketName)
      .list();

    if (filesError) {
      console.error("Error listing files:", filesError);
      return { exists: true, fileCount: 0 };
    }

    // Count Excel files
    const excelFiles = files.filter(file => 
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls') || 
      file.name.endsWith('.csv')
    );

    console.log(`Found ${excelFiles.length} Excel files in '${bucketName}' bucket`);
    return { exists: true, fileCount: excelFiles.length };
  } catch (error) {
    console.error("Error in getStorageBucketInfo:", error);
    return { exists: false, fileCount: 0 };
  }
};

export const getServiceCounts = async () => {
  try {
    // Get sector count
    const { count: sectorCount, error: sectorError } = await supabase
      .from('service_sectors')
      .select('*', { count: 'exact', head: true });

    if (sectorError) throw sectorError;

    // Get category count
    const { count: categoryCount, error: categoryError } = await supabase
      .from('service_categories')
      .select('*', { count: 'exact', head: true });

    if (categoryError) throw categoryError;

    // Get subcategory count
    const { count: subcategoryCount, error: subcategoryError } = await supabase
      .from('service_subcategories')
      .select('*', { count: 'exact', head: true });

    if (subcategoryError) throw subcategoryError;

    // Get service count
    const { count: serviceCount, error: serviceError } = await supabase
      .from('service_jobs')
      .select('*', { count: 'exact', head: true });

    if (serviceError) throw serviceError;

    return {
      sectors: sectorCount || 0,
      categories: categoryCount || 0,
      subcategories: subcategoryCount || 0,
      services: serviceCount || 0
    };
  } catch (error) {
    console.error('Error getting service counts:', error);
    return {
      sectors: 0,
      categories: 0,
      subcategories: 0,
      services: 0
    };
  }
};

export const processExcelFileFromStorage = async (
  onProgress: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  try {
    onProgress({
      stage: 'Checking Storage',
      message: 'Looking for Excel files in storage bucket...',
      progress: 5,
      completed: false,
      error: null
    });

    // List files in the storage bucket
    const { data: files, error: listError } = await supabase.storage
      .from('service-data')
      .list();

    if (listError) {
      throw new Error(`Error listing files: ${listError.message}`);
    }

    if (!files || files.length === 0) {
      throw new Error('No files found in service-data bucket');
    }

    // Filter for Excel files
    const excelFiles = files.filter(file => 
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls') || 
      file.name.endsWith('.csv')
    );

    if (excelFiles.length === 0) {
      throw new Error('No Excel files found in service-data bucket');
    }

    onProgress({
      stage: 'Found Files',
      message: `Found ${excelFiles.length} Excel files in storage`,
      progress: 10,
      completed: false,
      error: null
    });

    // Process all Excel files
    let processedData: ProcessedServiceData = {
      sectors: new Map()
    };

    for (let i = 0; i < excelFiles.length; i++) {
      const file = excelFiles[i];
      const fileProgress = 80 / excelFiles.length;
      const baseProgress = 10 + (i * fileProgress);
      
      onProgress({
        stage: 'Downloading File',
        message: `Downloading ${file.name} (${i + 1}/${excelFiles.length})`,
        progress: baseProgress,
        completed: false,
        error: null
      });

      // Download the file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('service-data')
        .download(file.name);

      if (downloadError) {
        throw new Error(`Error downloading ${file.name}: ${downloadError.message}`);
      }

      if (!fileData) {
        throw new Error(`Failed to download ${file.name}`);
      }

      onProgress({
        stage: 'Processing File',
        message: `Processing ${file.name} (${i + 1}/${excelFiles.length})`,
        progress: baseProgress + fileProgress * 0.3,
        completed: false,
        error: null
      });

      // Parse the Excel file
      const arrayBuffer = await fileData.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      
      // Process each worksheet
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          // Now we have the data, process it
          processedData = await processExcelData(
            jsonData as any[], 
            processedData, 
            sheetName,
            file.name
          );
        }
      }

      onProgress({
        stage: 'File Processed',
        message: `Processed ${file.name} (${i + 1}/${excelFiles.length})`,
        progress: baseProgress + fileProgress * 0.7,
        completed: false,
        error: null
      });
    }

    // Import the processed data to the database
    onProgress({
      stage: 'Importing to Database',
      message: 'Saving service hierarchy to database...',
      progress: 90,
      completed: false,
      error: null
    });

    const result = await importProcessedDataToDatabase(processedData);

    onProgress({
      stage: 'Import Complete',
      message: `Successfully imported ${result.totalImported} services`,
      progress: 100,
      completed: true,
      error: null
    });

    return result;
  } catch (error: any) {
    console.error('Excel processing error:', error);
    throw error;
  }
};

async function processExcelData(
  data: any[],
  processedData: ProcessedServiceData,
  sheetName: string,
  fileName: string
): Promise<ProcessedServiceData> {
  console.log(`Processing sheet "${sheetName}" from "${fileName}" with ${data.length} rows`);
  
  // Detect column structure - look for expected column names
  const firstRow = data[0] || {};
  const columns = Object.keys(firstRow);

  // Look for sector, category, subcategory columns
  const sectorColumn = columns.find(c => 
    c.toLowerCase().includes('sector') || 
    c.toLowerCase().includes('industry')
  );
  
  const categoryColumn = columns.find(c => 
    c.toLowerCase().includes('category') || 
    c.toLowerCase().includes('main') || 
    c.toLowerCase().includes('primary')
  );
  
  const subcategoryColumn = columns.find(c => 
    c.toLowerCase().includes('subcategory') || 
    c.toLowerCase().includes('sub-category') || 
    c.toLowerCase().includes('secondary')
  );
  
  const serviceColumn = columns.find(c => 
    c.toLowerCase().includes('service') || 
    c.toLowerCase().includes('job') || 
    c.toLowerCase().includes('task')
  );

  const descriptionColumn = columns.find(c => 
    c.toLowerCase().includes('description') || 
    c.toLowerCase().includes('desc') || 
    c.toLowerCase().includes('details')
  );

  const priceColumn = columns.find(c => 
    c.toLowerCase().includes('price') || 
    c.toLowerCase().includes('cost') || 
    c.toLowerCase().includes('rate')
  );

  const timeColumn = columns.find(c => 
    c.toLowerCase().includes('time') || 
    c.toLowerCase().includes('duration') || 
    c.toLowerCase().includes('hours')
  );

  // Use the sheet name as a fallback sector if no sector column found
  const defaultSector = sheetName !== 'Sheet1' && sheetName !== 'Sheet' ? 
    sheetName : 'General';

  // Process each row
  for (const row of data) {
    try {
      // Extract data from row using detected columns
      const sector = (sectorColumn && row[sectorColumn]) ? 
        String(row[sectorColumn]).trim() : defaultSector;
      
      const category = (categoryColumn && row[categoryColumn]) ? 
        String(row[categoryColumn]).trim() : 'Uncategorized';
      
      const subcategory = (subcategoryColumn && row[subcategoryColumn]) ? 
        String(row[subcategoryColumn]).trim() : 'General';
      
      const service = (serviceColumn && row[serviceColumn]) ? 
        String(row[serviceColumn]).trim() : null;

      // Skip if no service name
      if (!service) continue;

      // Get or create sector
      if (!processedData.sectors.has(sector)) {
        processedData.sectors.set(sector, {
          name: sector,
          description: `${sector} services`,
          position: processedData.sectors.size + 1,
          categories: new Map()
        });
      }

      const sectorData = processedData.sectors.get(sector)!;

      // Get or create category
      if (!sectorData.categories.has(category)) {
        sectorData.categories.set(category, {
          name: category,
          description: `${category} services in ${sector}`,
          sector_id: sectorData.id,
          position: sectorData.categories.size + 1,
          subcategories: new Map()
        });
      }

      const categoryData = sectorData.categories.get(category)!;

      // Get or create subcategory
      if (!categoryData.subcategories.has(subcategory)) {
        categoryData.subcategories.set(subcategory, {
          name: subcategory,
          description: `${subcategory} services in ${category}`,
          category_id: categoryData.id,
          jobs: []
        });
      }

      const subcategoryData = categoryData.subcategories.get(subcategory)!;

      // Add job/service
      const estimatedTime = timeColumn && row[timeColumn] ? 
        parseFloat(row[timeColumn]) : null;
        
      const price = priceColumn && row[priceColumn] ? 
        parseFloat(row[priceColumn]) : null;
        
      const description = descriptionColumn && row[descriptionColumn] ? 
        String(row[descriptionColumn]) : `${service} service`;

      subcategoryData.jobs.push({
        name: service,
        description: description,
        estimated_time: estimatedTime,
        price: price,
        subcategory_id: subcategoryData.id
      });
    } catch (error) {
      console.error('Error processing row:', row, error);
    }
  }

  return processedData;
}

export const importServicesFromStorage = async (
  onProgress: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  return processExcelFileFromStorage(onProgress);
};

// This function will take the processed data and import it into the database
export const importProcessedDataToDatabase = async (
  data: ProcessedServiceData
): Promise<ImportResult> => {
  // Clear existing data first
  await clearAllServiceData();

  let result = {
    totalImported: 0,
    sectors: 0,
    categories: 0,
    subcategories: 0,
    services: 0,
    errors: [] as string[]
  };

  try {
    // Convert Maps to arrays for easier processing
    const sectorsArray = Array.from(data.sectors.entries()).map(([key, value]) => ({
      name: value.name,
      description: value.description,
      position: value.position,
      categories: Array.from(value.categories.entries()).map(([catKey, category]) => ({
        name: category.name,
        description: category.description,
        position: category.position,
        subcategories: Array.from(category.subcategories.entries()).map(([subKey, subcategory]) => ({
          name: subcategory.name,
          description: subcategory.description,
          jobs: subcategory.jobs
        }))
      }))
    }));

    console.log(`Importing ${sectorsArray.length} sectors`);

    // Insert sectors
    for (const sector of sectorsArray) {
      try {
        const { data: sectorData, error: sectorError } = await supabase
          .from('service_sectors')
          .insert({
            name: sector.name,
            description: sector.description,
            position: sector.position,
            is_active: true
          })
          .select()
          .single();

        if (sectorError) throw sectorError;

        result.sectors++;
        const sectorId = sectorData.id;

        // Insert categories
        for (const category of sector.categories) {
          try {
            const { data: categoryData, error: categoryError } = await supabase
              .from('service_categories')
              .insert({
                name: category.name,
                description: category.description,
                position: category.position,
                sector_id: sectorId
              })
              .select()
              .single();

            if (categoryError) throw categoryError;

            result.categories++;
            const categoryId = categoryData.id;

            // Insert subcategories
            for (const subcategory of category.subcategories) {
              try {
                const { data: subcategoryData, error: subcategoryError } = await supabase
                  .from('service_subcategories')
                  .insert({
                    name: subcategory.name,
                    description: subcategory.description,
                    category_id: categoryId
                  })
                  .select()
                  .single();

                if (subcategoryError) throw subcategoryError;

                result.subcategories++;
                const subcategoryId = subcategoryData.id;

                // Insert jobs/services
                for (const job of subcategory.jobs) {
                  try {
                    const { error: jobError } = await supabase
                      .from('service_jobs')
                      .insert({
                        name: job.name,
                        description: job.description,
                        estimated_time: job.estimated_time,
                        price: job.price,
                        subcategory_id: subcategoryId
                      });

                    if (jobError) throw jobError;

                    result.services++;
                    result.totalImported++;
                  } catch (jobError: any) {
                    result.errors.push(`Failed to insert job "${job.name}": ${jobError.message}`);
                    console.error('Error inserting job:', job, jobError);
                  }
                }
              } catch (subcategoryError: any) {
                result.errors.push(`Failed to insert subcategory "${subcategory.name}": ${subcategoryError.message}`);
                console.error('Error inserting subcategory:', subcategory, subcategoryError);
              }
            }
          } catch (categoryError: any) {
            result.errors.push(`Failed to insert category "${category.name}": ${categoryError.message}`);
            console.error('Error inserting category:', category, categoryError);
          }
        }
      } catch (sectorError: any) {
        result.errors.push(`Failed to insert sector "${sector.name}": ${sectorError.message}`);
        console.error('Error inserting sector:', sector, sectorError);
      }
    }

    return result;
  } catch (error: any) {
    console.error('Error importing data to database:', error);
    result.errors.push(`General import error: ${error.message}`);
    return result;
  }
};

export const clearAllServiceData = async () => {
  try {
    // Call the database function to clear all service data
    const { data, error } = await supabase.rpc('clear_service_data');
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error clearing service data:", error);
    throw error;
  }
};

// Additional utility functions
export const removeTestData = async () => {
  try {
    // Remove test data
    await supabase
      .from('service_jobs')
      .delete()
      .ilike('name', 'Test%');
      
    await supabase
      .from('service_subcategories')
      .delete()
      .ilike('name', 'Test%');
      
    await supabase
      .from('service_categories')
      .delete()
      .ilike('name', 'Test%');
      
    await supabase
      .from('service_sectors')
      .delete()
      .ilike('name', 'Test%');
      
    return true;
  } catch (error) {
    console.error("Error removing test data:", error);
    throw error;
  }
};

export const cleanupMisplacedServiceData = async () => {
  try {
    // Find services without subcategories and move them
    const { data: orphanedJobs, error: jobError } = await supabase
      .from('service_jobs')
      .select('*')
      .is('subcategory_id', null);
      
    if (jobError) throw jobError;
    
    if (orphanedJobs && orphanedJobs.length > 0) {
      // Get or create general subcategory
      let generalSubcategory;
      const { data: existingSubcat } = await supabase
        .from('service_subcategories')
        .select('*')
        .eq('name', 'General')
        .limit(1)
        .single();
        
      if (existingSubcat) {
        generalSubcategory = existingSubcat;
      } else {
        // Get or create general category
        let generalCategory;
        const { data: existingCat } = await supabase
          .from('service_categories')
          .select('*')
          .eq('name', 'Miscellaneous')
          .limit(1)
          .single();
          
        if (existingCat) {
          generalCategory = existingCat;
        } else {
          // Get or create general sector
          let generalSector;
          const { data: existingSector } = await supabase
            .from('service_sectors')
            .select('*')
            .eq('name', 'General')
            .limit(1)
            .single();
            
          if (existingSector) {
            generalSector = existingSector;
          } else {
            const { data: newSector } = await supabase
              .from('service_sectors')
              .insert({ name: 'General', description: 'General Services' })
              .select()
              .single();
              
            generalSector = newSector;
          }
          
          const { data: newCategory } = await supabase
            .from('service_categories')
            .insert({ 
              name: 'Miscellaneous', 
              description: 'Miscellaneous Services',
              sector_id: generalSector.id
            })
            .select()
            .single();
            
          generalCategory = newCategory;
        }
        
        const { data: newSubcategory } = await supabase
          .from('service_subcategories')
          .insert({ 
            name: 'General', 
            description: 'General Services',
            category_id: generalCategory.id
          })
          .select()
          .single();
          
        generalSubcategory = newSubcategory;
      }
      
      // Update all orphaned jobs
      await supabase
        .from('service_jobs')
        .update({ subcategory_id: generalSubcategory.id })
        .is('subcategory_id', null);
    }
    
    return true;
  } catch (error) {
    console.error("Error cleaning up misplaced data:", error);
    throw error;
  }
};

// This function processes the service data from sheets
export const processServiceDataFromSheets = async (data: any[]): Promise<ProcessedServiceData> => {
  const processedData: ProcessedServiceData = {
    sectors: new Map()
  };

  // Process the data here...
  return processedData;
};
