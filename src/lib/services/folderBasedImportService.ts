
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { getAllSectorFiles } from './storageUtils';

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
  totalSubcategories: number;
  totalServices: number;
  processedFiles: number;
}

export interface ImportResult {
  success: boolean;
  stats: ImportStats;
  message: string;
}

export interface ProcessedServiceData {
  sectorName: string;
  categories: Array<{
    name: string;
    description?: string;
    subcategories: Array<{
      name: string;
      description?: string;
      services: Array<{
        name: string;
        description?: string;
        estimatedTime?: number;
        price?: number;
      }>;
    }>;
  }>;
}

/**
 * Import services from storage bucket with folder structure
 */
export async function importServicesFromStorage(
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  const updateProgress = (stage: string, message: string, progress: number, error: string | null = null) => {
    onProgress?.({
      stage,
      message,
      progress,
      completed: false,
      error
    });
  };

  try {
    updateProgress('initializing', 'Starting import process...', 0);

    // Get all sector files from storage
    const sectorFiles = await getAllSectorFiles('service-imports');
    const sectorNames = Object.keys(sectorFiles);
    
    if (sectorNames.length === 0) {
      throw new Error('No sector folders with Excel files found in storage');
    }

    updateProgress('loading', `Found ${sectorNames.length} sectors, loading files...`, 10);

    const processedData: ProcessedServiceData[] = [];
    let processedFiles = 0;
    const totalFiles = Object.values(sectorFiles).reduce((total, files) => total + files.length, 0);

    // Process each sector
    for (const sectorName of sectorNames) {
      const files = sectorFiles[sectorName];
      
      updateProgress('processing', `Processing sector: ${sectorName}`, 10 + (processedFiles / totalFiles) * 60);

      const sectorData: ProcessedServiceData = {
        sectorName,
        categories: []
      };

      // Process each Excel file in the sector
      for (const file of files) {
        try {
          // Download the file from storage
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('service-imports')
            .download(file.path);

          if (downloadError) {
            console.error(`Error downloading file ${file.path}:`, downloadError);
            continue;
          }

          // Parse Excel file
          const arrayBuffer = await fileData.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          
          // Process each sheet as a category
          for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
            
            if (data.length < 2) continue; // Skip empty sheets
            
            const categoryData = {
              name: sheetName,
              description: `Services from ${file.name}`,
              subcategories: [] as any[]
            };

            // Group data by subcategory
            const subcategoryMap = new Map<string, any[]>();
            
            for (let i = 1; i < data.length; i++) {
              const row = data[i];
              if (!row || row.length < 2) continue;
              
              const subcategoryName = row[1] || 'General';
              const serviceName = row[2] || row[0];
              const description = row[3] || '';
              const estimatedTime = row[4] ? parseInt(row[4]) : undefined;
              const price = row[5] ? parseFloat(row[5]) : undefined;
              
              if (!serviceName) continue;
              
              if (!subcategoryMap.has(subcategoryName)) {
                subcategoryMap.set(subcategoryName, []);
              }
              
              subcategoryMap.get(subcategoryName)!.push({
                name: serviceName,
                description,
                estimatedTime,
                price
              });
            }

            // Convert map to subcategories array
            for (const [subcategoryName, services] of subcategoryMap.entries()) {
              categoryData.subcategories.push({
                name: subcategoryName,
                description: `${subcategoryName} services`,
                services
              });
            }

            if (categoryData.subcategories.length > 0) {
              sectorData.categories.push(categoryData);
            }
          }

          processedFiles++;
        } catch (fileError) {
          console.error(`Error processing file ${file.path}:`, fileError);
          continue;
        }
      }

      if (sectorData.categories.length > 0) {
        processedData.push(sectorData);
      }
    }

    updateProgress('importing', 'Saving data to database...', 70);

    // Clear existing service data
    await clearAllServiceData();

    // Import processed data to database
    const stats = await importProcessedDataToDatabase(processedData, updateProgress);

    updateProgress('complete', 'Import completed successfully!', 100);

    return {
      success: true,
      stats,
      message: `Successfully imported ${stats.totalServices} services across ${stats.totalSectors} sectors`
    };

  } catch (error) {
    console.error('Import failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    updateProgress('error', errorMessage, 0, errorMessage);
    
    return {
      success: false,
      stats: {
        totalSectors: 0,
        totalCategories: 0,
        totalSubcategories: 0,
        totalServices: 0,
        processedFiles: 0
      },
      message: errorMessage
    };
  }
}

async function clearAllServiceData(): Promise<void> {
  const { error } = await supabase.rpc('clear_service_data');
  if (error) {
    throw new Error(`Failed to clear existing service data: ${error.message}`);
  }
}

async function importProcessedDataToDatabase(
  processedData: ProcessedServiceData[],
  updateProgress?: (stage: string, message: string, progress: number) => void
): Promise<ImportStats> {
  const stats: ImportStats = {
    totalSectors: 0,
    totalCategories: 0,
    totalSubcategories: 0,
    totalServices: 0,
    processedFiles: 0
  };

  let progress = 70;
  const progressIncrement = 25 / processedData.length;

  for (const sectorData of processedData) {
    updateProgress?.('importing', `Importing sector: ${sectorData.sectorName}`, progress);
    
    // Insert sector
    const { data: sector, error: sectorError } = await supabase.rpc('insert_service_sector', {
      p_name: sectorData.sectorName,
      p_description: `${sectorData.sectorName} sector services`,
      p_position: stats.totalSectors + 1
    });

    if (sectorError) {
      console.error('Error inserting sector:', sectorError);
      continue;
    }

    stats.totalSectors++;

    // Process categories
    for (const categoryData of sectorData.categories) {
      const { data: category, error: categoryError } = await supabase.rpc('insert_service_category', {
        p_name: categoryData.name,
        p_description: categoryData.description,
        p_position: stats.totalCategories + 1
      });

      if (categoryError) {
        console.error('Error inserting category:', categoryError);
        continue;
      }

      // Link category to sector
      await supabase
        .from('service_categories')
        .update({ sector_id: sector })
        .eq('id', category);

      stats.totalCategories++;

      // Process subcategories
      for (const subcategoryData of categoryData.subcategories) {
        const { data: subcategory, error: subcategoryError } = await supabase.rpc('insert_service_subcategory', {
          p_category_id: category,
          p_name: subcategoryData.name,
          p_description: subcategoryData.description
        });

        if (subcategoryError) {
          console.error('Error inserting subcategory:', subcategoryError);
          continue;
        }

        stats.totalSubcategories++;

        // Process services
        for (const serviceData of subcategoryData.services) {
          const { error: serviceError } = await supabase.rpc('insert_service_job', {
            p_subcategory_id: subcategory,
            p_name: serviceData.name,
            p_description: serviceData.description,
            p_estimated_time: serviceData.estimatedTime,
            p_price: serviceData.price
          });

          if (serviceError) {
            console.error('Error inserting service:', serviceError);
            continue;
          }

          stats.totalServices++;
        }
      }
    }

    progress += progressIncrement;
  }

  return stats;
}

// Legacy exports for compatibility
export const processExcelFileFromStorage = importServicesFromStorage;
export const getServiceCounts = async () => ({ sectors: 0, categories: 0, services: 0 });
