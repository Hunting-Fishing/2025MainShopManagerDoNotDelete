
import { supabase } from '@/integrations/supabase/client';

export const cleanupMisplacedServiceData = async () => {
  try {
    console.log('Starting cleanup of misplaced service data...');
    
    // Get the "General" and "Automotive" sectors
    const { data: sectors } = await supabase
      .from('service_sectors')
      .select('id, name')
      .in('name', ['General', 'Automotive']);
    
    if (!sectors || sectors.length === 0) {
      console.log('No sectors found to cleanup');
      return { success: true, message: 'No cleanup needed' };
    }
    
    const generalSector = sectors.find(s => s.name === 'General');
    const automotiveSector = sectors.find(s => s.name === 'Automotive');
    
    if (!generalSector || !automotiveSector) {
      console.log('Required sectors not found for cleanup');
      return { success: true, message: 'Required sectors not found' };
    }
    
    // Get all categories in the General sector
    const { data: generalCategories } = await supabase
      .from('service_categories')
      .select('id, name')
      .eq('sector_id', generalSector.id);
    
    if (!generalCategories || generalCategories.length === 0) {
      console.log('No categories found in General sector');
      return { success: true, message: 'No categories to move' };
    }
    
    let movedCategories = 0;
    
    // Move automotive-related categories from General to Automotive
    for (const category of generalCategories) {
      // Move categories that seem automotive-related
      if (category.name !== 'Electronics') { // Keep Electronics in General or wherever it belongs
        const { error } = await supabase
          .from('service_categories')
          .update({ sector_id: automotiveSector.id })
          .eq('id', category.id);
        
        if (!error) {
          movedCategories++;
          console.log(`Moved category "${category.name}" to Automotive sector`);
        } else {
          console.error(`Error moving category "${category.name}":`, error);
        }
      }
    }
    
    console.log(`Cleanup completed. Moved ${movedCategories} categories to Automotive sector.`);
    
    return {
      success: true,
      message: `Cleanup completed. Moved ${movedCategories} categories to Automotive sector.`,
      movedCategories
    };
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    return {
      success: false,
      message: 'Error during cleanup',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const removeTestData = async () => {
  try {
    console.log('Removing test data...');
    
    // Remove the test "Electronics" category and its subcategories/jobs
    const { data: electronicsCategories } = await supabase
      .from('service_categories')
      .select('id')
      .eq('name', 'Electronics');
    
    if (electronicsCategories && electronicsCategories.length > 0) {
      for (const category of electronicsCategories) {
        // Delete jobs first
        const { data: subcategories } = await supabase
          .from('service_subcategories')
          .select('id')
          .eq('category_id', category.id);
        
        if (subcategories) {
          for (const subcategory of subcategories) {
            await supabase
              .from('service_jobs')
              .delete()
              .eq('subcategory_id', subcategory.id);
          }
        }
        
        // Delete subcategories
        await supabase
          .from('service_subcategories')
          .delete()
          .eq('category_id', category.id);
        
        // Delete category
        await supabase
          .from('service_categories')
          .delete()
          .eq('id', category.id);
      }
    }
    
    console.log('Test data removal completed');
    return { success: true, message: 'Test data removed successfully' };
    
  } catch (error) {
    console.error('Error removing test data:', error);
    return {
      success: false,
      message: 'Error removing test data',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
