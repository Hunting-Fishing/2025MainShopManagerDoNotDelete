
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
export async function deleteServiceCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('service_hierarchy')
    .delete()
    .eq('id', id);
  
  if (error) {
    throw new Error(`Error deleting service category: ${error.message}`);
  }
}

// Function to convert Excel data to service categories
export function parseExcelToServiceHierarchy(excelData: any): ServiceMainCategory[] {
  // This is a placeholder. In a real implementation, 
  // you would parse the Excel data and convert it to the service hierarchy format.
  return [];
}

// Function to bulk import service categories
export async function bulkImportServiceCategories(categories: ServiceMainCategory[]): Promise<void> {
  const { error } = await supabase
    .from('service_hierarchy')
    .upsert(categories);
  
  if (error) {
    throw new Error(`Error importing service categories: ${error.message}`);
  }
}
