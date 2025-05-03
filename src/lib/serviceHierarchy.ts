
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
 * - First row contains subcategory names
 * - Rows below contain service jobs for each subcategory
 */
export function parseExcelToServiceHierarchy(excelData: any): ServiceMainCategory[] {
  try {
    console.log('Parsing Excel data:', excelData);
    
    if (!excelData || typeof excelData !== 'object' || Object.keys(excelData).length === 0) {
      console.error('Empty or invalid Excel data:', excelData);
      throw new Error('Excel file appears to be empty or in an invalid format.');
    }
    
    const categories: ServiceMainCategory[] = [];
    
    // Process each sheet as a main category
    Object.keys(excelData).forEach((sheetName, index) => {
      // Skip sheets with names starting with "!" - these are special Excel sheets
      if (sheetName.startsWith('!') || !sheetName || sheetName === 'Instructions') {
        return;
      }
      
      console.log(`Processing sheet: ${sheetName}`);
      
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
          console.log(`Sheet ${sheetName} is empty, skipping`);
          return;
        }

        const sheetData = excelData[sheetName];
        console.log(`Sheet ${sheetName} data:`, sheetData);
        
        // Get first row as subcategory headers
        const firstRow = sheetData[0];
        if (!firstRow) {
          console.log(`Sheet ${sheetName} has no header row, skipping`);
          return;
        }
        
        // Extract subcategory names from the first row (excluding __rowNum__ property)
        const subcategoryNames = Object.keys(firstRow).filter(key => 
          key !== '__rowNum__' && firstRow[key] && firstRow[key].toString().trim() !== ''
        );
        
        console.log(`Found subcategory names:`, subcategoryNames);
        
        // Create subcategories
        subcategoryNames.forEach(columnIndex => {
          const subcategoryName = firstRow[columnIndex];
          if (subcategoryName && typeof subcategoryName === 'string' && subcategoryName.trim() !== '') {
            const subcategory: ServiceSubcategory = {
              id: uuidv4(),
              name: subcategoryName.trim(),
              description: `${sheetName} - ${subcategoryName.trim()}`,
              jobs: []
            };
            
            // Extract jobs from rows below the header (starting from index 1)
            for (let i = 1; i < sheetData.length; i++) {
              const row = sheetData[i];
              const jobName = row[columnIndex];
              
              if (jobName && typeof jobName === 'string' && jobName.trim() !== '') {
                subcategory.jobs.push({
                  id: uuidv4(),
                  name: jobName.trim(),
                  description: `${jobName.trim()} service for ${subcategoryName.trim()}`,
                  estimatedTime: 60, // Default to 60 minutes
                  price: null // Price not specified in the Excel
                });
              }
            }
            
            // Only add subcategory if it has jobs
            if (subcategory.jobs.length > 0) {
              mainCategory.subcategories.push(subcategory);
            }
          }
        });
        
        // Only add category if it has subcategories
        if (mainCategory.subcategories.length > 0) {
          categories.push(mainCategory);
        } else {
          console.log(`Category ${mainCategory.name} has no subcategories with jobs, skipping`);
        }
      }
    });
    
    console.log('Parsed categories:', categories);
    
    if (categories.length === 0) {
      throw new Error('No valid service categories found in the Excel file. Please ensure your Excel follows the template format with sheets as categories, first row as subcategory names, and subsequent rows as services.');
    }
    
    return categories;
  } catch (error) {
    console.error("Error parsing Excel data:", error);
    throw error;
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
