
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export interface ServiceCategoryUpdate {
  name?: string;
  description?: string;
}

// Main service categories functions
export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .select(`
        *,
        service_subcategories (
          *,
          service_jobs (*)
        )
      `)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching service categories:', error);
      throw error;
    }

    return (data || []).map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      position: category.position,
      subcategories: (category.service_subcategories || []).map((sub: any) => ({
        id: sub.id,
        name: sub.name,
        description: sub.description,
        category_id: sub.category_id,
        jobs: (sub.service_jobs || []).map((job: any) => ({
          id: job.id,
          name: job.name,
          description: job.description,
          estimatedTime: job.estimated_time,
          price: job.price,
          subcategory_id: job.subcategory_id
        }))
      }))
    }));
  } catch (error) {
    console.error('Failed to fetch service categories:', error);
    throw error;
  }
};

export const updateServiceCategory = async (
  categoryId: string, 
  updates: ServiceCategoryUpdate
): Promise<ServiceMainCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating service category:', error);
      throw error;
    }

    return {
      ...data,
      subcategories: []
    };
  } catch (error) {
    console.error('Failed to update service category:', error);
    throw error;
  }
};

export const createServiceCategory = async (
  category: Omit<ServiceMainCategory, 'id' | 'subcategories'>
): Promise<ServiceMainCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .insert({
        name: category.name,
        description: category.description
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating service category:', error);
      throw error;
    }

    return {
      ...data,
      subcategories: []
    };
  } catch (error) {
    console.error('Failed to create service category:', error);
    throw error;
  }
};

export const deleteServiceCategory = async (categoryId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting service category:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete service category:', error);
    throw error;
  }
};

// Subcategory functions
export const createServiceSubcategory = async (
  subcategory: Omit<ServiceSubcategory, 'id' | 'jobs'>
): Promise<ServiceSubcategory | null> => {
  try {
    const { data, error } = await supabase
      .from('service_subcategories')
      .insert({
        name: subcategory.name,
        description: subcategory.description,
        category_id: subcategory.category_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating service subcategory:', error);
      throw error;
    }

    return {
      ...data,
      jobs: []
    };
  } catch (error) {
    console.error('Failed to create service subcategory:', error);
    throw error;
  }
};

export const updateServiceSubcategory = async (
  subcategoryId: string,
  updates: Partial<ServiceSubcategory>
): Promise<ServiceSubcategory | null> => {
  try {
    const { data, error } = await supabase
      .from('service_subcategories')
      .update(updates)
      .eq('id', subcategoryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating service subcategory:', error);
      throw error;
    }

    return {
      ...data,
      jobs: []
    };
  } catch (error) {
    console.error('Failed to update service subcategory:', error);
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
      console.error('Error deleting service subcategory:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete service subcategory:', error);
    throw error;
  }
};

// Job functions
export const createServiceJob = async (
  job: Omit<ServiceJob, 'id'>
): Promise<ServiceJob | null> => {
  try {
    const { data, error } = await supabase
      .from('service_jobs')
      .insert({
        name: job.name,
        description: job.description,
        estimated_time: job.estimatedTime,
        price: job.price,
        subcategory_id: job.subcategory_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating service job:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      estimatedTime: data.estimated_time,
      price: data.price,
      subcategory_id: data.subcategory_id
    };
  } catch (error) {
    console.error('Failed to create service job:', error);
    throw error;
  }
};

export const updateServiceJob = async (
  jobId: string,
  updates: Partial<ServiceJob>
): Promise<ServiceJob | null> => {
  try {
    const { data, error } = await supabase
      .from('service_jobs')
      .update({
        name: updates.name,
        description: updates.description,
        estimated_time: updates.estimatedTime,
        price: updates.price
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('Error updating service job:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      estimatedTime: data.estimated_time,
      price: data.price,
      subcategory_id: data.subcategory_id
    };
  } catch (error) {
    console.error('Failed to update service job:', error);
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
      console.error('Error deleting service job:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete service job:', error);
    throw error;
  }
};

// Bulk import function
export const bulkImportServices = async (serviceData: any[]): Promise<void> => {
  try {
    // Implementation for bulk import would go here
    console.log('Bulk importing services:', serviceData);
    // This would involve processing the serviceData and inserting into the database
  } catch (error) {
    console.error('Failed to bulk import services:', error);
    throw error;
  }
};

// Debug function
export const fetchRawServiceData = async (): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*');

    if (error) {
      console.error('Error fetching raw service data:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch raw service data:', error);
    throw error;
  }
};
