
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { ParsedServiceData } from '@/lib/services/excelParser';

export const importServiceData = async (
  parsedData: ParsedServiceData,
  updateProgress?: () => void
): Promise<void> => {
  try {
    console.log('Starting service import...');
    
    for (const category of parsedData.categories) {
      // Insert main category
      const { data: categoryData, error: categoryError } = await supabase
        .from('service_categories')
        .insert({
          id: category.id,
          name: category.name,
          description: category.description,
          display_order: category.display_order,
          is_active: category.is_active
        })
        .select()
        .single();
      
      if (categoryError) {
        console.error('Error inserting category:', categoryError);
        throw categoryError;
      }
      
      if (updateProgress) updateProgress();
      
      // Insert subcategories
      for (const subcategory of category.subcategories) {
        const { data: subcategoryData, error: subcategoryError } = await supabase
          .from('service_subcategories')
          .insert({
            id: subcategory.id,
            name: subcategory.name,
            description: subcategory.description,
            category_id: subcategory.category_id,
            display_order: subcategory.display_order
          })
          .select()
          .single();
        
        if (subcategoryError) {
          console.error('Error inserting subcategory:', subcategoryError);
          throw subcategoryError;
        }
        
        if (updateProgress) updateProgress();
        
        // Insert jobs
        for (const job of subcategory.jobs) {
          const { error: jobError } = await supabase
            .from('service_jobs')
            .insert({
              id: job.id,
              name: job.name,
              description: job.description,
              subcategory_id: job.subcategory_id,
              category_id: job.category_id,
              base_price: job.base_price,
              estimated_duration: job.estimated_duration,
              skill_level: job.skill_level,
              display_order: job.display_order,
              is_active: job.is_active
            });
          
          if (jobError) {
            console.error('Error inserting job:', jobError);
            throw jobError;
          }
          
          if (updateProgress) updateProgress();
        }
      }
    }
    
    console.log('Service import completed successfully');
  } catch (error) {
    console.error('Service import failed:', error);
    throw error;
  }
};
