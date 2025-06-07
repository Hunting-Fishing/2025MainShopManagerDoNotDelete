
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { processServiceDataFromSheets } from './serviceDataProcessor';
import type { ProcessedServiceData, ImportResult, ImportStats } from '@/types/service';

export async function processExcelFile(file: File): Promise<ProcessedServiceData> {
  try {
    console.log('Processing Excel file:', file.name);
    
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error('Excel file has no sheets');
    }
    
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Convert to array of arrays format expected by processServiceDataFromSheets
    const excelData = jsonData as any[][];
    
    // Use the file name (without extension) as the sector name
    const sectorName = file.name.replace(/\.[^/.]+$/, '');
    
    const result = await processServiceDataFromSheets(excelData, sectorName);
    
    console.log('Excel file processed successfully');
    return result;
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw error;
  }
}

export async function processExcelFileFromStorage(filePath: string, sectorName: string): Promise<ImportResult> {
  try {
    console.log(`Processing Excel file from storage: ${filePath}`);
    
    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('service-data')
      .download(filePath);
      
    if (downloadError) {
      console.error('Error downloading file from storage:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }
    
    if (!fileData) {
      throw new Error('No file data received from storage');
    }
    
    // Convert Blob to ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error('Excel file has no sheets');
    }
    
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Convert to array of arrays format
    const excelData = jsonData as any[][];
    
    // Process the data and save to database
    const processedData = await processServiceDataFromSheets(excelData, sectorName);
    
    // Save to database using the new service hierarchy tables
    await saveProcessedDataToDatabase(processedData, sectorName);
    
    const stats: ImportStats = {
      totalSectors: 1,
      totalCategories: processedData.categories?.length || 0,
      totalSubcategories: processedData.categories?.reduce((acc, cat) => acc + cat.subcategories.length, 0) || 0,
      totalServices: processedData.categories?.reduce((acc, cat) => 
        acc + cat.subcategories.reduce((subAcc, sub) => subAcc + sub.services.length, 0), 0) || 0,
      filesProcessed: 1
    };
    
    console.log(`Successfully processed ${filePath}:`, stats);
    
    return {
      success: true,
      message: `Successfully processed ${filePath}`,
      stats
    };
  } catch (error) {
    console.error(`Error processing Excel file ${filePath}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

async function saveProcessedDataToDatabase(processedData: ProcessedServiceData, sectorName: string): Promise<void> {
  try {
    console.log(`Saving processed data to database for sector: ${sectorName}`);
    
    if (!processedData.categories || processedData.categories.length === 0) {
      console.log('No categories to save');
      return;
    }
    
    // First, create or get the sector
    const { data: existingSector, error: sectorSelectError } = await supabase
      .from('service_sectors')
      .select('id')
      .eq('name', sectorName)
      .single();
    
    let sectorId: string;
    
    if (existingSector) {
      sectorId = existingSector.id;
      console.log(`Using existing sector: ${sectorName} (${sectorId})`);
    } else {
      const { data: newSector, error: sectorInsertError } = await supabase
        .from('service_sectors')
        .insert({
          name: sectorName,
          description: `${sectorName} services`,
          is_active: true
        })
        .select('id')
        .single();
        
      if (sectorInsertError || !newSector) {
        throw new Error(`Failed to create sector: ${sectorInsertError?.message}`);
      }
      
      sectorId = newSector.id;
      console.log(`Created new sector: ${sectorName} (${sectorId})`);
    }
    
    // Process each category
    for (const category of processedData.categories) {
      console.log(`Processing category: ${category.name}`);
      
      // Create or get the main category
      const { data: existingCategory, error: categorySelectError } = await supabase
        .from('service_main_categories')
        .select('id')
        .eq('sector_id', sectorId)
        .eq('name', category.name)
        .single();
      
      let categoryId: string;
      
      if (existingCategory) {
        categoryId = existingCategory.id;
        console.log(`Using existing category: ${category.name} (${categoryId})`);
      } else {
        const { data: newCategory, error: categoryInsertError } = await supabase
          .from('service_main_categories')
          .insert({
            sector_id: sectorId,
            name: category.name,
            description: `Category for ${category.name} services`
          })
          .select('id')
          .single();
          
        if (categoryInsertError || !newCategory) {
          throw new Error(`Failed to create category: ${categoryInsertError?.message}`);
        }
        
        categoryId = newCategory.id;
        console.log(`Created new category: ${category.name} (${categoryId})`);
      }
      
      // Process each subcategory
      for (const subcategory of category.subcategories) {
        console.log(`Processing subcategory: ${subcategory.name}`);
        
        // Create or get the subcategory
        const { data: existingSubcategory, error: subcategorySelectError } = await supabase
          .from('service_subcategories')
          .select('id')
          .eq('category_id', categoryId)
          .eq('name', subcategory.name)
          .single();
        
        let subcategoryId: string;
        
        if (existingSubcategory) {
          subcategoryId = existingSubcategory.id;
          console.log(`Using existing subcategory: ${subcategory.name} (${subcategoryId})`);
        } else {
          const { data: newSubcategory, error: subcategoryInsertError } = await supabase
            .from('service_subcategories')
            .insert({
              category_id: categoryId,
              name: subcategory.name,
              description: `Subcategory for ${subcategory.name} services`
            })
            .select('id')
            .single();
            
          if (subcategoryInsertError || !newSubcategory) {
            throw new Error(`Failed to create subcategory: ${subcategoryInsertError?.message}`);
          }
          
          subcategoryId = newSubcategory.id;
          console.log(`Created new subcategory: ${subcategory.name} (${subcategoryId})`);
        }
        
        // Process each service/job
        const jobsToInsert = subcategory.services.map(service => ({
          subcategory_id: subcategoryId,
          name: service.name,
          description: service.description || `${service.name} service`,
          estimated_time: service.estimatedTime || 60,
          price: service.price || 100
        }));
        
        if (jobsToInsert.length > 0) {
          // First, clear existing jobs for this subcategory to avoid duplicates
          await supabase
            .from('service_jobs')
            .delete()
            .eq('subcategory_id', subcategoryId);
          
          // Insert new jobs
          const { error: jobsInsertError } = await supabase
            .from('service_jobs')
            .insert(jobsToInsert);
            
          if (jobsInsertError) {
            throw new Error(`Failed to create jobs: ${jobsInsertError.message}`);
          }
          
          console.log(`Created ${jobsToInsert.length} jobs for subcategory: ${subcategory.name}`);
        }
      }
    }
    
    console.log(`Successfully saved all data for sector: ${sectorName}`);
  } catch (error) {
    console.error('Error saving processed data to database:', error);
    throw error;
  }
}

export async function processMultipleExcelFiles(files: File[]): Promise<ProcessedServiceData[]> {
  const results: ProcessedServiceData[] = [];
  
  for (const file of files) {
    try {
      const result = await processExcelFile(file);
      results.push(result);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      // Continue with other files even if one fails
    }
  }
  
  return results;
}

export function validateExcelData(data: any[][]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!Array.isArray(data) || data.length < 2) {
    errors.push('Excel file must have at least 2 rows (header + data)');
    return { isValid: false, errors };
  }
  
  const headers = data[0];
  if (!Array.isArray(headers) || headers.length === 0) {
    errors.push('Excel file must have headers in the first row');
    return { isValid: false, errors };
  }
  
  // Check if there's any data beyond headers
  const hasData = data.slice(1).some(row => 
    Array.isArray(row) && row.some(cell => cell !== null && cell !== undefined && cell !== '')
  );
  
  if (!hasData) {
    errors.push('Excel file must contain data rows beyond headers');
    return { isValid: false, errors };
  }
  
  return { isValid: errors.length === 0, errors };
}

export async function mapExcelToServiceHierarchy(excelData: any[][], sectorName: string): Promise<ProcessedServiceData> {
  try {
    return await processServiceDataFromSheets(excelData, sectorName);
  } catch (error) {
    console.error('Error mapping Excel to service hierarchy:', error);
    throw error;
  }
}
