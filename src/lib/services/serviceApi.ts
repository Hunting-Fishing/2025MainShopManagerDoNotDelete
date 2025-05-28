
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  try {
    console.log('Fetching service categories from database...');
    
    // First try to get data from service_hierarchy table
    const { data: hierarchyData, error: hierarchyError } = await supabase
      .from('service_hierarchy')
      .select('*')
      .order('position', { ascending: true });

    if (hierarchyError) {
      console.error('Error fetching from service_hierarchy:', hierarchyError);
    }

    if (hierarchyData && hierarchyData.length > 0) {
      console.log('Found service hierarchy data:', hierarchyData);
      return transformHierarchyData(hierarchyData);
    }

    // Fallback to service_categories table
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching from service_categories:', categoriesError);
      throw new Error(`Failed to fetch service categories: ${categoriesError.message}`);
    }

    if (categoriesData && categoriesData.length > 0) {
      console.log('Found service categories data:', categoriesData);
      return transformCategoriesData(categoriesData);
    }

    console.log('No service data found in database');
    return [];

  } catch (error) {
    console.error('Error in fetchServiceCategories:', error);
    throw error;
  }
}

function transformHierarchyData(data: any[]): ServiceMainCategory[] {
  console.log('Transforming hierarchy data:', data);
  
  return data.map((item: any) => ({
    id: item.id,
    name: item.name || 'Unnamed Category',
    description: item.description || '',
    position: item.position || 0,
    subcategories: item.subcategories ? transformSubcategories(item.subcategories) : []
  }));
}

function transformCategoriesData(data: any[]): ServiceMainCategory[] {
  console.log('Transforming categories data:', data);
  
  return data.map((item: any, index: number) => ({
    id: item.id,
    name: item.name || 'Unnamed Category',
    description: item.description || '',
    position: index + 1,
    subcategories: []
  }));
}

function transformSubcategories(subcategories: any[]): any[] {
  if (!Array.isArray(subcategories)) {
    return [];
  }

  return subcategories.map((sub: any) => ({
    id: sub.id || `sub-${Date.now()}-${Math.random()}`,
    name: sub.name || 'Unnamed Subcategory',
    description: sub.description || '',
    jobs: sub.jobs ? transformJobs(sub.jobs) : []
  }));
}

function transformJobs(jobs: any[]): any[] {
  if (!Array.isArray(jobs)) {
    return [];
  }

  return jobs.map((job: any) => ({
    id: job.id || `job-${Date.now()}-${Math.random()}`,
    name: job.name || 'Unnamed Service',
    description: job.description || '',
    // Use job.price if it exists, otherwise undefined
    price: typeof job.price === 'number' ? job.price : undefined,
    // Use job.estimatedTime or job.estimated_time if they exist
    estimatedTime: job.estimatedTime || job.estimated_time || undefined
  }));
}

export async function saveServiceCategories(categories: ServiceMainCategory[]): Promise<void> {
  try {
    console.log('Saving service categories to database:', categories);

    // Clear existing data first
    await supabase.from('service_hierarchy').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert new categories
    for (const category of categories) {
      const { error } = await supabase
        .from('service_hierarchy')
        .insert({
          id: category.id,
          name: category.name,
          description: category.description || '',
          position: category.position || 0,
          subcategories: category.subcategories || []
        });

      if (error) {
        console.error('Error saving category:', error);
        throw error;
      }
    }

    console.log('Successfully saved all service categories');
  } catch (error) {
    console.error('Error in saveServiceCategories:', error);
    throw error;
  }
}

export async function deleteServiceCategory(categoryId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('service_hierarchy')
      .delete()
      .eq('id', categoryId);

    if (error) {
      throw error;
    }

    console.log('Successfully deleted service category:', categoryId);
  } catch (error) {
    console.error('Error deleting service category:', error);
    throw error;
  }
}

export async function updateServiceCategory(categoryId: string, updates: Partial<ServiceMainCategory>): Promise<void> {
  try {
    const { error } = await supabase
      .from('service_hierarchy')
      .update(updates)
      .eq('id', categoryId);

    if (error) {
      throw error;
    }

    console.log('Successfully updated service category:', categoryId);
  } catch (error) {
    console.error('Error updating service category:', error);
    throw error;
  }
}
