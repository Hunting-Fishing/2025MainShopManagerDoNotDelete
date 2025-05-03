
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

/**
 * Converts Excel data to service categories based on the sheet structure where:
 * - Each sheet represents a main category 
 * - Each column in a sheet represents a subcategory
 * - Items in the columns represent service jobs
 */
export function parseExcelToServiceHierarchy(excelData: any): ServiceMainCategory[] {
  try {
    const categories: ServiceMainCategory[] = [];
    
    // Process each sheet as a main category
    Object.keys(excelData).forEach((sheetName, index) => {
      // Skip sheets with names starting with "!" - these are special Excel sheets
      if (sheetName.startsWith('!') || !sheetName || sheetName === 'Instructions') {
        return;
      }
      
      if (excelData[sheetName] && Array.isArray(excelData[sheetName])) {
        // Create the main category from the sheet name
        const mainCategory: ServiceMainCategory = {
          id: uuidv4(),
          name: sheetName,
          description: `Imported from ${sheetName} sheet`,
          position: index,
          subcategories: []
        };
        
        // Skip empty sheets
        if (excelData[sheetName].length === 0) {
          return;
        }

        // Extract column headers as subcategories
        const sheetData = excelData[sheetName];
        
        // Get all unique column headers (except __rowNum__ or empty ones)
        const columnHeaders = new Set<string>();
        
        sheetData.forEach((row: any) => {
          Object.keys(row).forEach(key => {
            if (key !== '__rowNum__' && key.trim() !== '') {
              columnHeaders.add(key);
            }
          });
        });
        
        // Create subcategories from column headers
        columnHeaders.forEach(columnName => {
          if (columnName && columnName.trim() !== '') {
            const subcategory: ServiceSubcategory = {
              id: uuidv4(),
              name: columnName,
              description: `${sheetName} - ${columnName}`,
              jobs: []
            };
            
            // Extract jobs from the column values (skip empty cells)
            sheetData.forEach((row: any) => {
              const jobName = row[columnName];
              if (jobName && typeof jobName === 'string' && jobName.trim()) {
                subcategory.jobs.push({
                  id: uuidv4(),
                  name: jobName.trim(),
                  description: `${jobName} service for ${columnName}`,
                  estimatedTime: 60, // Default to 60 minutes
                  price: null // Price not specified in the Excel
                });
              }
            });
            
            // Only add subcategory if it has jobs
            if (subcategory.jobs.length > 0) {
              mainCategory.subcategories.push(subcategory);
            }
          }
        });
        
        // Only add category if it has subcategories
        if (mainCategory.subcategories.length > 0) {
          categories.push(mainCategory);
        }
      }
    });
    
    return categories;
  } catch (error) {
    console.error("Error parsing Excel data:", error);
    throw new Error("Failed to parse Excel data. Please ensure it follows the expected format with sheets as categories and columns as subcategories.");
  }
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

// Create a new empty category with default values
export function createEmptyCategory(position: number = 0): ServiceMainCategory {
  return {
    id: uuidv4(),
    name: "New Category",
    description: "",
    position,
    subcategories: []
  };
}
