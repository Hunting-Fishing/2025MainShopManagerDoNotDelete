import { supabase } from '@/integrations/supabase/client';
import { processExcelFileFromStorage } from './excelProcessor';
import { ServiceSector, ImportProgress, ProcessedServiceData } from '@/types/service';
import { clearAllServiceData } from './databaseOperations';

export const processServiceDataFromSheets = async (
  sectorName: string,
  excelFiles: any[],
  importOptions: { mode: 'skip' | 'update', clearExisting?: boolean },
  setImportProgress: (progress: ImportProgress) => void
): Promise<ProcessedServiceData> => {
  try {
    console.log(`Processing service data from sheets for sector: ${sectorName}`);

    let sectors: ServiceSector[] = [];
    let totalCategories = 0;
    let totalSubcategories = 0;
    let totalServices = 0;

    // Clear existing data if requested
    if (importOptions.clearExisting) {
      setImportProgress({
        stage: 'clearing',
        message: 'Clearing existing service data...',
        progress: 10,
        completed: false,
        error: null
      });
      await clearAllServiceData();
    }

    for (let i = 0; i < excelFiles.length; i++) {
      const file = excelFiles[i];
      setImportProgress({
        stage: 'processing',
        message: `Processing file ${i + 1} of ${excelFiles.length}: ${file.name}`,
        progress: 10 + (i / excelFiles.length) * 80,
        completed: false,
        error: null
      });

      const { sectors: fileSectors, stats } = await processExcelFileFromStorage(sectorName, file);
      sectors = [...sectors, ...fileSectors];
      totalCategories += stats.totalCategories;
      totalSubcategories += stats.totalSubcategories;
      totalServices += stats.totalServices;
    }

    setImportProgress({
      stage: 'complete',
      message: 'Data processing complete. Preparing to import...',
      progress: 95,
      completed: false,
      error: null
    });

    return {
      sectors,
      stats: {
        totalSectors: 1,
        totalCategories,
        totalSubcategories,
        totalServices,
        filesProcessed: excelFiles.length
      },
      sectorName
    };
  } catch (error: any) {
    console.error('Error processing service data:', error);
    setImportProgress({
      stage: 'error',
      message: error.message || 'Failed to process service data',
      progress: 0,
      completed: false,
      error: error.message
    });
    throw error;
  }
};

export const importProcessedDataToDatabase = async (
  processedData: ProcessedServiceData,
  importOptions: { mode: 'skip' | 'update' },
  setImportProgress: (progress: ImportProgress) => void
): Promise<void> => {
  if (!processedData || !processedData.sectors || processedData.sectors.length === 0) {
    console.warn('No data to import.');
    return;
  }

  try {
    const { sectors } = processedData;

    for (const sector of sectors) {
      setImportProgress({
        stage: 'importing',
        message: `Importing sector: ${sector.name}`,
        progress: 95,
        completed: false,
        error: null
      });

      for (const category of sector.categories) {
        for (const subcategory of category.subcategories) {
          for (const job of subcategory.jobs) {
            // Upsert service job
            const { data: existingJob, error: jobError } = await supabase
              .from('service_jobs')
              .select('*')
              .eq('id', job.id)
              .single();

            if (jobError && jobError.code !== '404') {
              console.error('Error checking existing job:', jobError);
              throw jobError;
            }

            if (!existingJob || importOptions.mode === 'update') {
              const { error: upsertError } = await supabase
                .from('service_jobs')
                .upsert({
                  id: job.id,
                  name: job.name,
                  description: job.description,
                  estimatedTime: job.estimatedTime,
                  price: job.price,
                  subcategory_id: subcategory.id
                }, { onConflict: 'id' });

              if (upsertError) {
                console.error('Error upserting service job:', upsertError);
                throw upsertError;
              }
            }

            // Upsert service subcategory
            const { data: existingSubcategory, error: subcategoryError } = await supabase
              .from('service_subcategories')
              .select('*')
              .eq('id', subcategory.id)
              .single();

            if (subcategoryError && subcategoryError.code !== '404') {
              console.error('Error checking existing subcategory:', subcategoryError);
              throw subcategoryError;
            }

            if (!existingSubcategory || importOptions.mode === 'update') {
              const { error: upsertSubcategoryError } = await supabase
                .from('service_subcategories')
                .upsert({
                  id: subcategory.id,
                  name: subcategory.name,
                  description: subcategory.description,
                  category_id: category.id
                }, { onConflict: 'id' });

              if (upsertSubcategoryError) {
                console.error('Error upserting service subcategory:', upsertSubcategoryError);
                throw upsertSubcategoryError;
              }
            }

            // Upsert service main category
            const { data: existingCategory, error: categoryError } = await supabase
              .from('service_main_categories')
              .select('*')
              .eq('id', category.id)
              .single();

            if (categoryError && categoryError.code !== '404') {
              console.error('Error checking existing category:', categoryError);
              throw categoryError;
            }

            if (!existingCategory || importOptions.mode === 'update') {
              const { error: upsertCategoryError } = await supabase
                .from('service_main_categories')
                .upsert({
                  id: category.id,
                  name: category.name,
                  description: category.description,
                  position: category.position,
                  sector_id: sector.id
                }, { onConflict: 'id' });

              if (upsertCategoryError) {
                console.error('Error upserting service main category:', upsertCategoryError);
                throw upsertCategoryError;
              }
            }

            // Upsert service sector
            const { data: existingSector, error: sectorError } = await supabase
              .from('service_sectors')
              .select('*')
              .eq('id', sector.id)
              .single();

            if (sectorError && sectorError.code !== '404') {
              console.error('Error checking existing sector:', sectorError);
              throw sectorError;
            }

            if (!existingSector || importOptions.mode === 'update') {
              const { error: upsertSectorError } = await supabase
                .from('service_sectors')
                .upsert({
                  id: sector.id,
                  name: sector.name,
                  description: sector.description,
                  position: sector.position,
                  is_active: sector.is_active
                }, { onConflict: 'id' });

              if (upsertSectorError) {
                console.error('Error upserting service sector:', upsertSectorError);
                throw upsertSectorError;
              }
            }
          }
        }
      }
    }

    setImportProgress({
      stage: 'complete',
      message: 'Service data import completed successfully!',
      progress: 100,
      completed: true,
      error: null
    });
  } catch (error: any) {
    console.error('Error importing processed data to database:', error);
    setImportProgress({
      stage: 'error',
      message: error.message || 'Failed to import service data',
      progress: 0,
      completed: false,
      error: error.message
    });
    throw error;
  }
};

export const validateServiceData = async (): Promise<boolean> => {
  try {
    // Implement data validation logic here
    // Example: Check for missing or invalid data in the database
    return true;
  } catch (error) {
    console.error('Error validating service data:', error);
    return false;
  }
};

export const optimizeDatabasePerformance = async (): Promise<void> => {
  try {
    // Implement database optimization logic here
    // Example: Create indexes, optimize queries, etc.
  } catch (error) {
    console.error('Error optimizing database performance:', error);
  }
};
