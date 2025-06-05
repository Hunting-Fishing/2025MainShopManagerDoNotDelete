import { supabase } from '@/integrations/supabase/client';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export const fetchServiceSectors = async (): Promise<ServiceSector[]> => {
  try {
    // Fetch all sectors, categories, subcategories, and jobs in optimized queries
    const [sectorsResult, categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
      supabase
        .from('service_sectors')
        .select('*')
        .order('position', { ascending: true }),
      supabase
        .from('service_categories')
        .select('*')
        .order('position', { ascending: true }),
      supabase
        .from('service_subcategories')
        .select('*')
        .order('position', { ascending: true }),
      supabase
        .from('service_jobs')
        .select('*')
        .order('position', { ascending: true })
    ]);

    if (sectorsResult.error) throw sectorsResult.error;
    if (categoriesResult.error) throw categoriesResult.error;
    if (subcategoriesResult.error) throw subcategoriesResult.error;
    if (jobsResult.error) throw jobsResult.error;

    // Build the 4-tier hierarchical structure
    const hierarchicalSectors: ServiceSector[] = sectorsResult.data.map(sector => {
      const sectorCategories = categoriesResult.data
        .filter(cat => cat.sector_id === sector.id)
        .map(category => {
          const categorySubcategories = subcategoriesResult.data
            .filter(sub => sub.category_id === category.id)
            .map(subcategory => {
              const subcategoryJobs = jobsResult.data
                .filter(job => job.subcategory_id === subcategory.id)
                .map(job => ({
                  id: job.id,
                  name: job.name,
                  description: job.description,
                  estimatedTime: job.estimated_time,
                  price: job.price,
                  subcategory_id: job.subcategory_id
                } as ServiceJob));

              return {
                id: subcategory.id,
                name: subcategory.name,
                description: subcategory.description,
                jobs: subcategoryJobs,
                category_id: subcategory.category_id
              } as ServiceSubcategory;
            });

          return {
            id: category.id,
            name: category.name,
            description: category.description,
            subcategories: categorySubcategories,
            position: category.position,
            sector_id: category.sector_id
          } as ServiceMainCategory;
        });

      return {
        id: sector.id,
        name: sector.name,
        description: sector.description,
        categories: sectorCategories,
        position: sector.position,
        is_active: sector.is_active
      } as ServiceSector;
    });

    return hierarchicalSectors;
  } catch (error) {
    console.error('Error fetching service sectors:', error);
    throw error;
  }
};

// Keep the existing fetchServiceCategories for backward compatibility
export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    const sectors = await fetchServiceSectors();
    return sectors.flatMap(sector => sector.categories);
  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw error;
  }
};

export const updateServiceCategory = async (id: string, updates: Partial<ServiceMainCategory>) => {
  const { error } = await supabase
    .from('service_categories')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteServiceCategory = async (id: string) => {
  const { error } = await supabase
    .from('service_categories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const updateServiceSubcategory = async (id: string, updates: Partial<ServiceSubcategory>) => {
  const { error } = await supabase
    .from('service_subcategories')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteServiceSubcategory = async (id: string) => {
  const { error } = await supabase
    .from('service_subcategories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const updateServiceJob = async (id: string, updates: Partial<ServiceJob>) => {
  const { error } = await supabase
    .from('service_jobs')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteServiceJob = async (id: string) => {
  const { error } = await supabase
    .from('service_jobs')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const searchServices = async (query: string, limit: number = 100): Promise<ServiceJob[]> => {
  try {
    const { data, error } = await supabase
      .from('service_jobs')
      .select(`
        *,
        service_subcategories!inner (
          name,
          service_categories!inner (
            name,
            service_sectors!inner (
              name
            )
          )
        )
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;

    return data.map(job => ({
      id: job.id,
      name: job.name,
      description: job.description,
      estimatedTime: job.estimated_time,
      price: job.price,
      subcategory_id: job.subcategory_id
    }));
  } catch (error) {
    console.error('Error searching services:', error);
    throw error;
  }
};
