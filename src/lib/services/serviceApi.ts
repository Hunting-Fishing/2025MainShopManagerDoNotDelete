import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob, ServiceSector } from '@/types/service';

export async function fetchServiceSectors(): Promise<ServiceSector[]> {
  try {
    console.log('Fetching service sectors...');

    // First check if tables exist
    const { error: tableCheckError } = await supabase
      .from('service_sectors')
      .select('id')
      .limit(1);

    if (tableCheckError) {
      console.error('Service tables do not exist:', tableCheckError);
      return [];
    }

    // Fetch sectors with their full hierarchy
    const { data: sectorsData, error: sectorsError } = await supabase
      .from('service_sectors')
      .select(`
        id,
        name,
        description,
        position,
        is_active,
        service_categories (
          id,
          name,
          description,
          position,
          service_subcategories (
            id,
            name,
            description,
            service_jobs (
              id,
              name,
              description,
              estimated_time,
              price
            )
          )
        )
      `)
      .order('position', { ascending: true })
      .order('name', { ascending: true });

    if (sectorsError) {
      console.error('Error fetching sectors:', sectorsError);
      return [];
    }

    console.log('Raw sectors data:', sectorsData);

    if (!sectorsData || sectorsData.length === 0) {
      console.log('No sectors found');
      return [];
    }

    // Transform the data to match our TypeScript types
    const sectors: ServiceSector[] = sectorsData.map(sector => ({
      id: sector.id,
      name: sector.name,
      description: sector.description || undefined,
      position: sector.position || undefined,
      is_active: sector.is_active ?? true,
      categories: (sector.service_categories || []).map((category: any) => ({
        id: category.id,
        name: category.name,
        description: category.description || undefined,
        position: category.position || undefined,
        sector_id: sector.id,
        subcategories: (category.service_subcategories || []).map((subcategory: any) => ({
          id: subcategory.id,
          name: subcategory.name,
          description: subcategory.description || undefined,
          category_id: category.id,
          jobs: (subcategory.service_jobs || []).map((job: any) => ({
            id: job.id,
            name: job.name,
            description: job.description || undefined,
            estimatedTime: job.estimated_time || undefined,
            price: job.price || undefined,
            subcategory_id: subcategory.id
          }))
        }))
      }))
    }));

    console.log('Transformed sectors:', sectors.length);
    return sectors;

  } catch (error) {
    console.error('Error in fetchServiceSectors:', error);
    return [];
  }
}

export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  try {
    console.log('Fetching service categories...');

    const { data: categoriesData, error } = await supabase
      .from('service_categories')
      .select(`
        id,
        name,
        description,
        position,
        sector_id,
        service_subcategories (
          id,
          name,
          description,
          service_jobs (
            id,
            name,
            description,
            estimated_time,
            price
          )
        )
      `)
      .order('position', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    if (!categoriesData) {
      return [];
    }

    const categories: ServiceMainCategory[] = categoriesData.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description || undefined,
      position: category.position || undefined,
      sector_id: category.sector_id,
      subcategories: (category.service_subcategories || []).map((subcategory: any) => ({
        id: subcategory.id,
        name: subcategory.name,
        description: subcategory.description || undefined,
        category_id: category.id,
        jobs: (subcategory.service_jobs || []).map((job: any) => ({
          id: job.id,
          name: job.name,
          description: job.description || undefined,
          estimatedTime: job.estimated_time || undefined,
          price: job.price || undefined,
          subcategory_id: subcategory.id
        }))
      }))
    }));

    console.log('Service categories loaded:', categories.length);
    return categories;
  } catch (error) {
    console.error('Error in fetchServiceCategories:', error);
    return [];
  }
}

export async function updateServiceCategory(categoryId: string, updates: Partial<ServiceMainCategory>) {
  try {
    console.log('Updating service category:', categoryId, updates);
    
    const { data, error } = await supabase
      .from('service_categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    console.log('Category updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in updateServiceCategory:', error);
    throw error;
  }
}

export async function deleteServiceCategory(categoryId: string) {
  try {
    console.log('Deleting service category:', categoryId);
    
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }

    console.log('Category deleted successfully');
  } catch (error) {
    console.error('Error in deleteServiceCategory:', error);
    throw error;
  }
}

export async function deleteServiceSubcategory(subcategoryId: string) {
  try {
    console.log('Deleting service subcategory:', subcategoryId);
    
    const { error } = await supabase
      .from('service_subcategories')
      .delete()
      .eq('id', subcategoryId);

    if (error) {
      console.error('Error deleting subcategory:', error);
      throw error;
    }

    console.log('Subcategory deleted successfully');
  } catch (error) {
    console.error('Error in deleteServiceSubcategory:', error);
    throw error;
  }
}

export async function deleteServiceJob(jobId: string) {
  try {
    console.log('Deleting service job:', jobId);
    
    const { error } = await supabase
      .from('service_jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error('Error deleting job:', error);
      throw error;
    }

    console.log('Job deleted successfully');
  } catch (error) {
    console.error('Error in deleteServiceJob:', error);
    throw error;
  }
}
