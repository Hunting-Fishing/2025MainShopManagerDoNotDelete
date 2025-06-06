
import { supabase } from '@/integrations/supabase/client';
import type { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export async function fetchServiceSectors(): Promise<ServiceSector[]> {
  try {
    console.log('Fetching service sectors...');
    
    const { data: sectors, error: sectorsError } = await supabase
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
          sector_id,
          service_subcategories (
            id,
            name,
            description,
            category_id,
            service_jobs (
              id,
              name,
              description,
              estimated_time,
              price,
              subcategory_id
            )
          )
        )
      `)
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (sectorsError) {
      console.error('Error fetching sectors:', sectorsError);
      throw sectorsError;
    }

    console.log('Raw sectors data:', sectors);

    if (!sectors || sectors.length === 0) {
      console.log('No sectors found');
      return [];
    }

    // Transform the data to match our TypeScript interfaces
    const transformedSectors: ServiceSector[] = sectors.map(sector => ({
      id: sector.id,
      name: sector.name,
      description: sector.description,
      position: sector.position,
      is_active: sector.is_active,
      categories: (sector.service_categories || []).map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        position: category.position,
        sector_id: category.sector_id,
        subcategories: (category.service_subcategories || []).map(subcategory => ({
          id: subcategory.id,
          name: subcategory.name,
          description: subcategory.description,
          category_id: subcategory.category_id,
          jobs: (subcategory.service_jobs || []).map(job => ({
            id: job.id,
            name: job.name,
            description: job.description,
            estimatedTime: job.estimated_time,
            price: job.price,
            subcategory_id: job.subcategory_id
          }))
        }))
      }))
    }));

    console.log('Transformed sectors:', transformedSectors);
    return transformedSectors;

  } catch (error) {
    console.error('Error in fetchServiceSectors:', error);
    throw error;
  }
}

export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  try {
    console.log('Fetching service categories...');
    
    const { data: categories, error } = await supabase
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
          category_id,
          service_jobs (
            id,
            name,
            description,
            estimated_time,
            price,
            subcategory_id
          )
        )
      `)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    if (!categories || categories.length === 0) {
      console.log('No categories found');
      return [];
    }

    // Transform the data to match our TypeScript interfaces
    const transformedCategories: ServiceMainCategory[] = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      position: category.position,
      sector_id: category.sector_id,
      subcategories: (category.service_subcategories || []).map(subcategory => ({
        id: subcategory.id,
        name: subcategory.name,
        description: subcategory.description,
        category_id: subcategory.category_id,
        jobs: (subcategory.service_jobs || []).map(job => ({
          id: job.id,
          name: job.name,
          description: job.description,
          estimatedTime: job.estimated_time,
          price: job.price,
          subcategory_id: job.subcategory_id
        }))
      }))
    }));

    console.log('Transformed categories:', transformedCategories);
    return transformedCategories;

  } catch (error) {
    console.error('Error in fetchServiceCategories:', error);
    throw error;
  }
}
