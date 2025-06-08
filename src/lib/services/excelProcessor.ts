import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import type { 
  ServiceSector, 
  ServiceMainCategory, 
  ServiceSubcategory, 
  ServiceJob,
  ImportResult,
  ProcessedServiceData 
} from '@/types/service';

export async function processExcelFileFromStorage(
  filePath: string, 
  sectorName: string
): Promise<ImportResult> {
  try {
    console.log(`Processing Excel file: ${filePath} for sector: ${sectorName}`);
    
    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('service-data')
      .download(filePath);
    
    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }
    
    if (!fileData) {
      throw new Error('No file data received');
    }
    
    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Parse Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    if (!worksheet) {
      throw new Error('No worksheet found in Excel file');
    }
    
    // Convert to JSON - this gives us an array of arrays
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '', 
      raw: false 
    }) as string[][];
    
    if (!jsonData || jsonData.length < 2) {
      throw new Error('Excel file must have at least 2 rows (headers + data)');
    }
    
    // Process the Excel data into service hierarchy
    const processedData = await processExcelData(jsonData, sectorName, filePath);
    
    return {
      success: true,
      message: `Successfully processed ${filePath}`,
      stats: processedData.stats
    };
    
  } catch (error) {
    console.error('Error processing Excel file from storage:', error);
    return {
      success: false,
      message: `Error processing ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function processExcelData(
  excelData: string[][],
  sectorName: string,
  filePath: string
): Promise<ProcessedServiceData> {
  try {
    console.log(`Processing data for sector: ${sectorName}, file: ${filePath}`);
    
    // Extract category name from file path (remove .xlsx extension and path)
    const fileName = filePath.split('/').pop()?.replace('.xlsx', '') || 'Unknown';
    const categoryName = fileName;
    
    // Step 1: Ensure sector exists
    const sectorId = await ensureSectorExists(sectorName);
    console.log(`Sector ID: ${sectorId}`);
    
    // Step 2: Ensure category exists
    const categoryId = await ensureCategoryExists(categoryName, sectorId);
    console.log(`Category ID: ${categoryId}`);
    
    // Step 3: Process subcategories and jobs from Excel data
    const subcategoryHeaders = excelData[0].filter(header => header && header.trim() !== '');
    console.log(`Found ${subcategoryHeaders.length} subcategory headers:`, subcategoryHeaders);
    
    let totalServices = 0;
    let processedSubcategories = 0;
    
    // Process each subcategory column
    for (let colIndex = 0; colIndex < subcategoryHeaders.length; colIndex++) {
      const subcategoryName = subcategoryHeaders[colIndex].trim();
      
      if (!subcategoryName) continue;
      
      try {
        // Ensure subcategory exists
        const subcategoryId = await ensureSubcategoryExists(subcategoryName, categoryId);
        console.log(`Subcategory "${subcategoryName}" ID: ${subcategoryId}`);
        
        // Extract services from this column (rows 1 onwards)
        const services = [];
        for (let rowIndex = 1; rowIndex < Math.min(excelData.length, 1001); rowIndex++) {
          const serviceName = excelData[rowIndex]?.[colIndex]?.trim();
          
          if (serviceName && serviceName !== '') {
            services.push({
              name: serviceName,
              description: `${sectorName} service`,
              estimatedTime: 60, // Default 1 hour
              price: 100, // Default price
              subcategory_id: subcategoryId
            });
          }
        }
        
        // Insert services for this subcategory
        if (services.length > 0) {
          await insertServices(services, subcategoryId);
          totalServices += services.length;
          console.log(`Processed subcategory "${subcategoryName}" with ${services.length} services`);
        }
        
        processedSubcategories++;
        
      } catch (error) {
        console.error(`Error processing subcategory "${subcategoryName}":`, error);
        // Continue with next subcategory
      }
    }
    
    const stats = {
      totalSectors: 1,
      totalCategories: 1,
      totalSubcategories: processedSubcategories,
      totalServices,
      filesProcessed: 1
    };
    
    return {
      sectors: [],
      stats,
      sectorName,
      categories: []
    };
    
  } catch (error) {
    console.error('Error processing Excel data:', error);
    throw error;
  }
}

async function ensureSectorExists(sectorName: string): Promise<string> {
  try {
    // First try to find existing sector
    const { data: existingSectors, error: queryError } = await supabase
      .from('service_sectors')
      .select('id')
      .eq('name', sectorName)
      .limit(1);
    
    if (queryError) {
      console.error('Error querying sectors:', queryError);
      throw new Error(`Failed to query sectors: ${queryError.message}`);
    }
    
    if (existingSectors && existingSectors.length > 0) {
      return existingSectors[0].id;
    }
    
    // Create new sector if it doesn't exist
    const { data: newSector, error: insertError } = await supabase
      .from('service_sectors')
      .insert({
        name: sectorName,
        description: `${sectorName} services`,
        position: 1,
        is_active: true
      })
      .select('id')
      .single();
    
    if (insertError) {
      console.error('Error creating sector:', insertError);
      throw new Error(`Failed to create sector: ${insertError.message}`);
    }
    
    if (!newSector) {
      throw new Error('No sector data returned after insert');
    }
    
    return newSector.id;
    
  } catch (error) {
    console.error('Error ensuring sector exists:', error);
    throw error;
  }
}

async function ensureCategoryExists(categoryName: string, sectorId: string): Promise<string> {
  try {
    // First try to find existing category
    const { data: existingCategories, error: queryError } = await supabase
      .from('service_categories')
      .select('id')
      .eq('name', categoryName)
      .eq('sector_id', sectorId)
      .limit(1);
    
    if (queryError) {
      console.error('Error querying categories:', queryError);
      throw new Error(`Failed to query categories: ${queryError.message}`);
    }
    
    if (existingCategories && existingCategories.length > 0) {
      return existingCategories[0].id;
    }
    
    // Create new category if it doesn't exist
    const { data: newCategory, error: insertError } = await supabase
      .from('service_categories')
      .insert({
        name: categoryName,
        description: `${categoryName} services`,
        sector_id: sectorId,
        position: 1
      })
      .select('id')
      .single();
    
    if (insertError) {
      console.error('Error creating category:', insertError);
      throw new Error(`Failed to create category: ${insertError.message}`);
    }
    
    if (!newCategory) {
      throw new Error('No category data returned after insert');
    }
    
    return newCategory.id;
    
  } catch (error) {
    console.error('Error ensuring category exists:', error);
    throw error;
  }
}

async function ensureSubcategoryExists(subcategoryName: string, categoryId: string): Promise<string> {
  try {
    // First try to find existing subcategory
    const { data: existingSubcategories, error: queryError } = await supabase
      .from('service_subcategories')
      .select('id')
      .eq('name', subcategoryName)
      .eq('category_id', categoryId)
      .limit(1);
    
    if (queryError) {
      console.error('Error querying subcategories:', queryError);
      throw new Error(`Failed to query subcategories: ${queryError.message}`);
    }
    
    if (existingSubcategories && existingSubcategories.length > 0) {
      return existingSubcategories[0].id;
    }
    
    // Create new subcategory if it doesn't exist
    const { data: newSubcategory, error: insertError } = await supabase
      .from('service_subcategories')
      .insert({
        name: subcategoryName,
        description: `${subcategoryName} services`,
        category_id: categoryId
      })
      .select('id')
      .single();
    
    if (insertError) {
      console.error('Error creating subcategory:', insertError);
      throw new Error(`Failed to create subcategory: ${insertError.message}`);
    }
    
    if (!newSubcategory) {
      throw new Error('No subcategory data returned after insert');
    }
    
    return newSubcategory.id;
    
  } catch (error) {
    console.error('Error ensuring subcategory exists:', error);
    throw error;
  }
}

async function insertServices(services: any[], subcategoryId: string): Promise<void> {
  try {
    console.log(`Inserting ${services.length} services for subcategory ${subcategoryId}`);
    
    // Insert services one by one to handle duplicates gracefully
    for (const service of services) {
      try {
        // Check if service already exists
        const { data: existingServices, error: queryError } = await supabase
          .from('service_jobs')
          .select('id')
          .eq('name', service.name)
          .eq('subcategory_id', subcategoryId)
          .limit(1);
        
        if (queryError) {
          console.error('Error querying existing service:', queryError);
          continue; // Skip this service
        }
        
        // Skip if service already exists
        if (existingServices && existingServices.length > 0) {
          console.log(`Service "${service.name}" already exists, skipping`);
          continue;
        }
        
        // Insert new service
        const { error: insertError } = await supabase
          .from('service_jobs')
          .insert({
            name: service.name,
            description: service.description,
            estimated_time: service.estimatedTime,
            price: service.price,
            subcategory_id: subcategoryId
          });
        
        if (insertError) {
          console.error(`Error inserting service "${service.name}":`, insertError);
          // Continue with next service instead of failing completely
        }
        
      } catch (serviceError) {
        console.error(`Error processing service "${service.name}":`, serviceError);
        // Continue with next service
      }
    }
    
  } catch (error) {
    console.error('Error inserting services:', error);
    throw error;
  }
}

export async function processMultipleExcelFiles(files: File[]): Promise<ImportResult> {
  const results = [];
  
  for (const file of files) {
    try {
      const result = await processExcelFile(file);
      results.push(result);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      results.push({
        success: false,
        message: `Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const totalFiles = results.length;
  
  return {
    success: successCount > 0,
    message: `Processed ${successCount}/${totalFiles} files successfully`,
    stats: {
      totalSectors: 0,
      totalCategories: 0,
      totalSubcategories: 0,
      totalServices: 0,
      filesProcessed: successCount
    }
  };
}

export async function processExcelFile(file: File): Promise<ImportResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    if (!worksheet) {
      throw new Error('No worksheet found in Excel file');
    }
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '', 
      raw: false 
    }) as string[][];
    
    if (!jsonData || jsonData.length < 2) {
      throw new Error('Excel file must have at least 2 rows (headers + data)');
    }
    
    // Use file name (without extension) as category name, default sector to "general"
    const categoryName = file.name.replace('.xlsx', '').replace('.xls', '');
    const sectorName = 'general';
    
    const processedData = await processExcelData(jsonData, sectorName, categoryName);
    
    return {
      success: true,
      message: `Successfully processed ${file.name}`,
      stats: processedData.stats
    };
    
  } catch (error) {
    console.error('Error processing Excel file:', error);
    return {
      success: false,
      message: `Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export function mapExcelToServiceHierarchy(data: any[]): any {
  // Legacy function - keeping for compatibility
  return { sectors: [], stats: { totalSectors: 0, totalCategories: 0, totalSubcategories: 0, totalServices: 0, filesProcessed: 0 } };
}

export function validateExcelData(data: any[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
  }
  
  if (data.length < 2) {
    errors.push('Excel file must have at least 2 rows (headers + data)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
