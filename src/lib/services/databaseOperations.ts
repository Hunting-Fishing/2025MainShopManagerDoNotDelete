
// Extracted database operations for better separation of concerns
import { supabase } from '@/integrations/supabase/client';
import { ServiceSector, ImportStats } from '@/types/service';

/**
 * Clears ALL service data from the database - IMPROVED VERSION
 */
export const clearAllServiceData = async (): Promise<void> => {
  try {
    console.log('Starting comprehensive service data cleanup...');
    
    // Delete in proper order to respect foreign key constraints
    // 1. Delete all service jobs first
    const { error: jobsError } = await supabase
      .from('service_jobs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (jobsError) {
      console.error('Error deleting service jobs:', jobsError);
      throw jobsError;
    }
    
    // 2. Delete all subcategories
    const { error: subcategoriesError } = await supabase
      .from('service_subcategories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (subcategoriesError) {
      console.error('Error deleting subcategories:', subcategoriesError);
      throw subcategoriesError;
    }
    
    // 3. Delete all categories
    const { error: categoriesError } = await supabase
      .from('service_categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (categoriesError) {
      console.error('Error deleting categories:', categoriesError);
      throw categoriesError;
    }
    
    // 4. Delete all sectors
    const { error: sectorsError } = await supabase
      .from('service_sectors')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (sectorsError) {
      console.error('Error deleting sectors:', sectorsError);
      throw sectorsError;
    }
    
    console.log('Successfully cleared ALL service data from database');
    
  } catch (error) {
    console.error('Error during comprehensive cleanup:', error);
    throw error;
  }
};

/**
 * Gets current service data counts from database
 */
export const getServiceCounts = async (): Promise<ImportStats> => {
  try {
    const [sectorsResult, categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
      supabase.from('service_sectors').select('id', { count: 'exact' }),
      supabase.from('service_categories').select('id', { count: 'exact' }),
      supabase.from('service_subcategories').select('id', { count: 'exact' }),
      supabase.from('service_jobs').select('id', { count: 'exact' })
    ]);
    
    return {
      totalSectors: sectorsResult.count || 0,
      totalCategories: categoriesResult.count || 0,
      totalSubcategories: subcategoriesResult.count || 0,
      totalServices: jobsResult.count || 0,
      filesProcessed: 0
    };
  } catch (error) {
    console.error('Error getting service counts:', error);
    return {
      totalSectors: 0,
      totalCategories: 0,
      totalSubcategories: 0,
      totalServices: 0,
      filesProcessed: 0
    };
  }
};
