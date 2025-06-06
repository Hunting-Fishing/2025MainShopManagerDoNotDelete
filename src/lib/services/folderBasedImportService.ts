
import { supabase } from '@/integrations/supabase/client';

export interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
  error?: string;
  completed?: boolean;
}

interface ServiceData {
  sheetName: string;
  data: any[][];
}

export const processServiceData = async (
  sheetsData: ServiceData[],
  onProgress?: (progress: ImportProgress) => void
): Promise<void> => {
  try {
    let totalSheets = sheetsData.length;
    let processedSheets = 0;

    for (const sheet of sheetsData) {
      if (onProgress) {
        onProgress({
          stage: 'processing',
          progress: (processedSheets / totalSheets) * 100,
          message: `Processing sheet: ${sheet.sheetName}...`
        });
      }

      // Process each row of data
      const [headers, ...rows] = sheet.data;
      
      if (!headers || headers.length === 0) {
        console.warn(`Skipping empty sheet: ${sheet.sheetName}`);
        continue;
      }

      // Expected columns: Sector, Category, Subcategory, Job/Service, Description, Price, Duration
      const sectorIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes('sector'));
      const categoryIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes('category'));
      const subcategoryIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes('subcategory'));
      const jobIndex = headers.findIndex(h => h && (h.toString().toLowerCase().includes('job') || h.toString().toLowerCase().includes('service')));

      if (sectorIndex === -1 || categoryIndex === -1 || subcategoryIndex === -1 || jobIndex === -1) {
        console.warn(`Missing required columns in sheet: ${sheet.sheetName}`);
        continue;
      }

      // Process rows and organize data hierarchically
      const processedData = new Map();

      for (const row of rows) {
        if (!row || row.length === 0) continue;

        const sector = row[sectorIndex]?.toString().trim();
        const category = row[categoryIndex]?.toString().trim();
        const subcategory = row[subcategoryIndex]?.toString().trim();
        const job = row[jobIndex]?.toString().trim();

        if (!sector || !category || !subcategory || !job) continue;

        // Build hierarchical structure
        if (!processedData.has(sector)) {
          processedData.set(sector, new Map());
        }
        if (!processedData.get(sector).has(category)) {
          processedData.get(sector).set(category, new Map());
        }
        if (!processedData.get(sector).get(category).has(subcategory)) {
          processedData.get(sector).get(category).set(subcategory, []);
        }

        processedData.get(sector).get(category).get(subcategory).push({
          name: job,
          description: row[headers.findIndex(h => h && h.toString().toLowerCase().includes('description'))] || '',
          price: parseFloat(row[headers.findIndex(h => h && h.toString().toLowerCase().includes('price'))] || '0') || null,
          estimatedTime: parseInt(row[headers.findIndex(h => h && h.toString().toLowerCase().includes('duration'))] || '0') || null
        });
      }

      // Insert data into database
      await insertServiceHierarchy(processedData);
      
      processedSheets++;
    }

    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: 'Service data processing completed successfully!',
        completed: true
      });
    }

  } catch (error) {
    console.error('Error processing service data:', error);
    if (onProgress) {
      onProgress({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Failed to process service data',
        error: error instanceof Error ? error.message : 'Failed to process service data'
      });
    }
    throw error;
  }
};

const insertServiceHierarchy = async (processedData: Map<string, any>) => {
  for (const [sectorName, categories] of processedData) {
    // Insert sector
    const { data: sector, error: sectorError } = await supabase
      .from('service_sectors')
      .upsert({ name: sectorName }, { onConflict: 'name' })
      .select()
      .single();

    if (sectorError) throw sectorError;

    for (const [categoryName, subcategories] of categories) {
      // Insert category
      const { data: category, error: categoryError } = await supabase
        .from('service_categories')
        .upsert({ 
          name: categoryName, 
          sector_id: sector.id 
        }, { onConflict: 'name,sector_id' })
        .select()
        .single();

      if (categoryError) throw categoryError;

      for (const [subcategoryName, jobs] of subcategories) {
        // Insert subcategory
        const { data: subcategory, error: subcategoryError } = await supabase
          .from('service_subcategories')
          .upsert({ 
            name: subcategoryName, 
            category_id: category.id 
          }, { onConflict: 'name,category_id' })
          .select()
          .single();

        if (subcategoryError) throw subcategoryError;

        // Insert jobs
        for (const job of jobs) {
          const { error: jobError } = await supabase
            .from('service_jobs')
            .upsert({
              name: job.name,
              description: job.description,
              price: job.price,
              estimated_time: job.estimatedTime,
              subcategory_id: subcategory.id
            }, { onConflict: 'name,subcategory_id' });

          if (jobError) throw jobError;
        }
      }
    }
  }
};

export const clearAllServiceData = async (): Promise<void> => {
  try {
    // Delete in reverse order to respect foreign key constraints
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
    const [sectors, categories, subcategories, jobs] = await Promise.all([
      supabase.from('service_sectors').select('id', { count: 'exact', head: true }),
      supabase.from('service_categories').select('id', { count: 'exact', head: true }),
      supabase.from('service_subcategories').select('id', { count: 'exact', head: true }),
      supabase.from('service_jobs').select('id', { count: 'exact', head: true })
    ]);

    return {
      sectors: sectors.count || 0,
      categories: categories.count || 0,
      subcategories: subcategories.count || 0,
      jobs: jobs.count || 0
    };
  } catch (error) {
    console.error('Error getting service counts:', error);
    return { sectors: 0, categories: 0, subcategories: 0, jobs: 0 };
  }
};
