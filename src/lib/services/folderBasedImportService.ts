
import { supabase } from '@/lib/supabase';

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
}

export interface ImportStats {
  sectors: number;
  categories: number;
  subcategories: number;
  jobs: number;
  totalImported: number;
  errors: string[];
}

export interface ProcessedServiceData {
  sectors: {
    name: string;
    description?: string;
    categories: {
      name: string;
      description?: string;
      subcategories: {
        name: string;
        description?: string;
        jobs: {
          name: string;
          description?: string;
          estimatedTime?: number;
          price?: number;
        }[];
      }[];
    }[];
  }[];
}

export interface ServiceJob {
  name: string;
  description?: string;
  estimatedTime?: number;
  price?: number;
}

export interface ServiceSubcategory {
  name: string;
  description?: string;
  jobs: ServiceJob[];
}

export interface ServiceCategory {
  name: string;
  description?: string;
  subcategories: ServiceSubcategory[];
}

export interface ServiceSector {
  name: string;
  description?: string;
  categories: ServiceCategory[];
}

// Helper function to safely get string value
const safeString = (value: any): string => {
  return value ? String(value).trim() : '';
};

// Helper function to safely get number value
const safeNumber = (value: any): number | undefined => {
  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
};

export async function processExcelFileFromStorage(
  fileName: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<ProcessedServiceData> {
  try {
    onProgress?.({
      stage: 'downloading',
      progress: 10,
      message: `Downloading ${fileName}...`,
      completed: false,
      error: null
    });

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('service-data')
      .download(fileName);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download ${fileName}: ${downloadError?.message}`);
    }

    onProgress?.({
      stage: 'processing',
      progress: 50,
      message: `Processing ${fileName}...`,
      completed: false,
      error: null
    });

    // Process the file data here
    const processedData: ProcessedServiceData = {
      sectors: []
    };

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: `Successfully processed ${fileName}`,
      completed: true,
      error: null
    });

    return processedData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    onProgress?.({
      stage: 'error',
      progress: 0,
      message: errorMessage,
      completed: false,
      error: errorMessage
    });
    throw error;
  }
}

export async function getServiceCounts(): Promise<ImportStats> {
  try {
    const { data: sectors, error: sectorsError } = await supabase
      .from('service_sectors')
      .select('*');

    const { data: categories, error: categoriesError } = await supabase
      .from('service_categories')
      .select('*');

    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('service_subcategories')
      .select('*');

    const { data: jobs, error: jobsError } = await supabase
      .from('service_jobs')
      .select('*');

    if (sectorsError || categoriesError || subcategoriesError || jobsError) {
      throw new Error('Failed to fetch service counts');
    }

    return {
      sectors: sectors?.length || 0,
      categories: categories?.length || 0,
      subcategories: subcategories?.length || 0,
      jobs: jobs?.length || 0,
      totalImported: (sectors?.length || 0) + (categories?.length || 0) + (subcategories?.length || 0) + (jobs?.length || 0),
      errors: []
    };
  } catch (error) {
    console.error('Error getting service counts:', error);
    return {
      sectors: 0,
      categories: 0,
      subcategories: 0,
      jobs: 0,
      totalImported: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

export async function clearAllServiceData(): Promise<void> {
  try {
    // Clear in order due to foreign key constraints
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
}

export async function importServicesFromStorage(
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  try {
    onProgress?.({
      stage: 'starting',
      progress: 0,
      message: 'Starting import process...',
      completed: false,
      error: null
    });

    // List files in the service-data bucket
    const { data: files, error: listError } = await supabase.storage
      .from('service-data')
      .list();

    if (listError || !files) {
      throw new Error(`Failed to list files: ${listError?.message}`);
    }

    const excelFiles = files.filter(file => 
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
    );

    if (excelFiles.length === 0) {
      throw new Error('No Excel files found in storage');
    }

    onProgress?.({
      stage: 'processing',
      progress: 20,
      message: `Found ${excelFiles.length} Excel files to process`,
      completed: false,
      error: null
    });

    const allProcessedData: ProcessedServiceData[] = [];
    const errors: string[] = [];

    for (let i = 0; i < excelFiles.length; i++) {
      const file = excelFiles[i];
      try {
        const progressPercent = 20 + (i / excelFiles.length) * 60;
        
        onProgress?.({
          stage: 'processing',
          progress: progressPercent,
          message: `Processing ${file.name}...`,
          completed: false,
          error: null
        });

        const processedData = await processExcelFileFromStorage(file.name);
        allProcessedData.push(processedData);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Error processing ${file.name}: ${errorMessage}`);
      }
    }

    onProgress?.({
      stage: 'importing',
      progress: 80,
      message: 'Importing data to database...',
      completed: false,
      error: null
    });

    // Combine all processed data
    const combinedData: ProcessedServiceData = {
      sectors: allProcessedData.flatMap(data => data.sectors)
    };

    const importStats = await importProcessedDataToDatabase(combinedData);

    onProgress?.({
      stage: 'complete',
      progress: 100,
      message: `Import completed successfully. Imported ${importStats.totalImported} items.`,
      completed: true,
      error: null
    });

    return {
      totalImported: importStats.totalImported,
      errors: [...errors, ...importStats.errors]
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    onProgress?.({
      stage: 'error',
      progress: 0,
      message: errorMessage,
      completed: false,
      error: errorMessage
    });
    throw error;
  }
}

export async function importProcessedDataToDatabase(data: ProcessedServiceData): Promise<ImportStats> {
  try {
    let totalImported = 0;
    const errors: string[] = [];

    // Import sectors, categories, subcategories, and jobs
    for (const sector of data.sectors) {
      try {
        // Insert sector
        const { data: sectorData, error: sectorError } = await supabase
          .from('service_sectors')
          .insert({ name: sector.name, description: sector.description })
          .select()
          .single();

        if (sectorError) throw sectorError;
        totalImported++;

        // Import categories for this sector
        for (const category of sector.categories) {
          try {
            const { data: categoryData, error: categoryError } = await supabase
              .from('service_categories')
              .insert({ 
                name: category.name, 
                description: category.description,
                sector_id: sectorData.id
              })
              .select()
              .single();

            if (categoryError) throw categoryError;
            totalImported++;

            // Import subcategories for this category
            for (const subcategory of category.subcategories) {
              try {
                const { data: subcategoryData, error: subcategoryError } = await supabase
                  .from('service_subcategories')
                  .insert({
                    name: subcategory.name,
                    description: subcategory.description,
                    category_id: categoryData.id
                  })
                  .select()
                  .single();

                if (subcategoryError) throw subcategoryError;
                totalImported++;

                // Import jobs for this subcategory
                for (const job of subcategory.jobs) {
                  try {
                    const { error: jobError } = await supabase
                      .from('service_jobs')
                      .insert({
                        name: job.name,
                        description: job.description,
                        estimated_time: job.estimatedTime,
                        price: job.price,
                        subcategory_id: subcategoryData.id
                      });

                    if (jobError) throw jobError;
                    totalImported++;
                  } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    errors.push(`Error importing job ${job.name}: ${errorMessage}`);
                  }
                }
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                errors.push(`Error importing subcategory ${subcategory.name}: ${errorMessage}`);
              }
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Error importing category ${category.name}: ${errorMessage}`);
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Error importing sector ${sector.name}: ${errorMessage}`);
      }
    }

    const finalStats = await getServiceCounts();
    return {
      ...finalStats,
      totalImported,
      errors
    };
  } catch (error) {
    console.error('Error importing data to database:', error);
    throw error;
  }
}

export function processServiceDataFromSheets(sheetData: any[]): ProcessedServiceData {
  const sectorsMap = new Map<string, ServiceSector>();

  sheetData.forEach((row: any) => {
    const sectorName = safeString(row.Sector || row.sector);
    const categoryName = safeString(row.Category || row.category);
    const subcategoryName = safeString(row.Subcategory || row.subcategory);
    const jobName = safeString(row.Job || row.job || row.Service || row.service);
    const jobDescription = safeString(row.Description || row.description);
    const estimatedTime = safeNumber(row.EstimatedTime || row.estimated_time);
    const price = safeNumber(row.Price || row.price);

    if (!sectorName || !categoryName || !subcategoryName || !jobName) {
      return; // Skip invalid rows
    }

    // Get or create sector
    if (!sectorsMap.has(sectorName)) {
      sectorsMap.set(sectorName, {
        name: sectorName,
        categories: []
      });
    }

    const sector = sectorsMap.get(sectorName)!;

    // Get or create category
    let category = sector.categories.find(c => c.name === categoryName);
    if (!category) {
      category = {
        name: categoryName,
        subcategories: []
      };
      sector.categories.push(category);
    }

    // Get or create subcategory
    let subcategory = category.subcategories.find(s => s.name === subcategoryName);
    if (!subcategory) {
      subcategory = {
        name: subcategoryName,
        jobs: []
      };
      category.subcategories.push(subcategory);
    }

    // Add job
    subcategory.jobs.push({
      name: jobName,
      description: jobDescription || undefined,
      estimatedTime,
      price
    });
  });

  return {
    sectors: Array.from(sectorsMap.values())
  };
}
