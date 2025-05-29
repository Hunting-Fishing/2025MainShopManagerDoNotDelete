import { supabase } from '@/lib/supabase';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  console.log('Fetching service categories from database...');

  const { data, error } = await supabase
    .from('service_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching service categories:', error);
    throw new Error(`Failed to fetch service categories: ${error.message}`);
  }

  console.log('Fetched service categories:', data);
  return data || [];
}

export async function updateServiceCategory(id: string, updates: Partial<ServiceMainCategory>): Promise<ServiceMainCategory> {
  console.log('Updating service category:', id, updates);
  
  const { data, error } = await supabase
    .from('service_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating service category:', error);
    throw new Error(`Failed to update service category: ${error.message}`);
  }

  console.log('Updated service category:', data);
  return data;
}

export async function deleteServiceCategory(id: string): Promise<void> {
  console.log('Deleting service category:', id);
  
  const { error } = await supabase
    .from('service_categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service category:', error);
    throw new Error(`Failed to delete service category: ${error.message}`);
  }

  console.log('Deleted service category:', id);
}

export async function deleteServiceSubcategory(id: string): Promise<void> {
  console.log('Deleting service subcategory:', id);
  
  const { error } = await supabase
    .from('service_subcategories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service subcategory:', error);
    throw new Error(`Failed to delete service subcategory: ${error.message}`);
  }

  console.log('Deleted service subcategory:', id);
}

export async function deleteServiceJob(id: string): Promise<void> {
  console.log('Deleting service job:', id);
  
  const { error } = await supabase
    .from('service_jobs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service job:', error);
    throw new Error(`Failed to delete service job: ${error.message}`);
  }

  console.log('Deleted service job:', id);
}

export async function fetchRawServiceData() {
  console.log('Fetching raw service data from all tables...');
  
  try {
    const [categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
      supabase.from('service_categories').select('*'),
      supabase.from('service_subcategories').select('*'),
      supabase.from('service_jobs').select('*')
    ]);

    const rawData = {
      categories: categoriesResult.data || [],
      subcategories: subcategoriesResult.data || [],
      jobs: jobsResult.data || [],
      errors: {
        categories: categoriesResult.error,
        subcategories: subcategoriesResult.error,
        jobs: jobsResult.error
      }
    };

    console.log('Raw service data:', rawData);
    return rawData;
  } catch (error) {
    console.error('Error fetching raw service data:', error);
    throw error;
  }
}
