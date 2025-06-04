
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

export interface ImportResult {
  success: boolean;
  categoriesCreated: number;
  subcategoriesCreated: number;
  jobsCreated: number;
  errors: string[];
}

export const checkForDuplicates = async (categories: ServiceMainCategory[]): Promise<any[]> => {
  try {
    console.log('🔍 Checking for duplicates among', categories.length, 'categories...');
    
    // Get existing category names
    const { data: existingCategories } = await supabase
      .from('service_categories')
      .select('name')
      .in('name', categories.map(cat => cat.name));

    const duplicates = categories
      .filter(cat => existingCategories?.some(existing => existing.name === cat.name))
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        category: 'Service Category',
        type: 'category'
      }));

    console.log('🔍 Found', duplicates.length, 'duplicate categories');
    return duplicates;
  } catch (error) {
    console.error('❌ Error checking duplicates:', error);
    return [];
  }
};

export const importServiceData = async (
  categories: ServiceMainCategory[], 
  clearExisting: boolean = false
): Promise<ImportResult> => {
  try {
    console.log('🚀 Starting service data import...');
    console.log('📊 Categories to import:', categories.length);
    
    let totalSubcategories = 0;
    let totalJobs = 0;
    categories.forEach(cat => {
      totalSubcategories += cat.subcategories.length;
      cat.subcategories.forEach(sub => {
        totalJobs += sub.jobs.length;
      });
    });
    
    console.log('📊 Total subcategories:', totalSubcategories);
    console.log('📊 Total jobs:', totalJobs);
    
    // Clear existing data if requested
    if (clearExisting) {
      console.log('🧹 Clearing existing service data...');
      
      // Clear in the correct order due to foreign key constraints
      const { error: jobsError } = await supabase
        .from('service_jobs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except non-existent ID
      
      if (jobsError) {
        console.error('Error clearing jobs:', jobsError);
        throw jobsError;
      }
      
      const { error: subcategoriesError } = await supabase
        .from('service_subcategories')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (subcategoriesError) {
        console.error('Error clearing subcategories:', subcategoriesError);
        throw subcategoriesError;
      }
      
      const { error: categoriesError } = await supabase
        .from('service_categories')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (categoriesError) {
        console.error('Error clearing categories:', categoriesError);
        throw categoriesError;
      }
      
      console.log('✅ Existing data cleared successfully');
    }
    
    const result: ImportResult = {
      success: true,
      categoriesCreated: 0,
      subcategoriesCreated: 0,
      jobsCreated: 0,
      errors: []
    };
    
    // Process categories in larger batches to handle up to 10,000 lines efficiently
    const CATEGORY_BATCH_SIZE = 50; // Process categories in batches
    const SUBCATEGORY_BATCH_SIZE = 100; // Process subcategories in larger batches
    const JOB_BATCH_SIZE = 500; // Process jobs in much larger batches for efficiency
    
    for (let i = 0; i < categories.length; i += CATEGORY_BATCH_SIZE) {
      const categoryBatch = categories.slice(i, i + CATEGORY_BATCH_SIZE);
      console.log(`📦 Processing category batch ${Math.floor(i/CATEGORY_BATCH_SIZE) + 1}/${Math.ceil(categories.length/CATEGORY_BATCH_SIZE)} (${categoryBatch.length} categories)`);
      
      for (const category of categoryBatch) {
        try {
          console.log(`📂 Importing category: ${category.name}`);
          
          // Insert category
          const { data: categoryData, error: categoryError } = await supabase
            .from('service_categories')
            .insert({
              id: category.id,
              name: category.name,
              description: category.description || '',
              position: category.position || 1
            })
            .select()
            .single();
          
          if (categoryError) {
            console.error(`❌ Error inserting category ${category.name}:`, categoryError);
            result.errors.push(`Category ${category.name}: ${categoryError.message}`);
            continue;
          }
          
          result.categoriesCreated++;
          
          // Process subcategories in batches
          const subcategories = category.subcategories;
          for (let j = 0; j < subcategories.length; j += SUBCATEGORY_BATCH_SIZE) {
            const subcategoryBatch = subcategories.slice(j, j + SUBCATEGORY_BATCH_SIZE);
            
            const subcategoryInserts = subcategoryBatch.map(subcategory => ({
              id: subcategory.id,
              category_id: categoryData.id,
              name: subcategory.name,
              description: subcategory.description || ''
            }));
            
            const { data: subcategoryData, error: subcategoryError } = await supabase
              .from('service_subcategories')
              .insert(subcategoryInserts)
              .select();
            
            if (subcategoryError) {
              console.error(`❌ Error inserting subcategories for ${category.name}:`, subcategoryError);
              result.errors.push(`Subcategories for ${category.name}: ${subcategoryError.message}`);
              continue;
            }
            
            result.subcategoriesCreated += subcategoryData.length;
            
            // Process jobs in larger batches for efficiency
            for (const insertedSubcategory of subcategoryData) {
              const originalSubcategory = subcategoryBatch.find(sub => sub.id === insertedSubcategory.id);
              if (!originalSubcategory) continue;
              
              const jobs = originalSubcategory.jobs;
              console.log(`📁 Processing ${jobs.length} jobs for subcategory: ${originalSubcategory.name}`);
              
              for (let k = 0; k < jobs.length; k += JOB_BATCH_SIZE) {
                const jobBatch = jobs.slice(k, k + JOB_BATCH_SIZE);
                
                const jobInserts = jobBatch.map(job => ({
                  id: job.id,
                  subcategory_id: insertedSubcategory.id,
                  name: job.name,
                  description: job.description || '',
                  estimated_time: job.estimatedTime,
                  price: job.price
                }));
                
                const { data: jobData, error: jobError } = await supabase
                  .from('service_jobs')
                  .insert(jobInserts)
                  .select();
                
                if (jobError) {
                  console.error(`❌ Error inserting jobs for ${originalSubcategory.name}:`, jobError);
                  result.errors.push(`Jobs for ${originalSubcategory.name}: ${jobError.message}`);
                } else {
                  result.jobsCreated += jobData.length;
                  console.log(`✅ Inserted ${jobData.length} jobs (batch ${Math.floor(k/JOB_BATCH_SIZE) + 1}/${Math.ceil(jobs.length/JOB_BATCH_SIZE)})`);
                }
              }
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ Error processing category ${category.name}:`, error);
          result.errors.push(`Category ${category.name}: ${errorMessage}`);
        }
      }
    }
    
    console.log('✅ Import complete:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      categoriesCreated: 0,
      subcategoriesCreated: 0,
      jobsCreated: 0,
      errors: [errorMessage]
    };
  }
};
