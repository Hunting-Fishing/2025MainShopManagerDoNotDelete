
import { supabase } from '@/integrations/supabase/client';
import { importFromStorage } from './storageImportService';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
}

export const importServicesFromStorage = async (
  bucketName: string,
  filePath: string,
  onProgress?: (progress: any) => void
): Promise<ImportResult> => {
  try {
    if (onProgress) {
      onProgress({
        stage: 'download',
        progress: 0,
        message: 'Starting import...'
      });
    }

    // Import Excel data from storage
    const sheetsData = await importFromStorage(bucketName, filePath, onProgress);
    
    if (onProgress) {
      onProgress({
        stage: 'process',
        progress: 70,
        message: 'Processing service hierarchy...'
      });
    }

    let totalSectors = 0;
    let totalCategories = 0;
    let totalSubcategories = 0;
    let totalServices = 0;
    const errors: string[] = [];

    // Process each sheet as a potential sector
    for (const sheetData of sheetsData) {
      try {
        const sectorResult = await processServiceSector(sheetData);
        totalSectors += sectorResult.sectors;
        totalCategories += sectorResult.categories;
        totalSubcategories += sectorResult.subcategories;
        totalServices += sectorResult.services;
        
        if (sectorResult.errors.length > 0) {
          errors.push(...sectorResult.errors);
        }
      } catch (error) {
        console.error(`Error processing sheet ${sheetData.sheetName}:`, error);
        errors.push(`Failed to process sheet ${sheetData.sheetName}: ${error.message}`);
      }
    }

    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: `Import completed. ${totalSectors} sectors, ${totalCategories} categories, ${totalSubcategories} subcategories, ${totalServices} services processed.`,
        completed: true
      });
    }

    return {
      success: errors.length === 0,
      imported: totalServices,
      errors,
      sectors: totalSectors,
      categories: totalCategories,
      subcategories: totalSubcategories,
      services: totalServices
    };

  } catch (error) {
    console.error('Import failed:', error);
    return {
      success: false,
      imported: 0,
      errors: [error.message],
      sectors: 0,
      categories: 0,
      subcategories: 0,
      services: 0
    };
  }
};

const processServiceSector = async (sheetData: any): Promise<ImportResult> => {
  const { sheetName, data } = sheetData;
  
  if (!data || data.length === 0) {
    return {
      success: false,
      imported: 0,
      errors: [`Sheet ${sheetName} is empty`],
      sectors: 0,
      categories: 0,
      subcategories: 0,
      services: 0
    };
  }

  // Create or find the sector
  const { data: existingSector, error: sectorFindError } = await supabase
    .from('service_sectors')
    .select('id')
    .eq('name', sheetName)
    .maybeSingle();

  let sectorId: string;
  
  if (existingSector) {
    sectorId = existingSector.id;
  } else {
    const { data: newSector, error: sectorCreateError } = await supabase
      .from('service_sectors')
      .insert({
        name: sheetName,
        description: `Imported from ${sheetName}`,
        is_active: true
      })
      .select('id')
      .single();

    if (sectorCreateError) {
      throw new Error(`Failed to create sector ${sheetName}: ${sectorCreateError.message}`);
    }
    
    sectorId = newSector.id;
  }

  // Process the hierarchical data
  const headers = data[0] || [];
  const rows = data.slice(1);
  
  let categories = 0;
  let subcategories = 0;
  let services = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      if (row && row.length > 0 && row[0]) {
        // Process each row as category > subcategory > service
        const categoryName = row[0]?.toString().trim();
        const subcategoryName = row[1]?.toString().trim();
        const serviceName = row[2]?.toString().trim();

        if (categoryName) {
          const categoryResult = await processCategory(sectorId, categoryName, subcategoryName, serviceName);
          categories += categoryResult.categories;
          subcategories += categoryResult.subcategories;
          services += categoryResult.services;
        }
      }
    } catch (error) {
      errors.push(`Error processing row: ${error.message}`);
    }
  }

  return {
    success: errors.length === 0,
    imported: services,
    errors,
    sectors: existingSector ? 0 : 1,
    categories,
    subcategories,
    services
  };
};

const processCategory = async (
  sectorId: string, 
  categoryName: string, 
  subcategoryName?: string, 
  serviceName?: string
): Promise<ImportResult> => {
  let categories = 0;
  let subcategories = 0;
  let services = 0;

  // Create or find category
  const { data: existingCategory, error: categoryFindError } = await supabase
    .from('service_categories')
    .select('id')
    .eq('name', categoryName)
    .eq('sector_id', sectorId)
    .maybeSingle();

  let categoryId: string;
  
  if (existingCategory) {
    categoryId = existingCategory.id;
  } else {
    const { data: newCategory, error: categoryCreateError } = await supabase
      .from('service_categories')
      .insert({
        name: categoryName,
        sector_id: sectorId
      })
      .select('id')
      .single();

    if (categoryCreateError) {
      throw new Error(`Failed to create category ${categoryName}: ${categoryCreateError.message}`);
    }
    
    categoryId = newCategory.id;
    categories = 1;
  }

  // Process subcategory if provided
  if (subcategoryName) {
    const subcategoryResult = await processSubcategory(categoryId, subcategoryName, serviceName);
    subcategories += subcategoryResult.subcategories;
    services += subcategoryResult.services;
  }

  return {
    success: true,
    imported: services,
    errors: [],
    sectors: 0,
    categories,
    subcategories,
    services
  };
};

const processSubcategory = async (
  categoryId: string, 
  subcategoryName: string, 
  serviceName?: string
): Promise<ImportResult> => {
  let subcategories = 0;
  let services = 0;

  // Create or find subcategory
  const { data: existingSubcategory, error: subcategoryFindError } = await supabase
    .from('service_subcategories')
    .select('id')
    .eq('name', subcategoryName)
    .eq('category_id', categoryId)
    .maybeSingle();

  let subcategoryId: string;
  
  if (existingSubcategory) {
    subcategoryId = existingSubcategory.id;
  } else {
    const { data: newSubcategory, error: subcategoryCreateError } = await supabase
      .from('service_subcategories')
      .insert({
        name: subcategoryName,
        category_id: categoryId
      })
      .select('id')
      .single();

    if (subcategoryCreateError) {
      throw new Error(`Failed to create subcategory ${subcategoryName}: ${subcategoryCreateError.message}`);
    }
    
    subcategoryId = newSubcategory.id;
    subcategories = 1;
  }

  // Process service if provided
  if (serviceName) {
    const serviceResult = await processService(subcategoryId, serviceName);
    services += serviceResult.services;
  }

  return {
    success: true,
    imported: services,
    errors: [],
    sectors: 0,
    categories: 0,
    subcategories,
    services
  };
};

const processService = async (subcategoryId: string, serviceName: string): Promise<ImportResult> => {
  // Create or find service
  const { data: existingService, error: serviceFindError } = await supabase
    .from('service_jobs')
    .select('id')
    .eq('name', serviceName)
    .eq('subcategory_id', subcategoryId)
    .maybeSingle();

  if (!existingService) {
    const { error: serviceCreateError } = await supabase
      .from('service_jobs')
      .insert({
        name: serviceName,
        subcategory_id: subcategoryId
      });

    if (serviceCreateError) {
      throw new Error(`Failed to create service ${serviceName}: ${serviceCreateError.message}`);
    }
    
    return {
      success: true,
      imported: 1,
      errors: [],
      sectors: 0,
      categories: 0,
      subcategories: 0,
      services: 1
    };
  }

  return {
    success: true,
    imported: 0,
    errors: [],
    sectors: 0,
    categories: 0,
    subcategories: 0,
    services: 0
  };
};
