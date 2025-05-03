
import { supabase } from '@/lib/supabase';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { v4 as uuidv4 } from 'uuid';

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
  // This is where we would process multi-sheet Excel data
  
  try {
    const categories: ServiceMainCategory[] = [];
    const subcategoriesMap: Record<string, ServiceSubcategory> = {};
    const jobsMap: Record<string, ServiceJob> = {};
    
    // Convert category sheet data
    if (excelData.Categories && Array.isArray(excelData.Categories)) {
      excelData.Categories.forEach((row: any) => {
        if (row.name) {
          categories.push({
            id: row.id || uuidv4(),
            name: row.name,
            description: row.description || '',
            position: row.position || 0,
            subcategories: []
          });
        }
      });
    }
    
    // Convert subcategories sheet data
    if (excelData.Subcategories && Array.isArray(excelData.Subcategories)) {
      excelData.Subcategories.forEach((row: any) => {
        if (row.name && row.categoryId) {
          const subcategory: ServiceSubcategory = {
            id: row.id || uuidv4(),
            name: row.name,
            description: row.description || '',
            jobs: []
          };
          
          // Store in map for jobs to reference
          subcategoriesMap[subcategory.id] = subcategory;
          
          // Find parent category and add subcategory
          const parentCategory = categories.find(c => c.id === row.categoryId);
          if (parentCategory) {
            parentCategory.subcategories.push(subcategory);
          }
        }
      });
    }
    
    // Convert jobs sheet data
    if (excelData.Jobs && Array.isArray(excelData.Jobs)) {
      excelData.Jobs.forEach((row: any) => {
        if (row.name && row.subcategoryId) {
          const job: ServiceJob = {
            id: row.id || uuidv4(),
            name: row.name,
            description: row.description || '',
            estimatedTime: row.estimatedTime !== undefined ? Number(row.estimatedTime) : undefined,
            price: row.price !== undefined ? Number(row.price) : undefined
          };
          
          // Find parent subcategory and add job
          const parentSubcategory = subcategoriesMap[row.subcategoryId];
          if (parentSubcategory) {
            parentSubcategory.jobs.push(job);
          }
        }
      });
    }
    
    return categories;
  } catch (error) {
    console.error("Error parsing Excel data:", error);
    throw new Error("Failed to parse Excel data. Please ensure it follows the template format.");
  }
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
