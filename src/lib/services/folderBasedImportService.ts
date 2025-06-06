
import { supabase } from '@/integrations/supabase/client';
import { storageService, type SectorFiles } from './unifiedStorageService';

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
  filesProcessed: number;
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats?: ImportStats;
  error?: string;
}

// Helper function to get total files count from SectorFiles object
function getTotalFilesCount(sectorFiles: SectorFiles): number {
  return Object.values(sectorFiles).reduce((total, files) => total + files.length, 0);
}

// Helper function to get all files from SectorFiles object
function getAllFiles(sectorFiles: SectorFiles): Array<{ sectorName: string; files: any[] }> {
  return Object.entries(sectorFiles).map(([sectorName, files]) => ({
    sectorName,
    files
  }));
}

export async function importServicesFromStorage(
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  try {
    // Get all sector files from storage
    const sectorFiles = await storageService.getAllSectorFiles('service-data');
    const totalFiles = getTotalFilesCount(sectorFiles);
    const allSectorData = getAllFiles(sectorFiles);
    let filesProcessed = 0;

    onProgress?.({
      stage: 'discovery',
      message: `Found ${totalFiles} files across ${allSectorData.length} sectors`,
      progress: 10,
      completed: false,
      error: null
    });

    // Process each sector's files
    const processedData: ProcessedServiceData = {
      sectors: []
    };

    for (const { sectorName, files } of allSectorData) {
      onProgress?.({
        stage: 'processing',
        message: `Processing sector: ${sectorName}`,
        progress: 20 + (filesProcessed / totalFiles) * 60,
        completed: false,
        error: null
      });

      const sectorData = {
        name: sectorName,
        description: `Service sector for ${sectorName}`,
        categories: [] as any[]
      };

      // Process each file in the sector
      for (const file of files) {
        try {
          const fileData = await processExcelFileFromStorage('service-data', file.path);
          if (fileData && fileData.categories) {
            sectorData.categories.push(...fileData.categories);
          }
          filesProcessed++;
        } catch (error) {
          console.error(`Error processing file ${file.path}:`, error);
        }
      }

      if (sectorData.categories.length > 0) {
        processedData.sectors.push(sectorData);
      }
    }

    // Import to database
    onProgress?.({
      stage: 'database',
      message: 'Importing data to database...',
      progress: 85,
      completed: false,
      error: null
    });

    await importProcessedDataToDatabase(processedData);

    // Calculate final stats
    const stats: ImportStats = {
      totalSectors: processedData.sectors.length,
      totalCategories: processedData.sectors.reduce((acc, sector) => acc + sector.categories.length, 0),
      totalSubcategories: processedData.sectors.reduce((acc, sector) => 
        acc + sector.categories.reduce((catAcc, category) => catAcc + (category.subcategories?.length || 0), 0), 0),
      totalServices: processedData.sectors.reduce((acc, sector) => 
        acc + sector.categories.reduce((catAcc, category) => 
          catAcc + (category.subcategories?.reduce((subAcc, subcategory) => 
            subAcc + (subcategory.jobs?.length || 0), 0) || 0), 0), 0),
      filesProcessed
    };

    return {
      success: true,
      message: `Successfully imported ${stats.totalServices} services from ${stats.totalSectors} sectors`,
      stats
    };

  } catch (error) {
    console.error('Import failed:', error);
    return {
      success: false,
      message: 'Import failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function processExcelFileFromStorage(bucketName: string, filePath: string) {
  try {
    console.log(`Processing Excel file from storage: ${filePath}`);
    
    // Download the file content
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      console.error('Error downloading file:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }

    if (!data) {
      throw new Error('No file data received');
    }

    // For now, return a mock structure since we need proper Excel parsing
    const fileName = filePath.split('/').pop() || '';
    const categoryName = fileName.replace('.xlsx', '').replace('.xls', '');
    
    return {
      categories: [{
        name: categoryName,
        description: `Category from ${fileName}`,
        subcategories: [{
          name: `${categoryName} Services`,
          description: `Services for ${categoryName}`,
          jobs: [{
            name: `${categoryName} Service`,
            description: `Standard ${categoryName} service`,
            estimatedTime: 60,
            price: 100
          }]
        }]
      }]
    };

  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw error;
  }
}

export async function validateServiceData(data: ProcessedServiceData): Promise<boolean> {
  try {
    // Basic validation
    if (!data || !data.sectors || !Array.isArray(data.sectors)) {
      throw new Error('Invalid data structure: missing sectors array');
    }

    if (data.sectors.length === 0) {
      throw new Error('No sectors found in data');
    }

    // Validate each sector
    for (const sector of data.sectors) {
      if (!sector.name || typeof sector.name !== 'string') {
        throw new Error('Invalid sector: missing or invalid name');
      }

      if (!sector.categories || !Array.isArray(sector.categories)) {
        throw new Error(`Invalid sector ${sector.name}: missing categories array`);
      }

      // Validate categories
      for (const category of sector.categories) {
        if (!category.name || typeof category.name !== 'string') {
          throw new Error(`Invalid category in sector ${sector.name}: missing name`);
        }

        if (category.subcategories && Array.isArray(category.subcategories)) {
          for (const subcategory of category.subcategories) {
            if (!subcategory.name || typeof subcategory.name !== 'string') {
              throw new Error(`Invalid subcategory in category ${category.name}: missing name`);
            }
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Validation failed:', error);
    return false;
  }
}

export async function importProcessedDataToDatabase(data: ProcessedServiceData): Promise<void> {
  try {
    // Clear existing data first
    await clearAllServiceData();

    // Import sectors
    for (const sectorData of data.sectors) {
      // Insert sector using the correct table name
      const { data: sector, error: sectorError } = await supabase
        .from('service_sectors')
        .insert({
          name: sectorData.name,
          description: sectorData.description || null
        })
        .select()
        .single();

      if (sectorError) {
        console.error('Error inserting sector:', sectorError);
        throw sectorError;
      }

      // Import categories for this sector
      for (const categoryData of sectorData.categories) {
        const { data: category, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            sector_id: sector.id,
            name: categoryData.name,
            description: categoryData.description || null
          })
          .select()
          .single();

        if (categoryError) {
          console.error('Error inserting category:', categoryError);
          throw categoryError;
        }

        // Import subcategories
        if (categoryData.subcategories && Array.isArray(categoryData.subcategories)) {
          for (const subcategoryData of categoryData.subcategories) {
            const { data: subcategory, error: subcategoryError } = await supabase
              .from('service_subcategories')
              .insert({
                category_id: category.id,
                name: subcategoryData.name,
                description: subcategoryData.description || null
              })
              .select()
              .single();

            if (subcategoryError) {
              console.error('Error inserting subcategory:', subcategoryError);
              throw subcategoryError;
            }

            // Import jobs
            if (subcategoryData.jobs && Array.isArray(subcategoryData.jobs)) {
              for (const jobData of subcategoryData.jobs) {
                const { error: jobError } = await supabase
                  .from('service_jobs')
                  .insert({
                    subcategory_id: subcategory.id,
                    name: jobData.name,
                    description: jobData.description || null,
                    estimated_time: jobData.estimatedTime || null,
                    price: jobData.price || null
                  });

                if (jobError) {
                  console.error('Error inserting job:', jobError);
                  throw jobError;
                }
              }
            }
          }
        }
      }
    }

    console.log('Successfully imported all service data to database');
  } catch (error) {
    console.error('Error importing data to database:', error);
    throw error;
  }
}

export async function clearAllServiceData(): Promise<void> {
  try {
    // Use the database function we created
    const { error } = await supabase.rpc('clear_service_data');
    
    if (error) {
      console.error('Error clearing service data:', error);
      throw error;
    }
    
    console.log('Successfully cleared all service data');
  } catch (error) {
    console.error('Error in clearAllServiceData:', error);
    throw error;
  }
}

export async function getServiceCounts(): Promise<ImportStats> {
  try {
    const [sectorsResult, categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
      supabase.from('service_sectors').select('id', { count: 'exact', head: true }),
      supabase.from('service_categories').select('id', { count: 'exact', head: true }),
      supabase.from('service_subcategories').select('id', { count: 'exact', head: true }),
      supabase.from('service_jobs').select('id', { count: 'exact', head: true })
    ]);

    return {
      totalSectors: sectorsResult.count || 0,
      totalCategories: categoriesResult.count || 0,
      totalSubcategories: subcategoriesResult.count || 0,
      totalServices: jobsResult.count || 0,
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
