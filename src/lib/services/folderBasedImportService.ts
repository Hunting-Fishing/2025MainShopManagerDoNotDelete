
import { supabase } from '@/integrations/supabase/client';
import { importFromStorage, ImportProgress } from './storageImportService';

export interface ServiceCounts {
  sectors: number;
  categories: number;
  subcategories: number;
  jobs: number;
}

export { ImportProgress };

// Extract sector name from file path (e.g., "Automotive/file.xlsx" -> "Automotive")
const extractSectorFromPath = (filePath: string): string => {
  const pathParts = filePath.split('/');
  if (pathParts.length > 1) {
    return pathParts[0]; // First part is the folder/sector name
  }
  return 'General'; // Fallback if no folder structure
};

const createServiceRecord = async (
  tableName: string,
  data: any,
  parentId?: string,
  position?: number
) => {
  const record = {
    name: data.name || data.title || 'Unnamed',
    description: data.description || null,
    position: position || 0,
    ...(parentId && { 
      [`${tableName === 'service_categories' ? 'sector' : 
         tableName === 'service_subcategories' ? 'category' : 'subcategory'}_id`]: parentId 
    }),
    ...(tableName === 'service_jobs' && {
      estimated_time: data.estimated_time || data.time || null,
      price: data.price || data.cost || null
    })
  };

  const { data: result, error } = await supabase
    .from(tableName)
    .insert(record)
    .select('id')
    .single();

  if (error) {
    console.error(`Error creating ${tableName}:`, error);
    throw new Error(`Failed to create ${tableName}: ${error.message}`);
  }

  return result.id;
};

const getColumnValue = (row: any[], headers: string[], possibleNames: string[]): string => {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => 
      h && h.toLowerCase().includes(name.toLowerCase())
    );
    if (index >= 0 && row[index]) {
      return row[index].toString().trim();
    }
  }
  return '';
};

const processServiceData = async (
  sheetsData: any[],
  sectorName: string, // Now properly passed from folder name
  onProgress?: (progress: ImportProgress) => void
) => {
  let totalProcessed = 0;
  const totalSheets = sheetsData.length;

  // Create or get the sector using the extracted folder name
  if (onProgress) {
    onProgress({
      stage: 'processing',
      progress: 70,
      message: `Creating sector: ${sectorName}...`
    });
  }

  const { data: existingSector } = await supabase
    .from('service_sectors')
    .select('id')
    .eq('name', sectorName)
    .single();

  let sectorId: string;
  if (existingSector) {
    sectorId = existingSector.id;
    console.log(`Using existing sector: ${sectorName} (${sectorId})`);
  } else {
    sectorId = await createServiceRecord('service_sectors', { 
      name: sectorName,
      description: `${sectorName} services and categories`
    });
    console.log(`Created new sector: ${sectorName} (${sectorId})`);
  }

  for (const sheetData of sheetsData) {
    const { sheetName, data } = sheetData;
    
    if (onProgress) {
      onProgress({
        stage: 'processing',
        progress: 70 + (totalProcessed / totalSheets) * 25,
        message: `Processing sheet: ${sheetName}...`
      });
    }

    if (data.length === 0) continue;

    const headers = data[0] || [];
    const rows = data.slice(1);

    console.log(`Processing sheet "${sheetName}" with ${rows.length} rows`);

    let categoryId: string | null = null;
    let subcategoryId: string | null = null;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.every(cell => !cell || cell.toString().trim() === '')) continue;

      const categoryName = getColumnValue(row, headers, ['category', 'main category', 'service category']);
      const subcategoryName = getColumnValue(row, headers, ['subcategory', 'sub category', 'service subcategory']);
      const jobName = getColumnValue(row, headers, ['job', 'service', 'service name', 'title', 'name']);

      // Create category if specified and different from current
      if (categoryName && (!categoryId || categoryName !== currentCategoryName)) {
        categoryId = await createServiceRecord('service_categories', {
          name: categoryName,
          description: `${categoryName} services`
        }, sectorId);
        currentCategoryName = categoryName;
        subcategoryId = null; // Reset subcategory when category changes
        console.log(`Created category: ${categoryName} under sector ${sectorName}`);
      }

      // If no category specified, use sheet name as category
      if (!categoryId) {
        categoryId = await createServiceRecord('service_categories', {
          name: sheetName,
          description: `${sheetName} services`
        }, sectorId);
        currentCategoryName = sheetName;
        console.log(`Created category from sheet name: ${sheetName} under sector ${sectorName}`);
      }

      // Create subcategory if specified and different from current
      if (subcategoryName && categoryId && (!subcategoryId || subcategoryName !== currentSubcategoryName)) {
        subcategoryId = await createServiceRecord('service_subcategories', {
          name: subcategoryName,
          description: `${subcategoryName} services`
        }, categoryId);
        currentSubcategoryName = subcategoryName;
        console.log(`Created subcategory: ${subcategoryName}`);
      }

      // Create default subcategory if none specified
      if (!subcategoryId && categoryId) {
        const defaultSubcategoryName = `${currentCategoryName || sheetName} Services`;
        subcategoryId = await createServiceRecord('service_subcategories', {
          name: defaultSubcategoryName,
          description: `General ${defaultSubcategoryName.toLowerCase()}`
        }, categoryId);
        currentSubcategoryName = defaultSubcategoryName;
        console.log(`Created default subcategory: ${defaultSubcategoryName}`);
      }

      // Create job if specified and we have a subcategory
      if (jobName && subcategoryId) {
        const estimatedTime = getColumnValue(row, headers, ['time', 'estimated time', 'duration', 'hours']);
        const price = getColumnValue(row, headers, ['price', 'cost', 'amount', 'rate']);
        const description = getColumnValue(row, headers, ['description', 'details', 'notes']);

        await createServiceRecord('service_jobs', {
          name: jobName,
          description: description || `${jobName} service`,
          estimated_time: estimatedTime ? parseInt(estimatedTime) : null,
          price: price ? parseFloat(price) : null
        }, subcategoryId);
        console.log(`Created job: ${jobName}`);
      }
    }

    totalProcessed++;
  }

  if (onProgress) {
    onProgress({
      stage: 'complete',
      progress: 95,
      message: `Successfully imported services for sector: ${sectorName}`,
      completed: true
    });
  }
};

let currentCategoryName: string | null = null;
let currentSubcategoryName: string | null = null;

export const importServicesFromStorage = async (
  bucketName: string,
  filePath: string, // Now includes folder path
  onProgress?: (progress: ImportProgress) => void
): Promise<void> => {
  try {
    console.log(`Starting import from: ${bucketName}/${filePath}`);
    
    // Extract sector name from file path
    const sectorName = extractSectorFromPath(filePath);
    console.log(`Extracted sector name: ${sectorName} from path: ${filePath}`);

    if (onProgress) {
      onProgress({
        stage: 'download',
        progress: 0,
        message: `Importing services for ${sectorName} sector...`
      });
    }

    // Import the Excel data
    const sheetsData = await importFromStorage(bucketName, filePath, onProgress);
    console.log(`Downloaded and parsed ${sheetsData.length} sheets from ${filePath}`);

    // Process the data with the correct sector name
    await processServiceData(sheetsData, sectorName, onProgress);

    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: `Import completed successfully for ${sectorName} sector!`,
        completed: true
      });
    }

    console.log(`Import completed successfully for sector: ${sectorName}`);
  } catch (error) {
    console.error('Import failed:', error);
    if (onProgress) {
      onProgress({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Import failed',
        error: error instanceof Error ? error.message : 'Import failed'
      });
    }
    throw error;
  }
};

export const clearAllServiceData = async (): Promise<void> => {
  try {
    console.log('Clearing all service data...');
    
    // Delete in correct order to respect foreign key constraints
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('All service data cleared successfully');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
};

export const getServiceCounts = async (): Promise<ServiceCounts> => {
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
