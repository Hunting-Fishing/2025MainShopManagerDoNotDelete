
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
  details?: string;
}

export interface ServiceImportData {
  categories: ServiceMainCategory[];
  totalItems: number;
}

// Insert service category into database
export const insertServiceCategory = async (category: Omit<ServiceMainCategory, 'id' | 'subcategories'>) => {
  console.log('Inserting category:', category);
  
  const { data, error } = await supabase
    .from('service_categories')
    .insert({
      name: category.name,
      description: category.description || null,
      position: category.position || 0
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting category:', error);
    throw error;
  }

  return data;
};

// Insert service subcategory into database
export const insertServiceSubcategory = async (
  categoryId: string, 
  subcategory: Omit<ServiceSubcategory, 'id' | 'jobs' | 'category_id'>
) => {
  console.log('Inserting subcategory:', subcategory, 'for category:', categoryId);
  
  const { data, error } = await supabase
    .from('service_subcategories')
    .insert({
      category_id: categoryId,
      name: subcategory.name,
      description: subcategory.description || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting subcategory:', error);
    throw error;
  }

  return data;
};

// Insert service job into database
export const insertServiceJob = async (
  subcategoryId: string, 
  job: Omit<ServiceJob, 'id' | 'subcategory_id'>
) => {
  console.log('Inserting job:', job, 'for subcategory:', subcategoryId);
  
  const { data, error } = await supabase
    .from('service_jobs')
    .insert({
      subcategory_id: subcategoryId,
      name: job.name,
      description: job.description || null,
      estimated_time: job.estimatedTime || null,
      price: job.price || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting job:', error);
    throw error;
  }

  return data;
};

// Clear all existing service data
export const clearServiceData = async () => {
  console.log('Clearing existing service data...');
  
  const { error } = await supabase.rpc('clear_service_data');
  
  if (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
};

// Bulk import service hierarchy data
export const bulkImportServiceData = async (
  data: ServiceMainCategory[],
  onProgress: (progress: ImportProgress) => void,
  clearExisting: boolean = false
): Promise<void> => {
  let processed = 0;
  const totalItems = data.reduce((total, category) => {
    return total + 1 + category.subcategories.reduce((subTotal, sub) => {
      return subTotal + 1 + sub.jobs.length;
    }, 0);
  }, 0);

  try {
    // Clear existing data if requested
    if (clearExisting) {
      onProgress({
        stage: 'clearing',
        progress: 0,
        message: 'Clearing existing service data...'
      });
      
      await clearServiceData();
    }

    onProgress({
      stage: 'importing',
      progress: 0,
      message: 'Starting import...',
      details: `Importing ${data.length} categories with ${totalItems} total items`
    });

    // Import categories, subcategories, and jobs
    for (const category of data) {
      // Insert category
      const insertedCategory = await insertServiceCategory({
        name: category.name,
        description: category.description,
        position: category.position
      });
      
      processed++;
      onProgress({
        stage: 'importing',
        progress: (processed / totalItems) * 100,
        message: `Imported category: ${category.name}`
      });

      // Insert subcategories
      for (const subcategory of category.subcategories) {
        const insertedSubcategory = await insertServiceSubcategory(insertedCategory.id, {
          name: subcategory.name,
          description: subcategory.description
        });
        
        processed++;
        onProgress({
          stage: 'importing',
          progress: (processed / totalItems) * 100,
          message: `Imported subcategory: ${subcategory.name}`
        });

        // Insert jobs
        for (const job of subcategory.jobs) {
          await insertServiceJob(insertedSubcategory.id, {
            name: job.name,
            description: job.description,
            estimatedTime: job.estimatedTime,
            price: job.price
          });
          
          processed++;
          onProgress({
            stage: 'importing',
            progress: (processed / totalItems) * 100,
            message: `Imported job: ${job.name}`
          });
        }
      }
    }

    onProgress({
      stage: 'complete',
      progress: 100,
      message: `Successfully imported ${processed} items`,
      details: `${data.length} categories with all subcategories and jobs`
    });

  } catch (error) {
    console.error('Bulk import failed:', error);
    throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Map Excel data to service hierarchy structure
export const mapExcelDataToServiceHierarchy = (rawData: any[]): ServiceMainCategory[] => {
  console.log('Mapping Excel data to service hierarchy:', rawData);
  
  const categoryMap = new Map<string, ServiceMainCategory>();
  
  rawData.forEach((row, index) => {
    try {
      // Try different possible column names for flexibility
      const categoryName = row.category || row.Category || row.CATEGORY || 
                          row.service_category || row['Service Category'] || 
                          row.main_category || row['Main Category'] ||
                          `Category ${index + 1}`;
      
      const subcategoryName = row.subcategory || row.Subcategory || row.SUBCATEGORY ||
                             row.service_subcategory || row['Service Subcategory'] ||
                             row.sub_category || row['Sub Category'] ||
                             'General';
      
      const jobName = row.job || row.Job || row.JOB ||
                     row.service || row.Service || row.SERVICE ||
                     row.job_name || row['Job Name'] ||
                     row.service_name || row['Service Name'] ||
                     row.name || row.Name || row.NAME ||
                     `Service ${index + 1}`;
      
      const description = row.description || row.Description || row.DESCRIPTION || '';
      const estimatedTime = parseFloat(row.estimated_time || row['Estimated Time'] || row.time || 0) || undefined;
      const price = parseFloat(row.price || row.Price || row.PRICE || row.cost || row.Cost || 0) || undefined;

      // Get or create category
      let category = categoryMap.get(categoryName);
      if (!category) {
        category = {
          id: `cat-${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
          name: categoryName,
          description: `Category for ${categoryName}`,
          subcategories: [],
          position: categoryMap.size
        };
        categoryMap.set(categoryName, category);
      }

      // Find or create subcategory
      let subcategory = category.subcategories.find(sub => sub.name === subcategoryName);
      if (!subcategory) {
        subcategory = {
          id: `sub-${subcategoryName.toLowerCase().replace(/\s+/g, '-')}-${category.subcategories.length}`,
          name: subcategoryName,
          description: `Subcategory for ${subcategoryName}`,
          jobs: [],
          category_id: category.id
        };
        category.subcategories.push(subcategory);
      }

      // Add job
      const job: ServiceJob = {
        id: `job-${jobName.toLowerCase().replace(/\s+/g, '-')}-${subcategory.jobs.length}`,
        name: jobName,
        description: description,
        estimatedTime: estimatedTime,
        price: price,
        subcategory_id: subcategory.id
      };

      subcategory.jobs.push(job);
      
    } catch (error) {
      console.error(`Error processing row ${index}:`, row, error);
      // Continue processing other rows
    }
  });

  const result = Array.from(categoryMap.values());
  console.log('Mapped service hierarchy:', result);
  return result;
};
