
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
  errors: string[];
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
}

export interface ImportStats {
  totalImported: number;
  errors: string[];
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
}

export interface ProcessedServiceData {
  sectors: Array<{
    name: string;
    description?: string;
    categories: Array<{
      name: string;
      description?: string;
      subcategories: Array<{
        name: string;
        description?: string;
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

const STORAGE_BUCKET = 'service-data';

export const processExcelFileFromStorage = async (
  onProgress: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  try {
    onProgress({
      stage: 'Connecting to Storage',
      message: 'Accessing storage bucket...',
      progress: 5,
      completed: false,
      error: null
    });

    // List all files in the service-data bucket
    const { data: files, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', {
        limit: 1000, // Remove artificial limits
        sortBy: { column: 'name', order: 'asc' }
      });

    if (listError) {
      throw new Error(`Failed to list files: ${listError.message}`);
    }

    if (!files || files.length === 0) {
      throw new Error('No files found in service-data bucket');
    }

    onProgress({
      stage: 'Processing Files',
      message: `Found ${files.length} files in storage`,
      progress: 10,
      completed: false,
      error: null
    });

    const processedData: ProcessedServiceData = { sectors: [] };
    let totalProcessed = 0;
    
    // Filter Excel files
    const excelFiles = files.filter(file => 
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );

    if (excelFiles.length === 0) {
      throw new Error('No Excel files found in storage bucket');
    }

    console.log(`Processing ${excelFiles.length} Excel files`);

    // Process each Excel file
    for (let i = 0; i < excelFiles.length; i++) {
      const file = excelFiles[i];
      const progressPercent = 10 + (i / excelFiles.length) * 60;

      onProgress({
        stage: 'Reading Excel Files',
        message: `Processing ${file.name} (${i + 1}/${excelFiles.length})`,
        progress: progressPercent,
        completed: false,
        error: null
      });

      try {
        // Download file from storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .download(file.name);

        if (downloadError) {
          console.error(`Failed to download ${file.name}:`, downloadError);
          continue;
        }

        // Convert blob to array buffer
        const arrayBuffer = await fileData.arrayBuffer();
        
        // Parse Excel file
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Process each worksheet
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length > 1) { // Skip empty sheets
            const sectorData = processWorksheetData(jsonData, file.name, sheetName);
            if (sectorData) {
              mergeOrAddSector(processedData, sectorData);
              totalProcessed++;
            }
          }
        }
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        // Continue with other files instead of failing completely
      }
    }

    onProgress({
      stage: 'Importing to Database',
      message: 'Clearing existing data and importing new data...',
      progress: 75,
      completed: false,
      error: null
    });

    // Clear existing data
    await clearAllServiceData();

    // Import processed data
    const importResult = await importProcessedDataToDatabase(processedData, onProgress);

    onProgress({
      stage: 'Import Complete',
      message: `Successfully imported ${importResult.totalImported} services from ${totalProcessed} data sources`,
      progress: 100,
      completed: true,
      error: null
    });

    return {
      ...importResult,
      totalImported: importResult.totalImported
    };

  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
};

const processWorksheetData = (jsonData: any[][], fileName: string, sheetName: string) => {
  try {
    // Assume first row contains headers
    const headers = jsonData[0] as string[];
    
    // Find column indices
    const sectorCol = findColumnIndex(headers, ['sector', 'service_sector', 'category_sector']);
    const categoryCol = findColumnIndex(headers, ['category', 'service_category', 'main_category']);
    const subcategoryCol = findColumnIndex(headers, ['subcategory', 'service_subcategory', 'sub_category']);
    const serviceCol = findColumnIndex(headers, ['service', 'job', 'service_name', 'job_name']);
    const descriptionCol = findColumnIndex(headers, ['description', 'desc', 'service_description']);
    const timeCol = findColumnIndex(headers, ['time', 'estimated_time', 'duration', 'hours']);
    const priceCol = findColumnIndex(headers, ['price', 'cost', 'rate', 'amount']);

    if (sectorCol === -1 || categoryCol === -1 || subcategoryCol === -1 || serviceCol === -1) {
      console.warn(`Skipping ${fileName}/${sheetName}: Missing required columns`);
      return null;
    }

    const sectorData: any = {
      name: sheetName.replace(/[_-]/g, ' ').trim() || 'General',
      description: `Services from ${fileName}`,
      categories: new Map()
    };

    // Process data rows (skip header)
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.length === 0) continue;

      const sector = row[sectorCol]?.toString()?.trim();
      const category = row[categoryCol]?.toString()?.trim();
      const subcategory = row[subcategoryCol]?.toString()?.trim();
      const service = row[serviceCol]?.toString()?.trim();

      if (!sector || !category || !subcategory || !service) continue;

      // Use sector from data if available, otherwise use sheet name
      if (sector && sector !== sectorData.name) {
        sectorData.name = sector;
      }

      // Get or create category
      if (!sectorData.categories.has(category)) {
        sectorData.categories.set(category, {
          name: category,
          description: `${category} services`,
          subcategories: new Map()
        });
      }

      const categoryData = sectorData.categories.get(category);

      // Get or create subcategory
      if (!categoryData.subcategories.has(subcategory)) {
        categoryData.subcategories.set(subcategory, {
          name: subcategory,
          description: `${subcategory} services`,
          jobs: []
        });
      }

      const subcategoryData = categoryData.subcategories.get(subcategory);

      // Add service/job
      const jobData: any = {
        name: service,
        description: descriptionCol !== -1 ? row[descriptionCol]?.toString()?.trim() : undefined
      };

      // Parse time if available
      if (timeCol !== -1 && row[timeCol]) {
        const timeValue = parseFloat(row[timeCol].toString());
        if (!isNaN(timeValue)) {
          jobData.estimatedTime = Math.round(timeValue * 60); // Convert hours to minutes
        }
      }

      // Parse price if available
      if (priceCol !== -1 && row[priceCol]) {
        const priceValue = parseFloat(row[priceCol].toString().replace(/[^0-9.-]/g, ''));
        if (!isNaN(priceValue)) {
          jobData.price = priceValue;
        }
      }

      subcategoryData.jobs.push(jobData);
    }

    // Convert Maps to Arrays
    const processedCategories = Array.from(sectorData.categories.values()).map(cat => ({
      ...cat,
      subcategories: Array.from(cat.subcategories.values())
    }));

    return {
      name: sectorData.name,
      description: sectorData.description,
      categories: processedCategories
    };

  } catch (error) {
    console.error(`Error processing worksheet ${fileName}/${sheetName}:`, error);
    return null;
  }
};

const findColumnIndex = (headers: string[], possibleNames: string[]): number => {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => 
      h?.toString()?.toLowerCase()?.trim() === name.toLowerCase()
    );
    if (index !== -1) return index;
  }
  return -1;
};

const mergeOrAddSector = (processedData: ProcessedServiceData, newSector: any) => {
  const existingSector = processedData.sectors.find(s => s.name === newSector.name);
  
  if (existingSector) {
    // Merge categories
    for (const newCategory of newSector.categories) {
      const existingCategory = existingSector.categories.find(c => c.name === newCategory.name);
      
      if (existingCategory) {
        // Merge subcategories
        for (const newSubcategory of newCategory.subcategories) {
          const existingSubcategory = existingCategory.subcategories.find(s => s.name === newSubcategory.name);
          
          if (existingSubcategory) {
            // Merge jobs (avoid duplicates)
            for (const newJob of newSubcategory.jobs) {
              if (!existingSubcategory.jobs.find(j => j.name === newJob.name)) {
                existingSubcategory.jobs.push(newJob);
              }
            }
          } else {
            existingCategory.subcategories.push(newSubcategory);
          }
        }
      } else {
        existingSector.categories.push(newCategory);
      }
    }
  } else {
    processedData.sectors.push(newSector);
  }
};

const importProcessedDataToDatabase = async (
  data: ProcessedServiceData,
  onProgress: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  let totalImported = 0;
  const errors: string[] = [];
  let sectorCount = 0;
  let categoryCount = 0;
  let subcategoryCount = 0;
  let serviceCount = 0;

  try {
    for (const sector of data.sectors) {
      onProgress({
        stage: 'Importing Sectors',
        message: `Importing sector: ${sector.name}`,
        progress: 80 + (sectorCount / data.sectors.length) * 15,
        completed: false,
        error: null
      });

      // Insert sector
      const { data: sectorData, error: sectorError } = await supabase
        .from('service_sectors')
        .insert({
          name: sector.name,
          description: sector.description,
          position: sectorCount + 1,
          is_active: true
        })
        .select()
        .single();

      if (sectorError) {
        errors.push(`Failed to insert sector ${sector.name}: ${sectorError.message}`);
        continue;
      }

      sectorCount++;

      // Insert categories
      for (const category of sector.categories) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            name: category.name,
            description: category.description,
            sector_id: sectorData.id,
            position: categoryCount + 1
          })
          .select()
          .single();

        if (categoryError) {
          errors.push(`Failed to insert category ${category.name}: ${categoryError.message}`);
          continue;
        }

        categoryCount++;

        // Insert subcategories
        for (const subcategory of category.subcategories) {
          const { data: subcategoryData, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert({
              name: subcategory.name,
              description: subcategory.description,
              category_id: categoryData.id,
              position: subcategoryCount + 1
            })
            .select()
            .single();

          if (subcategoryError) {
            errors.push(`Failed to insert subcategory ${subcategory.name}: ${subcategoryError.message}`);
            continue;
          }

          subcategoryCount++;

          // Insert jobs/services
          for (const job of subcategory.jobs) {
            const { error: jobError } = await supabase
              .from('service_jobs')
              .insert({
                name: job.name,
                description: job.description,
                estimated_time: job.estimatedTime,
                price: job.price,
                subcategory_id: subcategoryData.id,
                position: serviceCount + 1
              });

            if (jobError) {
              errors.push(`Failed to insert job ${job.name}: ${jobError.message}`);
              continue;
            }

            serviceCount++;
            totalImported++;
          }
        }
      }
    }

    return {
      totalImported,
      errors,
      sectors: sectorCount,
      categories: categoryCount,
      subcategories: subcategoryCount,
      services: serviceCount
    };

  } catch (error) {
    console.error('Database import failed:', error);
    throw error;
  }
};

export const importServicesFromStorage = async (
  onProgress: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  return processExcelFileFromStorage(onProgress);
};

export const clearAllServiceData = async (): Promise<void> => {
  try {
    console.log('Clearing all service data...');
    
    // Delete in correct order due to foreign key constraints
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('Service data cleared successfully');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
};

export const getServiceCounts = async () => {
  try {
    const [sectorsResult, categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
      supabase.from('service_sectors').select('id', { count: 'exact' }),
      supabase.from('service_categories').select('id', { count: 'exact' }),
      supabase.from('service_subcategories').select('id', { count: 'exact' }),
      supabase.from('service_jobs').select('id', { count: 'exact' })
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
};
