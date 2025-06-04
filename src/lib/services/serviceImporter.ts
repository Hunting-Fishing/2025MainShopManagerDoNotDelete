
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

export interface ImportResult {
  success: boolean;
  categoriesCreated: number;
  subcategoriesCreated: number;
  jobsCreated: number;
  errors: string[];
}

export const importServiceData = async (
  categories: ServiceMainCategory[],
  clearExisting: boolean = false
): Promise<ImportResult> => {
  console.log('🚀 Starting service data import...');
  
  const result: ImportResult = {
    success: false,
    categoriesCreated: 0,
    subcategoriesCreated: 0,
    jobsCreated: 0,
    errors: []
  };
  
  try {
    // Clear existing data if requested
    if (clearExisting) {
      console.log('🧹 Clearing existing service data...');
      const { error: clearError } = await supabase.rpc('clear_service_data');
      if (clearError) {
        throw clearError;
      }
    }
    
    // Import categories and their data
    for (const category of categories) {
      try {
        console.log(`📂 Importing category: ${category.name}`);
        
        // Insert category
        const { data: categoryData, error: categoryError } = await supabase
          .rpc('insert_service_category', {
            p_name: category.name,
            p_description: category.description || null,
            p_position: category.position || null
          });
        
        if (categoryError) {
          throw categoryError;
        }
        
        const categoryId = categoryData;
        result.categoriesCreated++;
        
        // Import subcategories
        for (const subcategory of category.subcategories) {
          try {
            console.log(`📁 Importing subcategory: ${subcategory.name}`);
            
            const { data: subcategoryData, error: subcategoryError } = await supabase
              .rpc('insert_service_subcategory', {
                p_category_id: categoryId,
                p_name: subcategory.name,
                p_description: subcategory.description || null
              });
            
            if (subcategoryError) {
              throw subcategoryError;
            }
            
            const subcategoryId = subcategoryData;
            result.subcategoriesCreated++;
            
            // Import jobs
            for (const job of subcategory.jobs) {
              try {
                console.log(`⚙️ Importing job: ${job.name}`);
                
                const { error: jobError } = await supabase
                  .rpc('insert_service_job', {
                    p_subcategory_id: subcategoryId,
                    p_name: job.name,
                    p_description: job.description || null,
                    p_estimated_time: job.estimatedTime || null,
                    p_price: job.price || null
                  });
                
                if (jobError) {
                  throw jobError;
                }
                
                result.jobsCreated++;
                
              } catch (jobError) {
                const errorMsg = `Failed to import job "${job.name}": ${jobError}`;
                console.error(errorMsg);
                result.errors.push(errorMsg);
              }
            }
            
          } catch (subcategoryError) {
            const errorMsg = `Failed to import subcategory "${subcategory.name}": ${subcategoryError}`;
            console.error(errorMsg);
            result.errors.push(errorMsg);
          }
        }
        
      } catch (categoryError) {
        const errorMsg = `Failed to import category "${category.name}": ${categoryError}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }
    
    result.success = result.errors.length === 0 || result.categoriesCreated > 0;
    
    console.log('✅ Import complete:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    result.errors.push(`Import failed: ${error}`);
    return result;
  }
};

export const checkForDuplicates = async (categories: ServiceMainCategory[]): Promise<any[]> => {
  console.log('🔍 Checking for duplicates...');
  
  try {
    // Get existing categories
    const { data: existingCategories, error } = await supabase
      .from('service_categories')
      .select('name');
    
    if (error) {
      console.error('Error fetching existing categories:', error);
      return [];
    }
    
    const existingNames = new Set(existingCategories?.map(c => c.name.toLowerCase()) || []);
    const duplicates: any[] = [];
    
    categories.forEach(category => {
      if (existingNames.has(category.name.toLowerCase())) {
        duplicates.push({
          id: category.id,
          name: category.name,
          type: 'category',
          action: 'skip' // default action
        });
      }
    });
    
    console.log('🔍 Found duplicates:', duplicates);
    return duplicates;
    
  } catch (error) {
    console.error('Error checking duplicates:', error);
    return [];
  }
};
