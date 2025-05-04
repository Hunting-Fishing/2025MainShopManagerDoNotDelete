
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

// Function to save a service subcategory
export async function saveServiceSubcategory(
  categoryId: string,
  subcategory: ServiceSubcategory
): Promise<ServiceMainCategory> {
  // First, get the current category
  const { data: category, error: fetchError } = await supabase
    .from('service_hierarchy')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching category: ${fetchError.message}`);
  }

  // Update or add the subcategory
  const updatedSubcategories = [...(category.subcategories || [])];
  const existingIndex = updatedSubcategories.findIndex(sub => sub.id === subcategory.id);
  
  if (existingIndex >= 0) {
    updatedSubcategories[existingIndex] = subcategory;
  } else {
    updatedSubcategories.push(subcategory);
  }

  // Save the updated category
  const updatedCategory = {
    ...category,
    subcategories: updatedSubcategories
  };

  return saveServiceCategory(updatedCategory);
}

// Function to save a service job
export async function saveServiceJob(
  categoryId: string,
  subcategoryId: string,
  job: ServiceJob
): Promise<ServiceMainCategory> {
  // First, get the current category
  const { data: category, error: fetchError } = await supabase
    .from('service_hierarchy')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching category: ${fetchError.message}`);
  }

  // Find the subcategory
  const subcategories = [...(category.subcategories || [])];
  const subcategoryIndex = subcategories.findIndex(sub => sub.id === subcategoryId);
  
  if (subcategoryIndex === -1) {
    throw new Error(`Subcategory not found: ${subcategoryId}`);
  }

  // Update or add the job
  const subcategory = subcategories[subcategoryIndex];
  const jobs = [...(subcategory.jobs || [])];
  const jobIndex = jobs.findIndex(j => j.id === job.id);
  
  if (jobIndex >= 0) {
    jobs[jobIndex] = job;
  } else {
    jobs.push(job);
  }

  // Update the subcategory with the new jobs
  subcategories[subcategoryIndex] = {
    ...subcategory,
    jobs
  };

  // Save the updated category
  const updatedCategory = {
    ...category,
    subcategories
  };

  return saveServiceCategory(updatedCategory);
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

// Function to delete a service subcategory
export async function deleteServiceSubcategory(
  categoryId: string,
  subcategoryId: string
): Promise<ServiceMainCategory> {
  // First, get the current category
  const { data: category, error: fetchError } = await supabase
    .from('service_hierarchy')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching category: ${fetchError.message}`);
  }

  // Filter out the subcategory to delete
  const updatedSubcategories = (category.subcategories || []).filter(
    sub => sub.id !== subcategoryId
  );

  // Save the updated category
  const updatedCategory = {
    ...category,
    subcategories: updatedSubcategories
  };

  return saveServiceCategory(updatedCategory);
}

// Function to delete a service job
export async function deleteServiceJob(
  categoryId: string,
  subcategoryId: string,
  jobId: string
): Promise<ServiceMainCategory> {
  // First, get the current category
  const { data: category, error: fetchError } = await supabase
    .from('service_hierarchy')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (fetchError) {
    throw new Error(`Error fetching category: ${fetchError.message}`);
  }

  // Find the subcategory
  const subcategories = [...(category.subcategories || [])];
  const subcategoryIndex = subcategories.findIndex(sub => sub.id === subcategoryId);
  
  if (subcategoryIndex === -1) {
    throw new Error(`Subcategory not found: ${subcategoryId}`);
  }

  // Filter out the job to delete
  const subcategory = subcategories[subcategoryIndex];
  const updatedJobs = (subcategory.jobs || []).filter(
    job => job.id !== jobId
  );

  // Update the subcategory with the filtered jobs
  subcategories[subcategoryIndex] = {
    ...subcategory,
    jobs: updatedJobs
  };

  // Save the updated category
  const updatedCategory = {
    ...category,
    subcategories
  };

  return saveServiceCategory(updatedCategory);
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
