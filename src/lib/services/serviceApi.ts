
import { supabase } from '@/lib/supabase';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { v4 as uuidv4 } from 'uuid';
import { PostgrestResponse } from '@supabase/supabase-js';

// Type for the raw Supabase data
interface RawServiceCategory {
  id: string;
  name: string;
  description?: string;
  position?: number;
  subcategories: any; // This will be parsed from JSON
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch all service categories with their subcategories and jobs
 */
export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  try {
    const { data, error }: PostgrestResponse<RawServiceCategory> = await supabase
      .from('service_categories')
      .select('*')
      .order('position');

    if (error) {
      console.error('Error fetching service categories:', error);
      throw new Error(error.message);
    }

    // Process the raw data to match our types
    return data.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      position: category.position,
      // Parse subcategories from JSON and cast to our expected type
      subcategories: Array.isArray(category.subcategories) 
        ? category.subcategories.map((sub: any) => ({
            id: sub.id,
            name: sub.name,
            description: sub.description,
            jobs: Array.isArray(sub.jobs) 
              ? sub.jobs.map((job: any) => ({
                  id: job.id,
                  name: job.name,
                  description: job.description,
                  estimatedTime: job.estimatedTime,
                  price: job.price
                }))
              : []
          }))
        : []
    }));
  } catch (error) {
    console.error('Error in fetchServiceCategories:', error);
    throw error;
  }
}

/**
 * Update a service item's name
 */
export async function updateServiceItemName(
  type: 'category' | 'subcategory' | 'job',
  itemId: string,
  categoryId: string,
  subcategoryId: string | null,
  newName: string
): Promise<void> {
  try {
    if (type === 'category') {
      // Direct update for category name
      const { error } = await supabase
        .from('service_categories')
        .update({ name: newName })
        .eq('id', itemId);
        
      if (error) throw new Error(error.message);
    } else {
      // For subcategory or job, we need to update the nested JSON
      const { data, error } = await supabase
        .from('service_categories')
        .select('subcategories')
        .eq('id', categoryId)
        .single();
        
      if (error) throw new Error(error.message);
      
      // Parse subcategories
      const subcategories = data.subcategories as any[];
      
      if (type === 'subcategory') {
        // Find and update subcategory
        const subcategoryIndex = subcategories.findIndex(sub => sub.id === itemId);
        if (subcategoryIndex >= 0) {
          subcategories[subcategoryIndex].name = newName;
        }
      } else if (type === 'job' && subcategoryId) {
        // Find subcategory
        const subcategory = subcategories.find(sub => sub.id === subcategoryId);
        if (subcategory) {
          // Find and update job
          const jobs = subcategory.jobs as any[];
          const jobIndex = jobs.findIndex(job => job.id === itemId);
          if (jobIndex >= 0) {
            jobs[jobIndex].name = newName;
          }
        }
      }
      
      // Update in database
      const { error: updateError } = await supabase
        .from('service_categories')
        .update({ subcategories })
        .eq('id', categoryId);
        
      if (updateError) throw new Error(updateError.message);
    }
  } catch (error) {
    console.error('Error updating service item name:', error);
    throw error;
  }
}

/**
 * Delete a service item
 */
export async function deleteServiceItem(
  type: 'category' | 'subcategory' | 'job',
  itemId: string,
  categoryId: string,
  subcategoryId: string | null
): Promise<void> {
  try {
    if (type === 'category') {
      // Delete the category directly
      const { error } = await supabase
        .from('service_categories')
        .delete()
        .eq('id', itemId);
        
      if (error) throw new Error(error.message);
    } else {
      // For subcategory or job, we need to update the nested JSON
      const { data, error } = await supabase
        .from('service_categories')
        .select('subcategories')
        .eq('id', categoryId)
        .single();
        
      if (error) throw new Error(error.message);
      
      // Parse subcategories
      let subcategories = data.subcategories as any[];
      
      if (type === 'subcategory') {
        // Remove subcategory
        subcategories = subcategories.filter(sub => sub.id !== itemId);
      } else if (type === 'job' && subcategoryId) {
        // Find subcategory
        const subcategoryIndex = subcategories.findIndex(sub => sub.id === subcategoryId);
        if (subcategoryIndex >= 0) {
          // Remove job from jobs array
          subcategories[subcategoryIndex].jobs = subcategories[subcategoryIndex].jobs.filter(
            (job: any) => job.id !== itemId
          );
        }
      }
      
      // Update in database
      const { error: updateError } = await supabase
        .from('service_categories')
        .update({ subcategories })
        .eq('id', categoryId);
        
      if (updateError) throw new Error(updateError.message);
    }
  } catch (error) {
    console.error('Error deleting service item:', error);
    throw error;
  }
}

/**
 * Add a new subcategory to a category
 */
export async function addSubcategory(
  categoryId: string,
  name: string,
  description?: string
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .select('subcategories')
      .eq('id', categoryId)
      .single();
      
    if (error) throw new Error(error.message);
    
    // Parse subcategories
    const subcategories = data.subcategories as any[] || [];
    
    // Create new subcategory
    const newSubcategory = {
      id: uuidv4(),
      name,
      description: description || '',
      jobs: []
    };
    
    // Add to subcategories
    subcategories.push(newSubcategory);
    
    // Update in database
    const { error: updateError } = await supabase
      .from('service_categories')
      .update({ subcategories })
      .eq('id', categoryId);
      
    if (updateError) throw new Error(updateError.message);
    
    return newSubcategory.id;
  } catch (error) {
    console.error('Error adding subcategory:', error);
    throw error;
  }
}

/**
 * Add a new job to a subcategory
 */
export async function addJob(
  categoryId: string,
  subcategoryId: string,
  name: string,
  description?: string,
  estimatedTime?: number,
  price?: number
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .select('subcategories')
      .eq('id', categoryId)
      .single();
      
    if (error) throw new Error(error.message);
    
    // Parse subcategories
    const subcategories = data.subcategories as any[];
    
    // Find subcategory
    const subcategoryIndex = subcategories.findIndex(sub => sub.id === subcategoryId);
    if (subcategoryIndex === -1) {
      throw new Error('Subcategory not found');
    }
    
    // Create new job
    const newJob = {
      id: uuidv4(),
      name,
      description: description || '',
      estimatedTime: estimatedTime || 0,
      price: price || 0
    };
    
    // Add to jobs
    if (!subcategories[subcategoryIndex].jobs) {
      subcategories[subcategoryIndex].jobs = [];
    }
    subcategories[subcategoryIndex].jobs.push(newJob);
    
    // Update in database
    const { error: updateError } = await supabase
      .from('service_categories')
      .update({ subcategories })
      .eq('id', categoryId);
      
    if (updateError) throw new Error(updateError.message);
    
    return newJob.id;
  } catch (error) {
    console.error('Error adding job:', error);
    throw error;
  }
}

/**
 * Add a new service category
 */
export async function addServiceCategory(
  name: string, 
  description?: string
): Promise<ServiceMainCategory> {
  try {
    // Get current max position to place this one at the end
    const { data: existingCategories, error: queryError } = await supabase
      .from('service_categories')
      .select('position')
      .order('position', { ascending: false })
      .limit(1);
      
    if (queryError) throw new Error(queryError.message);
    
    const position = existingCategories && existingCategories.length > 0 
      ? (existingCategories[0].position || 0) + 1 
      : 1;
    
    const newCategory: Partial<RawServiceCategory> = {
      id: uuidv4(),
      name,
      description: description || '',
      position,
      subcategories: []
    };
    
    const { error } = await supabase
      .from('service_categories')
      .insert(newCategory);
      
    if (error) throw new Error(error.message);
    
    return {
      id: newCategory.id!,
      name: newCategory.name!,
      description: newCategory.description,
      position: newCategory.position,
      subcategories: []
    };
  } catch (error) {
    console.error('Error adding service category:', error);
    throw error;
  }
}

/**
 * Bulk import service categories from structured data
 */
export async function bulkImportServiceCategories(
  categories: ServiceMainCategory[]
): Promise<void> {
  try {
    // Convert categories to proper format for Supabase
    const categoriesForInsert = categories.map(category => ({
      id: category.id || uuidv4(),
      name: category.name,
      description: category.description || '',
      position: category.position || 0, 
      subcategories: category.subcategories
    }));
    
    const { error } = await supabase
      .from('service_categories')
      .insert(categoriesForInsert);
      
    if (error) throw new Error(error.message);
  } catch (error) {
    console.error('Error bulk importing categories:', error);
    throw error;
  }
}

/**
 * Find duplicate service items
 */
export async function findDuplicateServiceItems(): Promise<{
  duplicateCategories: { id: string, name: string }[],
  duplicateSubcategories: { id: string, name: string, categoryName: string }[],
  duplicateJobs: { id: string, name: string, categoryName: string, subcategoryName: string }[]
}> {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('position');
      
    if (error) throw new Error(error.message);
    
    // Process the raw data to find duplicates
    const processedCategories = data.map(category => ({
      id: category.id,
      name: category.name,
      // Parse subcategories from JSON
      subcategories: Array.isArray(category.subcategories) 
        ? category.subcategories.map((sub: any) => ({
            id: sub.id,
            name: sub.name,
            categoryName: category.name,
            jobs: Array.isArray(sub.jobs) 
              ? sub.jobs.map((job: any) => ({
                  id: job.id,
                  name: job.name,
                  subcategoryName: sub.name,
                  categoryName: category.name
                }))
              : []
          }))
        : []
    }));
    
    // Find duplicate categories
    const categoryNames = processedCategories.map(c => c.name.toLowerCase());
    const duplicateCategories = processedCategories.filter(
      (cat, index) => categoryNames.indexOf(cat.name.toLowerCase()) !== index
    );
    
    // Find duplicate subcategories within each category
    const duplicateSubcategories: { id: string; name: string; categoryName: string; }[] = [];
    processedCategories.forEach(category => {
      const subcatNames = category.subcategories.map(s => s.name.toLowerCase());
      category.subcategories.forEach((subcat, index) => {
        if (subcatNames.indexOf(subcat.name.toLowerCase()) !== index) {
          duplicateSubcategories.push({
            id: subcat.id,
            name: subcat.name,
            categoryName: category.name
          });
        }
      });
    });
    
    // Find duplicate jobs within each subcategory
    const duplicateJobs: { id: string; name: string; categoryName: string; subcategoryName: string; }[] = [];
    processedCategories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        const jobNames = subcategory.jobs.map(j => j.name.toLowerCase());
        subcategory.jobs.forEach((job, index) => {
          if (jobNames.indexOf(job.name.toLowerCase()) !== index) {
            duplicateJobs.push({
              id: job.id,
              name: job.name,
              categoryName: category.name,
              subcategoryName: subcategory.name
            });
          }
        });
      });
    });
    
    return {
      duplicateCategories,
      duplicateSubcategories,
      duplicateJobs
    };
  } catch (error) {
    console.error('Error finding duplicates:', error);
    throw error;
  }
}

/**
 * Remove a duplicate service item
 */
export async function removeDuplicateItem(
  type: 'category' | 'subcategory' | 'job',
  itemId: string,
  categoryId?: string,
  subcategoryId?: string
): Promise<void> {
  // Call the deleteServiceItem function since the operation is the same
  return deleteServiceItem(type, itemId, categoryId || '', subcategoryId || null);
}

