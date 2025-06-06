
import { supabase } from '@/integrations/supabase/client';
import { importFromStorage } from './storageImportService';

export interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
  error?: string;
  completed?: boolean;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
}

export interface ServiceCounts {
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
}

export const getServiceCounts = async (): Promise<ServiceCounts> => {
  try {
    const [sectorsResult, categoriesResult, subcategoriesResult, servicesResult] = await Promise.all([
      supabase.from('service_sectors').select('id', { count: 'exact', head: true }),
      supabase.from('service_categories').select('id', { count: 'exact', head: true }),
      supabase.from('service_subcategories').select('id', { count: 'exact', head: true }),
      supabase.from('service_jobs').select('id', { count: 'exact', head: true })
    ]);

    return {
      sectors: sectorsResult.count || 0,
      categories: categoriesResult.count || 0,
      subcategories: subcategoriesResult.count || 0,
      services: servicesResult.count || 0
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

export const clearAllServiceData = async (): Promise<void> => {
  try {
    // Delete in reverse order due to foreign key constraints
    await supabase.from('service_jobs').delete().neq('id', '');
    await supabase.from('service_subcategories').delete().neq('id', '');
    await supabase.from('service_categories').delete().neq('id', '');
    await supabase.from('service_sectors').delete().neq('id', '');
    
    console.log('All service data cleared successfully');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
};

export const importServicesFromStorage = async (
  bucketName: string,
  fileName: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  try {
    if (onProgress) {
      onProgress({
        stage: 'starting',
        progress: 5,
        message: 'Starting import process...'
      });
    }

    // Import the Excel data from storage
    const sheetsData = await importFromStorage(bucketName, fileName, onProgress);

    if (onProgress) {
      onProgress({
        stage: 'processing',
        progress: 70,
        message: 'Processing service hierarchy...'
      });
    }

    let totalImported = 0;
    let sectorCount = 0;
    let categoryCount = 0;
    let subcategoryCount = 0;
    let serviceCount = 0;
    const errors: string[] = [];

    // Process each sheet as a sector
    for (const sheetData of sheetsData) {
      try {
        // Create sector
        const { data: sector, error: sectorError } = await supabase
          .from('service_sectors')
          .insert({ name: sheetData.sheetName, description: `Imported from ${fileName}` })
          .select()
          .single();

        if (sectorError) {
          errors.push(`Failed to create sector ${sheetData.sheetName}: ${sectorError.message}`);
          continue;
        }

        sectorCount++;

        // Process the hierarchical data
        const rows = sheetData.data;
        if (rows.length === 0) continue;

        // Skip header row and process data
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          try {
            const categoryName = row[0]?.toString().trim();
            const subcategoryName = row[1]?.toString().trim();
            const serviceName = row[2]?.toString().trim();

            if (!categoryName) continue;

            // Create or get category
            let category;
            const { data: existingCategory } = await supabase
              .from('service_categories')
              .select('*')
              .eq('name', categoryName)
              .eq('sector_id', sector.id)
              .single();

            if (existingCategory) {
              category = existingCategory;
            } else {
              const { data: newCategory, error: categoryError } = await supabase
                .from('service_categories')
                .insert({
                  name: categoryName,
                  sector_id: sector.id,
                  description: `Category from ${fileName}`
                })
                .select()
                .single();

              if (categoryError) {
                errors.push(`Failed to create category ${categoryName}: ${categoryError.message}`);
                continue;
              }
              category = newCategory;
              categoryCount++;
            }

            if (!subcategoryName) continue;

            // Create or get subcategory
            let subcategory;
            const { data: existingSubcategory } = await supabase
              .from('service_subcategories')
              .select('*')
              .eq('name', subcategoryName)
              .eq('category_id', category.id)
              .single();

            if (existingSubcategory) {
              subcategory = existingSubcategory;
            } else {
              const { data: newSubcategory, error: subcategoryError } = await supabase
                .from('service_subcategories')
                .insert({
                  name: subcategoryName,
                  category_id: category.id,
                  description: `Subcategory from ${fileName}`
                })
                .select()
                .single();

              if (subcategoryError) {
                errors.push(`Failed to create subcategory ${subcategoryName}: ${subcategoryError.message}`);
                continue;
              }
              subcategory = newSubcategory;
              subcategoryCount++;
            }

            if (!serviceName) continue;

            // Create service
            const { error: serviceError } = await supabase
              .from('service_jobs')
              .insert({
                name: serviceName,
                subcategory_id: subcategory.id,
                description: `Service from ${fileName}`,
                estimated_duration: 60, // Default 1 hour
                base_price: 0 // Default price
              });

            if (serviceError) {
              errors.push(`Failed to create service ${serviceName}: ${serviceError.message}`);
              continue;
            }

            serviceCount++;
            totalImported++;

          } catch (rowError) {
            errors.push(`Error processing row ${i}: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`);
          }
        }

      } catch (sheetError) {
        errors.push(`Error processing sheet ${sheetData.sheetName}: ${sheetError instanceof Error ? sheetError.message : 'Unknown error'}`);
      }
    }

    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: `Import completed! Imported ${totalImported} services across ${sectorCount} sectors.`,
        completed: true
      });
    }

    return {
      success: errors.length === 0,
      imported: totalImported,
      errors,
      sectors: sectorCount,
      categories: categoryCount,
      subcategories: subcategoryCount,
      services: serviceCount
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (onProgress) {
      onProgress({
        stage: 'error',
        progress: 0,
        message: `Import failed: ${errorMessage}`,
        error: errorMessage
      });
    }

    return {
      success: false,
      imported: 0,
      errors: [errorMessage],
      sectors: 0,
      categories: 0,
      subcategories: 0,
      services: 0
    };
  }
};
