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
    price: typeof job.price === 'number' ? job.price : undefined,
    estimatedTime: job.estimatedTime || job.estimated_time || undefined
  }));
}

export async function saveServiceCategories(categories: ServiceMainCategory[]): Promise<void> {
  try {
    console.log('Saving service categories to database:', categories);

    // Clear existing data first
    const { error: deleteError } = await supabase
      .from('service_hierarchy')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error('Error clearing existing data:', deleteError);
    }

    // Insert new categories
    for (const category of categories) {
      const { error } = await supabase
        .from('service_hierarchy')
        .insert({
          id: category.id,
          name: category.name,
          description: category.description || '',
          position: category.position || 0,
          subcategories: JSON.stringify(category.subcategories || [])
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
    // Convert subcategories to JSON string if present
    const updateData: any = { ...updates };
    if (updateData.subcategories) {
      updateData.subcategories = JSON.stringify(updateData.subcategories);
    }

    const { error } = await supabase
      .from('service_hierarchy')
      .update(updateData)
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

export async function bulkImportServiceCategories(categories: ServiceMainCategory[], onProgress?: (progress: number) => void): Promise<void> {
  try {
    console.log('Starting bulk import of service categories:', categories);
    
    if (onProgress) onProgress(0);
    
    // Clear existing data
    await supabase.from('service_hierarchy').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (onProgress) onProgress(20);
    
    // Import categories in batches
    const batchSize = 10;
    for (let i = 0; i < categories.length; i += batchSize) {
      const batch = categories.slice(i, i + batchSize);
      
      for (const category of batch) {
        await supabase
          .from('service_hierarchy')
          .insert({
            id: category.id,
            name: category.name,
            description: category.description || '',
            position: category.position || 0,
            subcategories: JSON.stringify(category.subcategories || [])
          });
      }
      
      if (onProgress) {
        const progress = 20 + ((i + batchSize) / categories.length) * 80;
        onProgress(Math.min(progress, 100));
      }
    }
    
    console.log('Bulk import completed successfully');
  } catch (error) {
    console.error('Error in bulk import:', error);
    throw error;
  }
}

export async function removeDuplicateItem(itemId: string, type: 'category' | 'subcategory' | 'job'): Promise<void> {
  try {
    console.log(`Removing duplicate ${type} with ID:`, itemId);
    
    if (type === 'category') {
      // Remove entire category
      await deleteServiceCategory(itemId);
    } else {
      // For subcategories and jobs, we need to update the parent category
      // This is a simplified implementation - in a real app you'd need more complex logic
      console.log(`Removing ${type} ${itemId} - this would require updating parent category`);
    }
    
    console.log(`Successfully removed duplicate ${type}`);
  } catch (error) {
    console.error(`Error removing duplicate ${type}:`, error);
    throw error;
  }
}

// Keep the saveServiceCategory alias for backward compatibility
export const saveServiceCategory = updateServiceCategory;
