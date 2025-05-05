
import { supabase } from '@/lib/supabase';
import { ServiceMainCategory, ServiceJob } from "@/types/serviceHierarchy";
import { saveServiceCategory } from './serviceCategories';

/**
 * Function to save a service job
 */
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

/**
 * Function to delete a service job
 */
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
