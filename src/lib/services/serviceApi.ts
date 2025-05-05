import { supabase } from '@/lib/supabase';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";

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

// Function to update a category name
export async function updateCategoryName(categoryId: string, newName: string): Promise<void> {
  try {
    // First, fetch the category
    const { data, error: fetchError } = await supabase
      .from('service_hierarchy')
      .select('*')
      .eq('id', categoryId)
      .single();
      
    if (fetchError) {
      throw new Error(`Error fetching category: ${fetchError.message}`);
    }
    
    if (!data) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }
    
    // Update the name
    data.name = newName;
    
    // Save the updated category
    const { error: updateError } = await supabase
      .from('service_hierarchy')
      .update(data)
      .eq('id', categoryId);
      
    if (updateError) {
      throw new Error(`Error updating category name: ${updateError.message}`);
    }
  } catch (error) {
    console.error("Error updating category name:", error);
    throw error;
  }
}

// Function to update a subcategory name
export async function updateSubcategoryName(categoryId: string, subcategoryId: string, newName: string): Promise<void> {
  try {
    // First, fetch the category
    const { data: category, error: fetchError } = await supabase
      .from('service_hierarchy')
      .select('*')
      .eq('id', categoryId)
      .single();
      
    if (fetchError) {
      throw new Error(`Error fetching category: ${fetchError.message}`);
    }
    
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }
    
    // Find the subcategory to update
    const subcategoryIndex = category.subcategories.findIndex(
      sub => sub.id === subcategoryId
    );
    
    if (subcategoryIndex === -1) {
      throw new Error(`Subcategory with ID ${subcategoryId} not found in category ${categoryId}`);
    }
    
    // Update the name
    category.subcategories[subcategoryIndex].name = newName;
    
    // Save the updated category
    const { error: updateError } = await supabase
      .from('service_hierarchy')
      .update(category)
      .eq('id', categoryId);
      
    if (updateError) {
      throw new Error(`Error updating subcategory name: ${updateError.message}`);
    }
  } catch (error) {
    console.error("Error updating subcategory name:", error);
    throw error;
  }
}

// Function to update a job name
export async function updateJobName(categoryId: string, subcategoryId: string, jobId: string, newName: string): Promise<void> {
  try {
    // First, fetch the category
    const { data: category, error: fetchError } = await supabase
      .from('service_hierarchy')
      .select('*')
      .eq('id', categoryId)
      .single();
      
    if (fetchError) {
      throw new Error(`Error fetching category: ${fetchError.message}`);
    }
    
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }
    
    // Find the subcategory
    const subcategoryIndex = category.subcategories.findIndex(
      sub => sub.id === subcategoryId
    );
    
    if (subcategoryIndex === -1) {
      throw new Error(`Subcategory with ID ${subcategoryId} not found in category ${categoryId}`);
    }
    
    // Find the job to update
    const jobIndex = category.subcategories[subcategoryIndex].jobs.findIndex(
      job => job.id === jobId
    );
    
    if (jobIndex === -1) {
      throw new Error(`Job with ID ${jobId} not found in subcategory ${subcategoryId}`);
    }
    
    // Update the name
    category.subcategories[subcategoryIndex].jobs[jobIndex].name = newName;
    
    // Save the updated category
    const { error: updateError } = await supabase
      .from('service_hierarchy')
      .update(category)
      .eq('id', categoryId);
      
    if (updateError) {
      throw new Error(`Error updating job name: ${updateError.message}`);
    }
  } catch (error) {
    console.error("Error updating job name:", error);
    throw error;
  }
}

// Function to add a new subcategory to a category
export async function addSubcategoryToCategory(categoryId: string, subcategory: ServiceSubcategory): Promise<ServiceMainCategory> {
  try {
    // First, fetch the category
    const { data: category, error: fetchError } = await supabase
      .from('service_hierarchy')
      .select('*')
      .eq('id', categoryId)
      .single();
      
    if (fetchError) {
      throw new Error(`Error fetching category: ${fetchError.message}`);
    }
    
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }
    
    // Add the new subcategory to the category's subcategories array
    category.subcategories.push(subcategory);
    
    // Save the updated category
    const { data: updatedCategory, error: updateError } = await supabase
      .from('service_hierarchy')
      .update(category)
      .eq('id', categoryId)
      .select()
      .single();
      
    if (updateError) {
      throw new Error(`Error adding subcategory: ${updateError.message}`);
    }
    
    return updatedCategory;
  } catch (error) {
    console.error("Error adding subcategory:", error);
    throw error;
  }
}

// Function to add a new service/job to a subcategory
export async function addServiceToSubcategory(
  categoryId: string, 
  subcategoryId: string, 
  service: ServiceJob
): Promise<ServiceMainCategory> {
  try {
    // First, fetch the category
    const { data: category, error: fetchError } = await supabase
      .from('service_hierarchy')
      .select('*')
      .eq('id', categoryId)
      .single();
      
    if (fetchError) {
      throw new Error(`Error fetching category: ${fetchError.message}`);
    }
    
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }
    
    // Find the subcategory
    const subcategoryIndex = category.subcategories.findIndex(
      sub => sub.id === subcategoryId
    );
    
    if (subcategoryIndex === -1) {
      throw new Error(`Subcategory with ID ${subcategoryId} not found in category ${categoryId}`);
    }
    
    // Add the new service to the subcategory's jobs array
    category.subcategories[subcategoryIndex].jobs.push(service);
    
    // Save the updated category
    const { data: updatedCategory, error: updateError } = await supabase
      .from('service_hierarchy')
      .update(category)
      .eq('id', categoryId)
      .select()
      .single();
      
    if (updateError) {
      throw new Error(`Error adding service: ${updateError.message}`);
    }
    
    return updatedCategory;
  } catch (error) {
    console.error("Error adding service:", error);
    throw error;
  }
}

// Function to bulk import service categories
export async function bulkImportServiceCategories(
  categories: ServiceMainCategory[], 
  progressCallback?: (progress: number) => void
): Promise<void> {
  try {
    const totalCategories = categories.length;
    
    for (let i = 0; i < totalCategories; i++) {
      // Save each category
      await saveServiceCategory(categories[i]);
      
      // Report progress if callback provided
      if (progressCallback) {
        const progress = (i + 1) / totalCategories;
        progressCallback(progress);
      }
    }
  } catch (error) {
    console.error("Error bulk importing service categories:", error);
    throw error;
  }
}
