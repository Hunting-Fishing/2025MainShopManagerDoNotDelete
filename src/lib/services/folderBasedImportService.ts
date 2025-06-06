
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

export interface ProcessedServiceData {
  sector: string;
  category: string;
  subcategory: string;
  serviceName: string;
  description?: string;
  estimatedTime?: number;
  price?: number;
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
  totalSectors: number;
  totalCategories: number;
  totalSubcategories: number;
  totalServices: number;
  filesProcessed: number;
}

const BUCKET_NAME = 'service-data';

export async function importServicesFromStorage(
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  try {
    onProgress?.({
      stage: 'starting',
      message: 'Starting service import from storage...',
      progress: 0,
      completed: false,
      error: null
    });

    // Get all folders (sectors) from the bucket
    const { data: folders, error: foldersError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 100,
        offset: 0
      });

    if (foldersError) {
      throw new Error(`Failed to list folders: ${foldersError.message}`);
    }

    if (!folders || folders.length === 0) {
      throw new Error('No folders found in the service-data bucket');
    }

    onProgress?.({
      stage: 'folders-found',
      message: `Found ${folders.length} sector folders`,
      progress: 10,
      completed: false,
      error: null
    });

    let allServiceData: ProcessedServiceData[] = [];
    let filesProcessed = 0;
    const totalFolders = folders.length;

    // Clear existing service data first
    await clearAllServiceData();

    // Process each folder (sector)
    for (let i = 0; i < folders.length; i++) {
      const folder = folders[i];
      
      if (!folder.name || folder.name === '.emptyFolderPlaceholder') {
        continue;
      }

      onProgress?.({
        stage: 'processing-sector',
        message: `Processing sector: ${folder.name}`,
        progress: 10 + (i / totalFolders) * 60,
        completed: false,
        error: null
      });

      // Get Excel files in this folder
      const { data: files, error: filesError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(folder.name, {
          limit: 100,
          offset: 0
        });

      if (filesError) {
        console.warn(`Failed to list files in folder ${folder.name}:`, filesError);
        continue;
      }

      if (!files || files.length === 0) {
        console.warn(`No files found in folder ${folder.name}`);
        continue;
      }

      // Process Excel files in this folder
      for (const file of files) {
        if (!file.name.toLowerCase().endsWith('.xlsx')) {
          continue;
        }

        try {
          const filePath = `${folder.name}/${file.name}`;
          
          onProgress?.({
            stage: 'processing-file',
            message: `Processing file: ${file.name}`,
            progress: 10 + (i / totalFolders) * 60 + (filesProcessed / (totalFolders * 5)) * 10,
            completed: false,
            error: null
          });

          const fileData = await processExcelFileFromStorage(BUCKET_NAME, filePath, folder.name);
          allServiceData.push(...fileData);
          filesProcessed++;

        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          // Continue with other files instead of failing completely
        }
      }
    }

    onProgress?.({
      stage: 'saving-to-database',
      message: 'Saving processed data to database...',
      progress: 80,
      completed: false,
      error: null
    });

    // Save all data to database
    await importProcessedDataToDatabase(allServiceData, onProgress);

    const stats = await getServiceCounts();

    onProgress?.({
      stage: 'complete',
      message: `Import completed successfully! Processed ${filesProcessed} files.`,
      progress: 100,
      completed: true,
      error: null
    });

    return {
      success: true,
      message: `Successfully imported ${stats.totalServices} services from ${filesProcessed} files`,
      stats: {
        ...stats,
        filesProcessed
      }
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    onProgress?.({
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

export async function processExcelFileFromStorage(
  bucketName: string, 
  filePath: string, 
  sectorName: string
): Promise<ProcessedServiceData[]> {
  try {
    // Download the file from storage
    const { data: fileData, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      throw new Error(`Failed to download file ${filePath}: ${error.message}`);
    }

    if (!fileData) {
      throw new Error(`No data received for file ${filePath}`);
    }

    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Parse Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error(`No sheets found in Excel file ${filePath}`);
    }

    const services: ProcessedServiceData[] = [];

    // Process each sheet in the workbook
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!jsonData || jsonData.length < 2) {
        console.warn(`Sheet ${sheetName} in ${filePath} has no data or insufficient rows`);
        continue;
      }

      // Skip header row and process data rows
      const dataRows = jsonData.slice(1) as any[][];

      for (const row of dataRows) {
        if (!row || row.length < 3) continue;

        // Map columns to service data
        // Assuming columns: Category, Subcategory, Service Name, Description, Estimated Time, Price
        const [category, subcategory, serviceName, description, estimatedTime, price] = row;

        if (!category || !subcategory || !serviceName) {
          continue; // Skip rows with missing essential data
        }

        services.push({
          sector: sectorName,
          category: String(category).trim(),
          subcategory: String(subcategory).trim(),
          serviceName: String(serviceName).trim(),
          description: description ? String(description).trim() : undefined,
          estimatedTime: estimatedTime && !isNaN(Number(estimatedTime)) ? Number(estimatedTime) : undefined,
          price: price && !isNaN(Number(price)) ? Number(price) : undefined
        });
      }
    }

    console.log(`Processed ${services.length} services from file ${filePath}`);
    return services;

  } catch (error) {
    console.error(`Error processing Excel file ${filePath}:`, error);
    throw error;
  }
}

export async function importProcessedDataToDatabase(
  serviceData: ProcessedServiceData[],
  onProgress?: (progress: ImportProgress) => void
): Promise<void> {
  if (!serviceData || serviceData.length === 0) {
    throw new Error('No service data to import');
  }

  try {
    // Group data by hierarchy for efficient insertion
    const sectorsMap = new Map<string, Map<string, Map<string, ProcessedServiceData[]>>>();
    
    for (const service of serviceData) {
      if (!sectorsMap.has(service.sector)) {
        sectorsMap.set(service.sector, new Map());
      }
      
      const sectorMap = sectorsMap.get(service.sector)!;
      if (!sectorMap.has(service.category)) {
        sectorMap.set(service.category, new Map());
      }
      
      const categoryMap = sectorMap.get(service.category)!;
      if (!categoryMap.has(service.subcategory)) {
        categoryMap.set(service.subcategory, []);
      }
      
      categoryMap.get(service.subcategory)!.push(service);
    }

    let progress = 80;
    const totalSectors = sectorsMap.size;
    let processedSectors = 0;

    // Insert sectors, categories, subcategories, and jobs
    for (const [sectorName, categories] of sectorsMap) {
      onProgress?.({
        stage: 'inserting-sector',
        message: `Inserting sector: ${sectorName}`,
        progress: progress + (processedSectors / totalSectors) * 15,
        completed: false,
        error: null
      });

      // Insert sector
      const { data: sectorData, error: sectorError } = await supabase
        .rpc('insert_service_sector', {
          p_name: sectorName,
          p_description: `${sectorName} services`,
          p_position: processedSectors + 1
        });

      if (sectorError) {
        throw new Error(`Failed to insert sector ${sectorName}: ${sectorError.message}`);
      }

      const sectorId = sectorData;

      // Insert categories for this sector
      let categoryPosition = 1;
      for (const [categoryName, subcategories] of categories) {
        const { data: categoryData, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            name: categoryName,
            description: `${categoryName} services`,
            position: categoryPosition++,
            sector_id: sectorId
          })
          .select('id')
          .single();

        if (categoryError) {
          throw new Error(`Failed to insert category ${categoryName}: ${categoryError.message}`);
        }

        const categoryId = categoryData.id;

        // Insert subcategories for this category
        for (const [subcategoryName, services] of subcategories) {
          const { data: subcategoryData, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert({
              name: subcategoryName,
              description: `${subcategoryName} services`,
              category_id: categoryId
            })
            .select('id')
            .single();

          if (subcategoryError) {
            throw new Error(`Failed to insert subcategory ${subcategoryName}: ${subcategoryError.message}`);
          }

          const subcategoryId = subcategoryData.id;

          // Insert services (jobs) for this subcategory
          const jobsToInsert = services.map(service => ({
            name: service.serviceName,
            description: service.description,
            estimated_time: service.estimatedTime,
            price: service.price,
            subcategory_id: subcategoryId
          }));

          if (jobsToInsert.length > 0) {
            const { error: jobsError } = await supabase
              .from('service_jobs')
              .insert(jobsToInsert);

            if (jobsError) {
              throw new Error(`Failed to insert jobs for ${subcategoryName}: ${jobsError.message}`);
            }
          }
        }
      }

      processedSectors++;
    }

    onProgress?.({
      stage: 'database-complete',
      message: 'Database import completed successfully',
      progress: 95,
      completed: false,
      error: null
    });

  } catch (error) {
    console.error('Error importing data to database:', error);
    throw error;
  }
}

export function validateServiceData(data: ProcessedServiceData[]): boolean {
  if (!Array.isArray(data) || data.length === 0) {
    return false;
  }

  return data.every(item => 
    item.sector && 
    item.category && 
    item.subcategory && 
    item.serviceName &&
    typeof item.sector === 'string' &&
    typeof item.category === 'string' &&
    typeof item.subcategory === 'string' &&
    typeof item.serviceName === 'string'
  );
}

export async function clearAllServiceData(): Promise<void> {
  try {
    // Use the database function to clear all service data
    const { error } = await supabase.rpc('clear_service_data');
    
    if (error) {
      throw new Error(`Failed to clear service data: ${error.message}`);
    }

    console.log('All service data cleared successfully');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
}

export async function getServiceCounts(): Promise<ImportStats> {
  try {
    const [sectorsResponse, categoriesResponse, subcategoriesResponse, jobsResponse] = await Promise.all([
      supabase.from('service_sectors').select('id', { count: 'exact', head: true }),
      supabase.from('service_categories').select('id', { count: 'exact', head: true }),
      supabase.from('service_subcategories').select('id', { count: 'exact', head: true }),
      supabase.from('service_jobs').select('id', { count: 'exact', head: true })
    ]);

    return {
      totalSectors: sectorsResponse.count || 0,
      totalCategories: categoriesResponse.count || 0,
      totalSubcategories: subcategoriesResponse.count || 0,
      totalServices: jobsResponse.count || 0,
      filesProcessed: 0
    };
  } catch (error) {
    console.error('Error getting service counts:', error);
    return {
      totalSectors: 0,
      totalCategories: 0,
      totalSubcategories: 0,
      totalServices: 0,
      filesProcessed: 0
    };
  }
}
