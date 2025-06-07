
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import {
  insertServiceSector,
  insertServiceCategory,
  insertServiceSubcategory,
  insertServiceJob
} from './serviceApi';
import { processServiceDataFromSheets } from './serviceDataProcessor';
import type { ImportResult, ImportStats } from '@/types/service';

export async function processExcelFile(file: File, sectorName: string): Promise<ImportResult> {
  try {
    console.log(`Processing Excel file: ${file.name} for sector: ${sectorName}`);
    
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first worksheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON array (each row becomes an array)
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
    
    if (!data || data.length < 2) {
      throw new Error('Excel file must have at least 2 rows (headers + data)');
    }
    
    // Process the data using the service data processor
    const processedData = await processServiceDataFromSheets(data, sectorName);
    
    // Now save to database
    await saveProcessedDataToDatabase(processedData, sectorName, file.name);
    
    return {
      success: true,
      message: `Successfully processed ${file.name}`,
      stats: processedData.stats
    };
    
  } catch (error) {
    console.error('Error processing Excel file:', error);
    return {
      success: false,
      message: `Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function processExcelFileFromStorage(filePath: string, sectorName: string): Promise<ImportResult> {
  try {
    console.log(`Processing Excel file from storage: ${filePath} for sector: ${sectorName}`);
    
    // Download file from Supabase storage
    const { data: fileData, error } = await supabase.storage
      .from('service-data')
      .download(filePath);
    
    if (error) {
      throw new Error(`Failed to download file from storage: ${error.message}`);
    }
    
    if (!fileData) {
      throw new Error('No file data received from storage');
    }
    
    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first worksheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON array (each row becomes an array)
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
    
    if (!data || data.length < 2) {
      throw new Error('Excel file must have at least 2 rows (headers + data)');
    }
    
    // Process the data using the service data processor
    const processedData = await processServiceDataFromSheets(data, sectorName);
    
    // Extract the file name from the path for category name
    const fileName = filePath.split('/').pop()?.replace('.xlsx', '').replace('.xls', '') || 'Unknown';
    
    // Now save to database
    await saveProcessedDataToDatabase(processedData, sectorName, fileName);
    
    return {
      success: true,
      message: `Successfully processed ${fileName} from storage`,
      stats: processedData.stats
    };
    
  } catch (error) {
    console.error('Error processing Excel file from storage:', error);
    return {
      success: false,
      message: `Failed to process ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function saveProcessedDataToDatabase(processedData: any, sectorName: string, fileName: string): Promise<void> {
  try {
    console.log(`Saving processed data to database for sector: ${sectorName}, file: ${fileName}`);
    
    // Create or get the sector
    const sectorId = await insertServiceSector(sectorName, `Services for ${sectorName} sector`);
    
    // Create main category using the file name
    const categoryId = await insertServiceCategory(sectorId, fileName, `Category from ${fileName}`);
    
    // Process subcategories and services from the processed data
    if (processedData.categories && processedData.categories.length > 0) {
      const category = processedData.categories[0]; // We expect one category per file
      
      for (const subcategoryData of category.subcategories || []) {
        const subcategoryId = await insertServiceSubcategory(
          categoryId, 
          subcategoryData.name, 
          `Subcategory for ${subcategoryData.name}`
        );
        
        // Add services to this subcategory
        for (const service of subcategoryData.services || []) {
          await insertServiceJob(
            subcategoryId,
            service.name,
            service.description || '',
            service.estimatedTime || 60,
            service.price || 100
          );
        }
      }
    }
    
    console.log(`Successfully saved data for ${fileName} to database`);
  } catch (error) {
    console.error('Error saving to database:', error);
    throw error;
  }
}

export async function processMultipleExcelFiles(files: File[], sectorName: string): Promise<ImportResult> {
  const results: ImportResult[] = [];
  
  for (const file of files) {
    const result = await processExcelFile(file, sectorName);
    results.push(result);
  }
  
  const successCount = results.filter(r => r.success).length;
  const totalStats = results.reduce((acc, result) => {
    if (result.stats) {
      acc.totalSectors += result.stats.totalSectors;
      acc.totalCategories += result.stats.totalCategories;
      acc.totalSubcategories += result.stats.totalSubcategories;
      acc.totalServices += result.stats.totalServices;
      acc.filesProcessed += result.stats.filesProcessed;
    }
    return acc;
  }, { totalSectors: 0, totalCategories: 0, totalSubcategories: 0, totalServices: 0, filesProcessed: 0 });
  
  return {
    success: successCount === files.length,
    message: `Processed ${successCount}/${files.length} files successfully`,
    stats: totalStats
  };
}

export function validateExcelData(data: any[][]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data || data.length < 2) {
    errors.push('Excel file must have at least 2 rows (headers + data)');
  }
  
  if (data.length > 0 && data[0].length === 0) {
    errors.push('Excel file must have at least one column');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function mapExcelToServiceHierarchy(data: any[][], sectorName: string) {
  // This function maps Excel data to our service hierarchy
  // Implementation depends on the specific Excel format
  console.log('Mapping Excel data to service hierarchy for sector:', sectorName);
  
  const subcategoryHeaders = data[0].filter((header: string) => header && header.trim() !== '');
  const services = [];
  
  // Process each row starting from row 2 (index 1)
  for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex];
    
    subcategoryHeaders.forEach((subcategoryName: string, columnIndex: number) => {
      const serviceName = row[columnIndex];
      if (serviceName && serviceName.trim() !== '') {
        services.push({
          subcategory: subcategoryName.trim(),
          name: serviceName.trim(),
          description: `Service in ${subcategoryName}`,
          estimatedTime: 60,
          price: 100
        });
      }
    });
  }
  
  return services;
}
