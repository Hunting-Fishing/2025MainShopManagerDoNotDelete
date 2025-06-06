
import { supabase } from '@/integrations/supabase/client';
import { storageService } from './unifiedStorageService';

export interface ProcessedServiceData {
  sectorName: string;
  categories: {
    name: string;
    subcategories: {
      name: string;
      jobs: {
        name: string;
        description?: string;
        estimatedTime?: number;
        price?: number;
      }[];
    }[];
  }[];
}

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
}

export interface ImportStats {
  sectorsCreated: number;
  categoriesCreated: number;
  subcategoriesCreated: number;
  jobsCreated: number;
}

export async function processExcelFileFromStorage(bucketName: string, filePath: string): Promise<ProcessedServiceData[]> {
  console.log(`Processing Excel file from storage: ${bucketName}/${filePath}`);
  
  try {
    // Download the file from storage
    const blob = await storageService.downloadFile(bucketName, filePath);
    if (!blob) {
      throw new Error(`Failed to download file: ${filePath}`);
    }

    // For now, return mock data - in a real implementation, you would parse the Excel file
    const mockData: ProcessedServiceData[] = [
      {
        sectorName: "Automotive Services",
        categories: [
          {
            name: "Engine Services",
            subcategories: [
              {
                name: "Oil Change",
                jobs: [
                  { name: "Standard Oil Change", description: "Change engine oil and filter", estimatedTime: 30, price: 35 },
                  { name: "Synthetic Oil Change", description: "Premium synthetic oil change", estimatedTime: 30, price: 65 }
                ]
              }
            ]
          }
        ]
      }
    ];

    return mockData;
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw error;
  }
}

export async function clearAllServiceData(): Promise<void> {
  console.log('Clearing all service data...');
  
  try {
    // Clear in reverse order to respect foreign key constraints
    const { error: jobsError } = await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (jobsError) throw jobsError;

    const { error: subcategoriesError } = await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (subcategoriesError) throw subcategoriesError;

    const { error: categoriesError } = await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (categoriesError) throw categoriesError;

    const { error: sectorsError } = await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (sectorsError) throw sectorsError;

    console.log('All service data cleared successfully');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
}

export async function getServiceCounts(): Promise<{ sectors: number; categories: number; subcategories: number; jobs: number }> {
  try {
    const [sectorsResult, categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
      supabase.from('service_sectors').select('id', { count: 'exact', head: true }),
      supabase.from('service_categories').select('id', { count: 'exact', head: true }),
      supabase.from('service_subcategories').select('id', { count: 'exact', head: true }),
      supabase.from('service_jobs').select('id', { count: 'exact', head: true })
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
}

export async function importServicesFromStorage(
  progressCallback?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  const bucketName = 'service-imports'; // Fixed bucket name
  
  try {
    progressCallback?.({
      stage: 'initializing',
      message: 'Checking storage bucket...',
      progress: 0,
      completed: false,
      error: null
    });

    // Check if bucket exists and get files
    const bucketExists = await storageService.checkBucketExists(bucketName);
    if (!bucketExists) {
      throw new Error(`Storage bucket '${bucketName}' not found. Please upload service data files first.`);
    }

    const bucketInfo = await storageService.getBucketInfo(bucketName);
    const files = bucketInfo.files || [];
    
    if (files.length === 0) {
      throw new Error('No files found in the service imports bucket');
    }

    progressCallback?.({
      stage: 'processing',
      message: `Processing ${files.length} files...`,
      progress: 10,
      completed: false,
      error: null
    });

    // Process all files
    const allProcessedData: ProcessedServiceData[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        try {
          const fileData = await processExcelFileFromStorage(bucketName, file.path);
          allProcessedData.push(...fileData);
          
          progressCallback?.({
            stage: 'processing',
            message: `Processed file ${i + 1} of ${files.length}: ${file.name}`,
            progress: 10 + (i + 1) / files.length * 40,
            completed: false,
            error: null
          });
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
        }
      }
    }

    if (allProcessedData.length === 0) {
      throw new Error('No valid service data found in any files');
    }

    progressCallback?.({
      stage: 'importing',
      message: 'Importing data to database...',
      progress: 60,
      completed: false,
      error: null
    });

    // Import to database
    const stats = await importProcessedDataToDatabase(allProcessedData, progressCallback);

    progressCallback?.({
      stage: 'complete',
      message: 'Import completed successfully!',
      progress: 100,
      completed: true,
      error: null
    });

    return {
      success: true,
      message: `Successfully imported ${stats.sectorsCreated} sectors, ${stats.categoriesCreated} categories, ${stats.subcategoriesCreated} subcategories, and ${stats.jobsCreated} jobs`,
      stats
    };

  } catch (error) {
    console.error('Import failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    progressCallback?.({
      stage: 'error',
      message: errorMessage,
      progress: 0,
      completed: false,
      error: errorMessage
    });

    return {
      success: false,
      message: errorMessage
    };
  }
}

export async function importProcessedDataToDatabase(
  data: ProcessedServiceData[],
  progressCallback?: (progress: ImportProgress) => void
): Promise<ImportStats> {
  const stats: ImportStats = {
    sectorsCreated: 0,
    categoriesCreated: 0,
    subcategoriesCreated: 0,
    jobsCreated: 0
  };

  try {
    for (const sectorData of data) {
      // Insert sector
      const { data: sector, error: sectorError } = await supabase
        .from('service_sectors')
        .insert({
          name: sectorData.sectorName,
          description: `Imported sector: ${sectorData.sectorName}`,
          position: stats.sectorsCreated + 1
        })
        .select()
        .single();

      if (sectorError) throw sectorError;
      stats.sectorsCreated++;

      // Insert categories
      for (const categoryData of sectorData.categories) {
        const { data: category, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            sector_id: sector.id,
            name: categoryData.name,
            description: `Imported category: ${categoryData.name}`,
            position: stats.categoriesCreated + 1
          })
          .select()
          .single();

        if (categoryError) throw categoryError;
        stats.categoriesCreated++;

        // Insert subcategories
        for (const subcategoryData of categoryData.subcategories) {
          const { data: subcategory, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert({
              category_id: category.id,
              name: subcategoryData.name,
              description: `Imported subcategory: ${subcategoryData.name}`
            })
            .select()
            .single();

          if (subcategoryError) throw subcategoryError;
          stats.subcategoriesCreated++;

          // Insert jobs
          for (const jobData of subcategoryData.jobs) {
            const { error: jobError } = await supabase
              .from('service_jobs')
              .insert({
                subcategory_id: subcategory.id,
                name: jobData.name,
                description: jobData.description,
                estimated_time: jobData.estimatedTime,
                price: jobData.price
              });

            if (jobError) throw jobError;
            stats.jobsCreated++;
          }
        }
      }

      // Update progress
      const progress = ((stats.sectorsCreated / data.length) * 40) + 60;
      progressCallback?.({
        stage: 'importing',
        message: `Imported sector: ${sectorData.sectorName}`,
        progress,
        completed: false,
        error: null
      });
    }

    return stats;
  } catch (error) {
    console.error('Error importing data to database:', error);
    throw error;
  }
}

export async function validateServiceData(data: ProcessedServiceData[]): Promise<string[]> {
  const errors: string[] = [];
  
  for (const sectorData of data) {
    if (!sectorData.sectorName || sectorData.sectorName.trim() === '') {
      errors.push('Sector name is required');
    }
    
    for (const category of sectorData.categories) {
      if (!category.name || category.name.trim() === '') {
        errors.push(`Category name is required in sector: ${sectorData.sectorName}`);
      }
      
      for (const subcategory of category.subcategories) {
        if (!subcategory.name || subcategory.name.trim() === '') {
          errors.push(`Subcategory name is required in category: ${category.name}`);
        }
        
        for (const job of subcategory.jobs) {
          if (!job.name || job.name.trim() === '') {
            errors.push(`Job name is required in subcategory: ${subcategory.name}`);
          }
        }
      }
    }
  }
  
  return errors;
}
