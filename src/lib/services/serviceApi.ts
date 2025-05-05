
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { createEmptyCategory, createEmptySubcategory, createEmptyJob } from './serviceUtils';
import { supabase } from "@/integrations/supabase/client";

// Fetch service categories from API
export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  try {
    const { data, error } = await supabase
      .from('service_hierarchy')
      .select('*')
      .order('position', { ascending: true });
    
    if (error) {
      console.error('Error fetching service categories:', error);
      throw error;
    }
    
    return data as ServiceMainCategory[];
  } catch (error) {
    console.error('Failed to fetch service categories:', error);
    throw error;
  }
}

// Update service item name (category, subcategory, or job)
export async function updateServiceItemName(
  itemId: string, 
  newName: string, 
  type: 'category' | 'subcategory' | 'job'
): Promise<boolean> {
  console.log(`Updating ${type} ${itemId} with new name: ${newName}`);
  
  try {
    if (type === 'category') {
      const { error } = await supabase
        .from('service_hierarchy')
        .update({ name: newName })
        .eq('id', itemId);
        
      if (error) throw error;
    } else if (type === 'subcategory' || type === 'job') {
      // First get the category that contains this subcategory or job
      const { data: categories, error: fetchError } = await supabase
        .from('service_hierarchy')
        .select('*');
        
      if (fetchError) throw fetchError;
      
      // Find the category and update the nested item
      for (const category of categories) {
        if (type === 'subcategory') {
          const subcategoryIndex = category.subcategories.findIndex((s: ServiceSubcategory) => s.id === itemId);
          if (subcategoryIndex >= 0) {
            const updatedSubcategories = [...category.subcategories];
            updatedSubcategories[subcategoryIndex].name = newName;
            
            const { error } = await supabase
              .from('service_hierarchy')
              .update({ subcategories: updatedSubcategories })
              .eq('id', category.id);
              
            if (error) throw error;
            break;
          }
        } else if (type === 'job') {
          let updated = false;
          
          const updatedSubcategories = category.subcategories.map((subcategory: ServiceSubcategory) => {
            const jobIndex = subcategory.jobs.findIndex((j: ServiceJob) => j.id === itemId);
            if (jobIndex >= 0) {
              updated = true;
              const updatedJobs = [...subcategory.jobs];
              updatedJobs[jobIndex].name = newName;
              return { ...subcategory, jobs: updatedJobs };
            }
            return subcategory;
          });
          
          if (updated) {
            const { error } = await supabase
              .from('service_hierarchy')
              .update({ subcategories: updatedSubcategories })
              .eq('id', category.id);
              
            if (error) throw error;
            break;
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating ${type}:`, error);
    return false;
  }
}

// Delete a service item (category, subcategory, or job)
export async function deleteServiceItem(
  itemId: string, 
  type: 'category' | 'subcategory' | 'job'
): Promise<boolean> {
  console.log(`Deleting ${type} with ID: ${itemId}`);
  
  try {
    if (type === 'category') {
      const { error } = await supabase
        .from('service_hierarchy')
        .delete()
        .eq('id', itemId);
        
      if (error) throw error;
    } else if (type === 'subcategory' || type === 'job') {
      // First get the category that contains this subcategory or job
      const { data: categories, error: fetchError } = await supabase
        .from('service_hierarchy')
        .select('*');
        
      if (fetchError) throw fetchError;
      
      // Find the category and remove the nested item
      for (const category of categories) {
        if (type === 'subcategory') {
          const filteredSubcategories = category.subcategories.filter(
            (s: ServiceSubcategory) => s.id !== itemId
          );
          
          if (filteredSubcategories.length < category.subcategories.length) {
            const { error } = await supabase
              .from('service_hierarchy')
              .update({ subcategories: filteredSubcategories })
              .eq('id', category.id);
              
            if (error) throw error;
            break;
          }
        } else if (type === 'job') {
          let updated = false;
          
          const updatedSubcategories = category.subcategories.map((subcategory: ServiceSubcategory) => {
            const filteredJobs = subcategory.jobs.filter((j: ServiceJob) => j.id !== itemId);
            
            if (filteredJobs.length < subcategory.jobs.length) {
              updated = true;
              return { ...subcategory, jobs: filteredJobs };
            }
            return subcategory;
          });
          
          if (updated) {
            const { error } = await supabase
              .from('service_hierarchy')
              .update({ subcategories: updatedSubcategories })
              .eq('id', category.id);
              
            if (error) throw error;
            break;
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting ${type}:`, error);
    return false;
  }
}

// Add a new subcategory to a category
export async function addSubcategory(
  categoryId: string,
  subcategoryName?: string
): Promise<ServiceSubcategory> {
  console.log(`Adding subcategory to category ${categoryId}`);
  
  try {
    // Create a new empty subcategory
    const newSubcategory = createEmptySubcategory(subcategoryName || 'New Subcategory');
    
    // Fetch the current category
    const { data: category, error: fetchError } = await supabase
      .from('service_hierarchy')
      .select('*')
      .eq('id', categoryId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Add the new subcategory
    const updatedSubcategories = [...category.subcategories, newSubcategory];
    
    const { error: updateError } = await supabase
      .from('service_hierarchy')
      .update({ subcategories: updatedSubcategories })
      .eq('id', categoryId);
      
    if (updateError) throw updateError;
    
    return newSubcategory;
  } catch (error) {
    console.error('Error adding subcategory:', error);
    throw error;
  }
}

// Add a new job to a subcategory
export async function addJob(
  categoryId: string,
  subcategoryId: string,
  jobName?: string
): Promise<ServiceJob> {
  console.log(`Adding job to subcategory ${subcategoryId} in category ${categoryId}`);
  
  try {
    // Create a new empty job
    const newJob = createEmptyJob(jobName || 'New Service');
    
    // Fetch the current category
    const { data: category, error: fetchError } = await supabase
      .from('service_hierarchy')
      .select('*')
      .eq('id', categoryId)
      .single();
      
    if (fetchError) throw fetchError;
    
    // Find the subcategory and add the job
    const updatedSubcategories = category.subcategories.map((subcategory: ServiceSubcategory) => {
      if (subcategory.id === subcategoryId) {
        return {
          ...subcategory,
          jobs: [...subcategory.jobs, newJob]
        };
      }
      return subcategory;
    });
    
    const { error: updateError } = await supabase
      .from('service_hierarchy')
      .update({ subcategories: updatedSubcategories })
      .eq('id', categoryId);
      
    if (updateError) throw updateError;
    
    return newJob;
  } catch (error) {
    console.error('Error adding job:', error);
    throw error;
  }
}

// Bulk import service categories
export async function bulkImportServiceCategories(
  data: any[],
  progressCallback?: (progress: number) => void
): Promise<ServiceMainCategory[]> {
  try {
    let progress = 0;
    progressCallback?.(progress);
    
    // Process the data and prepare it for insertion
    const processedData = data.map((item, index) => {
      progress = Math.floor((index / data.length) * 50);
      progressCallback?.(progress);
      
      // Transform the data into the correct format
      // This would depend on your input format
      return {
        name: item.name || `Category ${index + 1}`,
        description: item.description || '',
        subcategories: item.subcategories || [],
        position: index + 1
      };
    });
    
    progressCallback?.(50);
    
    // Insert the data into Supabase
    const { data: insertedData, error } = await supabase
      .from('service_hierarchy')
      .insert(processedData)
      .select();
      
    if (error) throw error;
    
    progressCallback?.(100);
    
    return insertedData as ServiceMainCategory[];
  } catch (error) {
    console.error('Error bulk importing service categories:', error);
    throw error;
  }
}

// Remove a duplicate item from the service hierarchy
export async function removeDuplicateItem(
  itemId: string,
  type: 'category' | 'subcategory' | 'job'
): Promise<boolean> {
  // This is essentially the same as deleteServiceItem
  return deleteServiceItem(itemId, type);
}
