
import { supabase } from '@/lib/supabase';
import { ServiceMainCategory } from "@/types/serviceHierarchy";

// Function to fetch all service categories
export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  const { data, error } = await supabase
    .from('service_hierarchy')
    .select('*')
    .order('position');
  
  if (error) {
    throw new Error(`Error fetching service categories: ${error.message}`);
  }
  
  return data || [];
}

// Function to save a service category
export async function saveServiceCategory(category: ServiceMainCategory): Promise<ServiceMainCategory> {
  const { data, error } = await supabase
    .from('service_hierarchy')
    .upsert(category)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Error saving service category: ${error.message}`);
  }
  
  return data;
}

// Function to delete a service category
export async function deleteServiceCategory(id: string): Promise<string> {
  const { error } = await supabase
    .from('service_hierarchy')
    .delete()
    .eq('id', id);
  
  if (error) {
    throw new Error(`Error deleting service category: ${error.message}`);
  }
  
  return id; // Return the ID of the deleted category
}

// Function to bulk import service categories with progress tracking
export async function bulkImportServiceCategories(
  categories: ServiceMainCategory[], 
  progressCallback?: (progress: number) => void
): Promise<void> {
  if (!categories || categories.length === 0) {
    throw new Error("No categories to import");
  }
  
  // For large datasets, import in batches
  const BATCH_SIZE = 5; // Smaller batch size for better progress reporting
  let completedBatches = 0;
  const totalBatches = Math.ceil(categories.length / BATCH_SIZE);
  
  for (let i = 0; i < categories.length; i += BATCH_SIZE) {
    const batch = categories.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('service_hierarchy')
      .upsert(batch);
    
    if (error) {
      throw new Error(`Error importing service categories (batch ${completedBatches + 1}/${totalBatches}): ${error.message}`);
    }
    
    completedBatches++;
    
    // Report progress
    if (progressCallback) {
      progressCallback(completedBatches / totalBatches);
    }
    
    // Small delay to prevent overwhelming the database
    if (i + BATCH_SIZE < categories.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

// Function to remove duplicate items from the service hierarchy
export async function removeDuplicateItem(
  itemId: string, 
  type: 'category' | 'subcategory' | 'job'
): Promise<void> {
  try {
    // First, fetch the categories
    const { data: categories, error: fetchError } = await supabase
      .from('service_hierarchy')
      .select('*');
      
    if (fetchError) {
      throw new Error(`Error fetching service categories: ${fetchError.message}`);
    }
    
    if (!categories || categories.length === 0) {
      throw new Error("No categories found");
    }
    
    // Find the category that contains the item to remove
    let updatedCategory: ServiceMainCategory | null = null;
    
    if (type === 'category') {
      // For categories, simply delete the category
      const { error } = await supabase
        .from('service_hierarchy')
        .delete()
        .eq('id', itemId);
        
      if (error) throw new Error(`Error deleting category: ${error.message}`);
      return;
    }
    
    // For subcategories and jobs, we need to find and update the parent category
    for (const category of categories) {
      if (type === 'subcategory') {
        // Find if this category contains the subcategory
        const subcategoryIndex = category.subcategories.findIndex(
          sub => sub.id === itemId
        );
        
        if (subcategoryIndex !== -1) {
          // Make a deep copy of the category
          const updatedCat = JSON.parse(JSON.stringify(category));
          // Remove the subcategory
          updatedCat.subcategories.splice(subcategoryIndex, 1);
          updatedCategory = updatedCat;
          break;
        }
      } else if (type === 'job') {
        // Find which subcategory contains this job
        for (let i = 0; i < category.subcategories.length; i++) {
          const subcategory = category.subcategories[i];
          const jobIndex = subcategory.jobs.findIndex(job => job.id === itemId);
          
          if (jobIndex !== -1) {
            // Make a deep copy of the category
            const updatedCat = JSON.parse(JSON.stringify(category));
            // Remove the job
            updatedCat.subcategories[i].jobs.splice(jobIndex, 1);
            updatedCategory = updatedCat;
            break;
          }
        }
        
        if (updatedCategory) break;
      }
    }
    
    // If we found and modified a category, update it
    if (updatedCategory) {
      const { error: updateError } = await supabase
        .from('service_hierarchy')
        .update(updatedCategory)
        .eq('id', updatedCategory.id);
        
      if (updateError) {
        throw new Error(`Error updating service hierarchy: ${updateError.message}`);
      }
    } else {
      throw new Error(`Item with ID ${itemId} not found in the service hierarchy`);
    }
  } catch (error) {
    console.error("Error removing duplicate item:", error);
    throw error;
  }
}
