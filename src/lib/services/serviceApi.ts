
import { supabase } from '@/integrations/supabase/client';
import type { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export const fetchServiceSectors = async (): Promise<ServiceSector[]> => {
  console.log('Fetching service sectors from database...');
  
  try {
    const { data: sectors, error: sectorsError } = await supabase
      .from('service_sectors')
      .select('*')
      .order('position', { ascending: true, nullsFirst: false })
      .order('name');

    if (sectorsError) {
      console.error('Error fetching sectors:', sectorsError);
      throw sectorsError;
    }

    if (!sectors || sectors.length === 0) {
      console.log('No sectors found in database');
      return [];
    }

    const sectorsWithCategories = await Promise.all(
      sectors.map(async (sector) => {
        const { data: categories, error: categoriesError } = await supabase
          .from('service_categories')
          .select('*')
          .eq('sector_id', sector.id)
          .order('position', { ascending: true, nullsFirst: false })
          .order('name');

        if (categoriesError) {
          console.error('Error fetching categories for sector:', sector.id, categoriesError);
          return { ...sector, categories: [] };
        }

        const categoriesWithSubcategories = await Promise.all(
          (categories || []).map(async (category) => {
            const { data: subcategories, error: subcategoriesError } = await supabase
              .from('service_subcategories')
              .select('*')
              .eq('category_id', category.id)
              .order('name');

            if (subcategoriesError) {
              console.error('Error fetching subcategories for category:', category.id, subcategoriesError);
              return { ...category, subcategories: [] };
            }

            const subcategoriesWithJobs = await Promise.all(
              (subcategories || []).map(async (subcategory) => {
                const { data: jobs, error: jobsError } = await supabase
                  .from('service_jobs')
                  .select('*')
                  .eq('subcategory_id', subcategory.id)
                  .order('name');

                if (jobsError) {
                  console.error('Error fetching jobs for subcategory:', subcategory.id, jobsError);
                  return { ...subcategory, jobs: [] };
                }

                return {
                  ...subcategory,
                  jobs: jobs || []
                };
              })
            );

            return {
              ...category,
              subcategories: subcategoriesWithJobs
            };
          })
        );

        return {
          ...sector,
          categories: categoriesWithSubcategories
        };
      })
    );

    return sectorsWithCategories;
  } catch (error) {
    console.error('Failed to fetch service sectors:', error);
    throw error;
  }
};

export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    const { data: categories, error } = await supabase
      .from('service_categories')
      .select(`
        *,
        service_subcategories (
          *,
          service_jobs (*)
        )
      `)
      .order('position', { ascending: true, nullsFirst: false });

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return categories?.map(category => ({
      ...category,
      subcategories: category.service_subcategories?.map(sub => ({
        ...sub,
        jobs: sub.service_jobs || []
      })) || []
    })) || [];
  } catch (error) {
    console.error('Failed to fetch service categories:', error);
    throw error;
  }
};

// Enhanced import functions with better error handling
export const createServiceSector = async (sectorData: Omit<ServiceSector, 'id' | 'categories'>): Promise<string> => {
  try {
    // Check if sector already exists by name
    const { data: existing } = await supabase
      .from('service_sectors')
      .select('id')
      .eq('name', sectorData.name)
      .maybeSingle();

    if (existing) {
      console.log(`Sector "${sectorData.name}" already exists, returning existing ID`);
      return existing.id;
    }

    const { data, error } = await supabase
      .from('service_sectors')
      .insert({
        name: sectorData.name,
        description: sectorData.description,
        position: sectorData.position,
        is_active: sectorData.is_active ?? true
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating sector:', error);
      throw error;
    }

    return data.id;
  } catch (error) {
    console.error('Failed to create service sector:', error);
    throw error;
  }
};

export const createServiceCategory = async (categoryData: Omit<ServiceMainCategory, 'id' | 'subcategories'>): Promise<string> => {
  try {
    // Check if category already exists by name and sector
    const { data: existing } = await supabase
      .from('service_categories')
      .select('id')
      .eq('name', categoryData.name)
      .eq('sector_id', categoryData.sector_id!)
      .maybeSingle();

    if (existing) {
      console.log(`Category "${categoryData.name}" already exists, returning existing ID`);
      return existing.id;
    }

    const { data, error } = await supabase
      .from('service_categories')
      .insert({
        name: categoryData.name,
        description: categoryData.description,
        position: categoryData.position,
        sector_id: categoryData.sector_id
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return data.id;
  } catch (error) {
    console.error('Failed to create service category:', error);
    throw error;
  }
};

export const createServiceSubcategory = async (subcategoryData: Omit<ServiceSubcategory, 'id' | 'jobs'>): Promise<string> => {
  try {
    // Check if subcategory already exists by name and category
    const { data: existing } = await supabase
      .from('service_subcategories')
      .select('id')
      .eq('name', subcategoryData.name)
      .eq('category_id', subcategoryData.category_id!)
      .maybeSingle();

    if (existing) {
      console.log(`Subcategory "${subcategoryData.name}" already exists, returning existing ID`);
      return existing.id;
    }

    const { data, error } = await supabase
      .from('service_subcategories')
      .insert({
        name: subcategoryData.name,
        description: subcategoryData.description,
        category_id: subcategoryData.category_id
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating subcategory:', error);
      throw error;
    }

    return data.id;
  } catch (error) {
    console.error('Failed to create service subcategory:', error);
    throw error;
  }
};

export const createServiceJob = async (jobData: Omit<ServiceJob, 'id'>): Promise<string> => {
  try {
    // Check if job already exists by name and subcategory
    const { data: existing } = await supabase
      .from('service_jobs')
      .select('id')
      .eq('name', jobData.name)
      .eq('subcategory_id', jobData.subcategory_id!)
      .maybeSingle();

    if (existing) {
      console.log(`Job "${jobData.name}" already exists, returning existing ID`);
      return existing.id;
    }

    const { data, error } = await supabase
      .from('service_jobs')
      .insert({
        name: jobData.name,
        description: jobData.description,
        estimated_time: jobData.estimatedTime,
        price: jobData.price,
        subcategory_id: jobData.subcategory_id
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating job:', error);
      throw error;
    }

    return data.id;
  } catch (error) {
    console.error('Failed to create service job:', error);
    throw error;
  }
};

// Batch import function with better error handling
export const batchImportServices = async (sectorsData: ServiceSector[]): Promise<void> => {
  console.log('Starting batch import of services...');
  
  try {
    for (const sector of sectorsData) {
      console.log(`Processing sector: ${sector.name}`);
      
      const sectorId = await createServiceSector({
        name: sector.name,
        description: sector.description,
        position: sector.position,
        is_active: sector.is_active
      });

      for (const category of sector.categories) {
        console.log(`Processing category: ${category.name}`);
        
        const categoryId = await createServiceCategory({
          name: category.name,
          description: category.description,
          position: category.position,
          sector_id: sectorId
        });

        for (const subcategory of category.subcategories) {
          console.log(`Processing subcategory: ${subcategory.name}`);
          
          const subcategoryId = await createServiceSubcategory({
            name: subcategory.name,
            description: subcategory.description,
            category_id: categoryId
          });

          for (const job of subcategory.jobs) {
            console.log(`Processing job: ${job.name}`);
            
            await createServiceJob({
              name: job.name,
              description: job.description,
              estimatedTime: job.estimatedTime,
              price: job.price,
              subcategory_id: subcategoryId
            });
          }
        }
      }
    }
    
    console.log('Batch import completed successfully');
  } catch (error) {
    console.error('Batch import failed:', error);
    throw error;
  }
};

// Delete functions
export const deleteServiceCategory = async (categoryId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete service category:', error);
    throw error;
  }
};

export const deleteServiceSubcategory = async (subcategoryId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('service_subcategories')
      .delete()
      .eq('id', subcategoryId);

    if (error) {
      console.error('Error deleting subcategory:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete service subcategory:', error);
    throw error;
  }
};

export const deleteServiceJob = async (jobId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('service_jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete service job:', error);
    throw error;
  }
};

// Update functions
export const updateServiceCategory = async (categoryId: string, updates: Partial<ServiceMainCategory>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('service_categories')
      .update({
        name: updates.name,
        description: updates.description,
        position: updates.position
      })
      .eq('id', categoryId);

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to update service category:', error);
    throw error;
  }
};

export const clearAllServiceData = async (): Promise<void> => {
  try {
    console.log('Clearing all service data...');
    
    // Delete in reverse order due to foreign key constraints
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('All service data cleared successfully');
  } catch (error) {
    console.error('Failed to clear service data:', error);
    throw error;
  }
};
