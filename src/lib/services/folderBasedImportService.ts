
import { supabase } from '@/integrations/supabase/client';

export interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
  error?: string;
  completed?: boolean;
}

interface ServiceData {
  sector?: string;
  category?: string;
  subcategory?: string;
  job?: string;
  service?: string;
  description?: string;
  price?: string;
  duration?: string;
  [key: string]: any;
}

interface ExcelSheetData {
  sheetName: string;
  data: any[][];
}

export const processServiceData = async (
  sheetsData: ExcelSheetData[],
  onProgress?: (progress: ImportProgress) => void
): Promise<void> => {
  if (onProgress) {
    onProgress({
      stage: 'processing',
      progress: 0,
      message: 'Starting data processing...'
    });
  }

  try {
    // Clear existing service data
    await clearAllServiceData();

    if (onProgress) {
      onProgress({
        stage: 'processing',
        progress: 10,
        message: 'Cleared existing service data...'
      });
    }

    let totalJobs = 0;
    const sectorsMap = new Map();
    const categoriesMap = new Map();
    const subcategoriesMap = new Map();

    // Process all sheets to count and organize data
    for (const sheet of sheetsData) {
      if (onProgress) {
        onProgress({
          stage: 'processing',
          progress: 15,
          message: `Processing sheet: ${sheet.sheetName}...`
        });
      }

      if (sheet.data.length === 0) continue;

      const headers = sheet.data[0];
      const sectorIndex = findColumnIndex(headers, ['sector']);
      const categoryIndex = findColumnIndex(headers, ['category']);
      const subcategoryIndex = findColumnIndex(headers, ['subcategory']);
      const jobIndex = findColumnIndex(headers, ['job', 'service']);
      const descriptionIndex = findColumnIndex(headers, ['description']);
      const priceIndex = findColumnIndex(headers, ['price']);
      const durationIndex = findColumnIndex(headers, ['duration', 'time']);

      // Process each row
      for (let i = 1; i < sheet.data.length; i++) {
        const row = sheet.data[i];
        if (!row || row.length === 0) continue;

        const serviceData: ServiceData = {
          sector: row[sectorIndex]?.toString().trim() || 'General',
          category: row[categoryIndex]?.toString().trim() || 'Uncategorized',
          subcategory: row[subcategoryIndex]?.toString().trim() || 'General',
          job: row[jobIndex]?.toString().trim(),
          description: row[descriptionIndex]?.toString().trim() || '',
          price: row[priceIndex]?.toString().trim() || '',
          duration: row[durationIndex]?.toString().trim() || ''
        };

        if (!serviceData.job) continue;

        // Organize data hierarchically
        if (!sectorsMap.has(serviceData.sector)) {
          sectorsMap.set(serviceData.sector, new Map());
        }
        const sectorCategories = sectorsMap.get(serviceData.sector);

        if (!sectorCategories.has(serviceData.category)) {
          sectorCategories.set(serviceData.category, new Map());
        }
        const categorySubcategories = sectorCategories.get(serviceData.category);

        if (!categorySubcategories.has(serviceData.subcategory)) {
          categorySubcategories.set(serviceData.subcategory, []);
        }
        const subcategoryJobs = categorySubcategories.get(serviceData.subcategory);

        subcategoryJobs.push(serviceData);
        totalJobs++;
      }
    }

    if (onProgress) {
      onProgress({
        stage: 'processing',
        progress: 30,
        message: `Organized ${totalJobs} jobs across ${sectorsMap.size} sectors...`
      });
    }

    // Insert data into database
    let processedJobs = 0;
    let sectorPosition = 1;

    for (const [sectorName, sectorCategories] of sectorsMap) {
      // Insert sector
      const { data: sector, error: sectorError } = await supabase
        .from('service_sectors')
        .insert({
          name: sectorName,
          description: `${sectorName} services`,
          position: sectorPosition++
        })
        .select()
        .single();

      if (sectorError) throw sectorError;

      let categoryPosition = 1;
      for (const [categoryName, categorySubcategories] of sectorCategories) {
        // Insert category
        const { data: category, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            sector_id: sector.id,
            name: categoryName,
            description: `${categoryName} in ${sectorName}`,
            position: categoryPosition++
          })
          .select()
          .single();

        if (categoryError) throw categoryError;

        for (const [subcategoryName, subcategoryJobs] of categorySubcategories) {
          // Insert subcategory
          const { data: subcategory, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert({
              category_id: category.id,
              name: subcategoryName,
              description: `${subcategoryName} services`
            })
            .select()
            .single();

          if (subcategoryError) throw subcategoryError;

          // Insert all jobs for this subcategory
          const jobsToInsert = subcategoryJobs.map((jobData: ServiceData) => ({
            subcategory_id: subcategory.id,
            name: jobData.job,
            description: jobData.description || null,
            estimated_time: jobData.duration ? parseInt(jobData.duration) || null : null,
            price: jobData.price ? parseFloat(jobData.price) || null : null
          }));

          const { error: jobsError } = await supabase
            .from('service_jobs')
            .insert(jobsToInsert);

          if (jobsError) throw jobsError;

          processedJobs += subcategoryJobs.length;

          if (onProgress) {
            onProgress({
              stage: 'processing',
              progress: 30 + (processedJobs / totalJobs) * 60,
              message: `Processed ${processedJobs}/${totalJobs} jobs...`
            });
          }
        }
      }
    }

    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: `Successfully imported ${totalJobs} jobs across ${sectorsMap.size} sectors!`,
        completed: true
      });
    }

  } catch (error) {
    console.error('Error processing service data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (onProgress) {
      onProgress({
        stage: 'error',
        progress: 0,
        message: errorMessage,
        error: errorMessage
      });
    }
    throw error;
  }
};

function findColumnIndex(headers: any[], possibleNames: string[]): number {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]?.toString().toLowerCase().trim();
    if (possibleNames.some(name => header?.includes(name.toLowerCase()))) {
      return i;
    }
  }
  return -1;
}

export const clearAllServiceData = async (): Promise<void> => {
  try {
    // Delete in correct order due to foreign key constraints
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
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
    return {
      sectors: 0,
      categories: 0,
      subcategories: 0,
      jobs: 0
    };
  }
};
