
import { supabase } from '@/lib/supabase';
import { ServiceMainCategory, ServiceSubcategory } from "@/types/serviceHierarchy";
import { saveServiceCategory } from './serviceCategories';

/**
 * Function to save a service subcategory
 */
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

/**
 * Function to delete a service subcategory
 */
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
