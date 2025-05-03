
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
 * - Sheet name represents a main category 
 * - Row 1 in each column contains subcategory names
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
      
      if (!excelData[sheetName] || !Array.isArray(excelData[sheetName]) || excelData[sheetName].length === 0) {
        console.log(`Sheet ${sheetName} is empty, skipping`);
        return;
      }
      
      // Create the main category from the sheet name
      const mainCategory: ServiceMainCategory = {
        id: uuidv4(),
        name: sheetName,
        description: `Imported from ${sheetName} sheet`,
        position: index,
        subcategories: []
      };
      
      const sheetData = excelData[sheetName];
      console.log(`Sheet data for ${sheetName}:`, sheetData);
      
      // Debug the first row to see its structure
      if (sheetData.length > 0) {
        console.log(`First row structure for ${sheetName}:`, sheetData[0]);
      }
      
      // Get subcategory headers from the first row (row 1)
      const firstRow = sheetData[0];
      if (!firstRow) {
        console.log(`Sheet ${sheetName} has no header row, skipping`);
        return;
      }
      
      // Extract column keys (excluding __rowNum__ and any empty columns)
      const columnKeys = Object.keys(firstRow).filter(key => 
        key !== '__rowNum__' && firstRow[key] && firstRow[key].toString().trim() !== ''
      );
      
      console.log(`Found ${columnKeys.length} columns with subcategory headers:`, columnKeys);
      console.log(`First row values:`, columnKeys.map(key => firstRow[key]));
      
      // Process each column
      columnKeys.forEach(columnKey => {
        const subcategoryName = firstRow[columnKey].toString().trim();
        
        if (!subcategoryName) {
          console.log(`Empty subcategory name in column ${columnKey}, skipping`);
          return;
        }
        
        console.log(`Processing subcategory: ${subcategoryName}`);
        
        // Create a new subcategory with this name
        const subcategory: ServiceSubcategory = {
          id: uuidv4(),
          name: subcategoryName,
          description: `${sheetName} - ${subcategoryName}`,
          jobs: []
        };
        
        // Process rows 2+ (index 1+) as jobs
        for (let i = 1; i < sheetData.length; i++) {
          const row = sheetData[i];
          const jobName = row[columnKey];
          
          if (jobName && typeof jobName === 'string' && jobName.trim() !== '') {
            console.log(`Adding job: ${jobName.trim()} under ${subcategoryName}`);
            
            subcategory.jobs.push({
              id: uuidv4(),
              name: jobName.trim(),
              description: `${jobName.trim()} service under ${subcategoryName}`,
              estimatedTime: 60, // Default to 60 minutes
              price: null // Price not specified in the Excel
            });
          }
        }
        
        // Only add subcategories with jobs
        if (subcategory.jobs.length > 0) {
          mainCategory.subcategories.push(subcategory);
          console.log(`Added subcategory ${subcategoryName} with ${subcategory.jobs.length} jobs`);
        } else {
          console.log(`Subcategory ${subcategoryName} has no jobs, skipping`);
        }
      });
      
      // Only add category if it has subcategories
      if (mainCategory.subcategories.length > 0) {
        categories.push(mainCategory);
        console.log(`Added category ${mainCategory.name} with ${mainCategory.subcategories.length} subcategories`);
      } else {
        console.log(`Category ${mainCategory.name} has no subcategories with jobs, skipping`);
      }
    });
    
    console.log(`Parsed ${categories.length} categories from Excel data`);
    
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
