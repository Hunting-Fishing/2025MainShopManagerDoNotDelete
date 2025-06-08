
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import type { ImportResult, ImportStats } from '@/types/service';

export async function processExcelFileFromStorage(
  filePath: string, 
  sectorName: string
): Promise<ImportResult> {
  try {
    console.log(`Processing Excel file: ${filePath} for sector: ${sectorName}`);
    
    // Download file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('service-data')
      .download(filePath);
    
    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }
    
    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Parse Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON array
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      raw: false
    }) as string[][];
    
    if (!jsonData || jsonData.length < 2) {
      throw new Error('Excel file must have at least 2 rows (header + data)');
    }
    
    // Process the data
    const result = await processExcelData(jsonData, sectorName, filePath);
    
    return {
      success: true,
      message: `Successfully processed ${filePath}`,
      stats: result.stats
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
  jsonData: string[][],
  sectorName: string,
  fileName: string
): Promise<{ stats: ImportStats }> {
  try {
    console.log(`Processing data for sector: ${sectorName}, file: ${fileName}`);
    
    // Ensure sector exists
    let sectorId = await ensureSectorExists(sectorName);
    
    // Create category from file name (remove .xlsx/.xls extension)
    const categoryName = fileName.replace(/\.(xlsx|xls)$/i, '').replace(/^.*\//, '');
    let categoryId = await ensureCategoryExists(categoryName, sectorId);
    
    // Extract subcategories from header row (row 0)
    const subcategoryHeaders = jsonData[0].filter(header => header && header.trim() !== '');
    
    if (subcategoryHeaders.length === 0) {
      throw new Error('No subcategory headers found in row 1');
    }
    
    let totalServices = 0;
    let totalSubcategories = subcategoryHeaders.length;
    
    // Process each subcategory column
    for (let colIndex = 0; colIndex < subcategoryHeaders.length; colIndex++) {
      const subcategoryName = subcategoryHeaders[colIndex].trim();
      
      // Ensure subcategory exists
      const subcategoryId = await ensureSubcategoryExists(subcategoryName, categoryId);
      
      // Extract services from rows 1-1000 for this column
      const services = [];
      for (let rowIndex = 1; rowIndex < Math.min(jsonData.length, 1001); rowIndex++) {
        const row = jsonData[rowIndex];
        const serviceName = row[colIndex];
        
        if (serviceName && serviceName.trim() !== '') {
          services.push({
            name: serviceName.trim(),
            description: `${sectorName} service`,
            estimated_time: 60, // Default 1 hour
            price: 100 // Default price
          });
        }
      }
      
      // Insert services for this subcategory
      for (const service of services) {
        await insertService(service, subcategoryId);
        totalServices++;
      }
      
      console.log(`Processed subcategory "${subcategoryName}" with ${services.length} services`);
    }
    
    const stats: ImportStats = {
      totalSectors: 1,
      totalCategories: 1,
      totalSubcategories,
      totalServices,
      filesProcessed: 1
    };
    
    console.log(`Completed processing for ${fileName}:`, stats);
    return { stats };
  } catch (error) {
    console.error('Error processing Excel data:', error);
    throw error;
  }
}

async function ensureSectorExists(sectorName: string): Promise<string> {
  try {
    // Check if sector exists
    const { data: existingSector, error: selectError } = await supabase
      .from('service_sectors')
      .select('id')
      .eq('name', sectorName)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      throw new Error(`Error checking sector: ${selectError.message}`);
    }
    
    if (existingSector) {
      return existingSector.id;
    }
    
    // Create new sector
    const { data: newSector, error: insertError } = await supabase
      .from('service_sectors')
      .insert({
        name: sectorName,
        description: `Auto-imported sector: ${sectorName}`,
        position: 1,
        is_active: true
      })
      .select('id')
      .single();
    
    if (insertError) {
      throw new Error(`Failed to create sector: ${insertError.message}`);
    }
    
    return newSector.id;
  } catch (error) {
    console.error('Error ensuring sector exists:', error);
    throw error;
  }
}

async function ensureCategoryExists(categoryName: string, sectorId: string): Promise<string> {
  try {
    // Check if category exists
    const { data: existingCategory, error: selectError } = await supabase
      .from('service_categories')
      .select('id')
      .eq('name', categoryName)
      .eq('sector_id', sectorId)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      throw new Error(`Error checking category: ${selectError.message}`);
    }
    
    if (existingCategory) {
      return existingCategory.id;
    }
    
    // Create new category
    const { data: newCategory, error: insertError } = await supabase
      .from('service_categories')
      .insert({
        name: categoryName,
        description: `Auto-imported category: ${categoryName}`,
        sector_id: sectorId,
        position: 1
      })
      .select('id')
      .single();
    
    if (insertError) {
      throw new Error(`Failed to create category: ${insertError.message}`);
    }
    
    return newCategory.id;
  } catch (error) {
    console.error('Error ensuring category exists:', error);
    throw error;
  }
}

async function ensureSubcategoryExists(subcategoryName: string, categoryId: string): Promise<string> {
  try {
    // Check if subcategory exists
    const { data: existingSubcategory, error: selectError } = await supabase
      .from('service_subcategories')
      .select('id')
      .eq('name', subcategoryName)
      .eq('category_id', categoryId)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      throw new Error(`Error checking subcategory: ${selectError.message}`);
    }
    
    if (existingSubcategory) {
      return existingSubcategory.id;
    }
    
    // Create new subcategory
    const { data: newSubcategory, error: insertError } = await supabase
      .from('service_subcategories')
      .insert({
        name: subcategoryName,
        description: `Auto-imported subcategory: ${subcategoryName}`,
        category_id: categoryId
      })
      .select('id')
      .single();
    
    if (insertError) {
      throw new Error(`Failed to create subcategory: ${insertError.message}`);
    }
    
    return newSubcategory.id;
  } catch (error) {
    console.error('Error ensuring subcategory exists:', error);
    throw error;
  }
}

async function insertService(
  service: { name: string; description: string; estimated_time: number; price: number },
  subcategoryId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('service_jobs')
      .insert({
        name: service.name,
        description: service.description,
        estimated_time: service.estimated_time,
        price: service.price,
        subcategory_id: subcategoryId
      });
    
    if (error) {
      throw new Error(`Failed to insert service: ${error.message}`);
    }
  } catch (error) {
    console.error('Error inserting service:', error);
    throw error;
  }
}

export async function processExcelFile(file: File): Promise<ImportResult> {
  try {
    // For direct file uploads, we'll treat the file name as both sector and category
    const fileName = file.name.replace(/\.(xlsx|xls)$/i, '');
    
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Parse Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON array
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      raw: false
    }) as string[][];
    
    if (!jsonData || jsonData.length < 2) {
      throw new Error('Excel file must have at least 2 rows (header + data)');
    }
    
    // Process the data using fileName as both sector and category
    const result = await processExcelData(jsonData, fileName, fileName);
    
    return {
      success: true,
      message: `Successfully processed ${file.name}`,
      stats: result.stats
    };
  } catch (error) {
    console.error('Error processing Excel file:', error);
    return {
      success: false,
      message: `Error processing ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function processMultipleExcelFiles(files: File[]): Promise<ImportResult> {
  try {
    const results = await Promise.all(files.map(file => processExcelFile(file)));
    const failedFiles = results.filter(r => !r.success);
    
    if (failedFiles.length > 0) {
      throw new Error(`Failed to process ${failedFiles.length} files`);
    }
    
    // Aggregate stats
    const totalStats = results.reduce((acc, result) => {
      if (result.stats) {
        acc.totalSectors += result.stats.totalSectors;
        acc.totalCategories += result.stats.totalCategories;
        acc.totalSubcategories += result.stats.totalSubcategories;
        acc.totalServices += result.stats.totalServices;
        acc.filesProcessed += result.stats.filesProcessed;
      }
      return acc;
    }, {
      totalSectors: 0,
      totalCategories: 0,
      totalSubcategories: 0,
      totalServices: 0,
      filesProcessed: 0
    });
    
    return {
      success: true,
      message: `Successfully processed ${files.length} files`,
      stats: totalStats
    };
  } catch (error) {
    console.error('Error processing multiple Excel files:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function mapExcelToServiceHierarchy(excelData: any[]): any {
  // This function can be used for custom mapping if needed
  console.log('Mapping Excel data to service hierarchy:', excelData);
  return excelData;
}

export function validateExcelData(data: any[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || !Array.isArray(data)) {
    errors.push('Data must be an array');
    return { isValid: false, errors };
  }
  
  if (data.length < 2) {
    errors.push('Data must have at least 2 rows (header + data)');
  }
  
  return { isValid: errors.length === 0, errors };
}
