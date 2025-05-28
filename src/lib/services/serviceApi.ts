import { supabase } from '@/lib/supabase';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      throw error;
    }

    return data.map(category => ({
      ...category,
      subcategories: category.subcategories ? JSON.parse(category.subcategories) : []
    }));
  } catch (error) {
    console.error("Error fetching service categories:", error);
    throw error;
  }
}

export async function createServiceCategory(category: Omit<ServiceMainCategory, 'id'>): Promise<ServiceMainCategory> {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .insert({
        name: category.name,
        description: category.description,
        position: category.position,
        subcategories: JSON.stringify(category.subcategories || [])
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      subcategories: data.subcategories ? JSON.parse(data.subcategories) : []
    };
  } catch (error) {
    console.error("Error creating service category:", error);
    throw error;
  }
}

export async function updateServiceCategory(category: ServiceMainCategory): Promise<ServiceMainCategory> {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .update({
        name: category.name,
        description: category.description,
        position: category.position,
        subcategories: JSON.stringify(category.subcategories || [])
      })
      .eq('id', category.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      subcategories: data.subcategories ? JSON.parse(data.subcategories) : []
    };
  } catch (error) {
    console.error("Error updating service category:", error);
    throw error;
  }
}

export async function deleteServiceCategory(categoryId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting service category:", error);
    throw error;
  }
}

export async function bulkImportServiceCategories(
  categories: ServiceMainCategory[], 
  onProgress?: (progress: number) => void
): Promise<void> {
  try {
    const total = categories.length;
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      
      // Convert subcategories to JSON for storage
      const categoryData = {
        name: category.name,
        description: category.description,
        position: category.position,
        subcategories: JSON.stringify(category.subcategories || [])
      };
      
      const { error } = await supabase
        .from('service_categories')
        .insert(categoryData);
        
      if (error) {
        throw new Error(`Failed to import category ${category.name}: ${error.message}`);
      }
      
      // Report progress
      if (onProgress) {
        onProgress((i + 1) / total);
      }
    }
  } catch (error) {
    console.error('Bulk import error:', error);
    throw error;
  }
}

export async function saveServiceCategory(category: ServiceMainCategory): Promise<ServiceMainCategory> {
  return saveServiceCategories([category]);
}

export async function saveServiceCategories(categories: ServiceMainCategory[]): Promise<ServiceMainCategory> {
  try {
    const categoryData = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      position: category.position,
      subcategories: JSON.stringify(category.subcategories || [])
    }));

    const { data, error } = await supabase
      .from('service_categories')
      .upsert(categoryData)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      subcategories: data.subcategories ? JSON.parse(data.subcategories) : []
    };
  } catch (error) {
    console.error('Error saving service categories:', error);
    throw error;
  }
}

export async function deleteServiceSubcategory(categoryId: string, subcategoryId: string): Promise<void> {
  try {
    // Get the current category
    const { data: category, error: fetchError } = await supabase
      .from('service_categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (fetchError) throw fetchError;

    // Parse subcategories and remove the one with matching ID
    const subcategories = category.subcategories ? JSON.parse(category.subcategories) : [];
    const updatedSubcategories = subcategories.filter((sub: ServiceSubcategory) => sub.id !== subcategoryId);

    // Update the category with the filtered subcategories
    const { error: updateError } = await supabase
      .from('service_categories')
      .update({ subcategories: JSON.stringify(updatedSubcategories) })
      .eq('id', categoryId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    throw error;
  }
}

export async function deleteServiceJob(categoryId: string, subcategoryId: string, jobId: string): Promise<void> {
  try {
    // Get the current category
    const { data: category, error: fetchError } = await supabase
      .from('service_categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (fetchError) throw fetchError;

    // Parse subcategories and find the one to update
    const subcategories = category.subcategories ? JSON.parse(category.subcategories) : [];
    const updatedSubcategories = subcategories.map((sub: ServiceSubcategory) => {
      if (sub.id === subcategoryId) {
        return {
          ...sub,
          jobs: sub.jobs?.filter((job: ServiceJob) => job.id !== jobId) || []
        };
      }
      return sub;
    });

    // Update the category with the modified subcategories
    const { error: updateError } = await supabase
      .from('service_categories')
      .update({ subcategories: JSON.stringify(updatedSubcategories) })
      .eq('id', categoryId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
}

export async function removeDuplicateItem(duplicateItem: any): Promise<void> {
  // Implementation for removing duplicate items
  // This would depend on the specific requirements for handling duplicates
  console.log('Removing duplicate item:', duplicateItem);
}
