
// Consolidated Excel processing utilities for better organization
import { ExcelRowData, MappedServiceData } from '@/types/service';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

/**
 * Maps Excel data to correct service hierarchy
 * @param fileName - The Excel file name (becomes the main category)
 * @param rows - Raw Excel rows
 */
export function mapExcelToServiceHierarchy(fileName: string, rows: any[]): MappedServiceData {
  // Remove .xlsx extension from filename to get category name
  const mainCategoryName = fileName.replace(/\.xlsx?$/i, '').trim();
  
  console.log(`Processing file: ${fileName}, rows: ${rows.length}`);
  
  if (!rows || rows.length < 2) {
    console.warn(`File ${fileName} has insufficient data (needs at least 2 rows)`);
    return {
      sectorName: mainCategoryName,
      categories: [{
        name: mainCategoryName,
        subcategories: []
      }]
    };
  }

  // Get headers from first row to identify columns
  const headers = rows[0];
  const subcategoryColumns = Object.keys(headers).filter(key => 
    headers[key] && typeof headers[key] === 'string' && headers[key].trim()
  );

  console.log(`Found ${subcategoryColumns.length} subcategory columns in ${fileName}`);

  // Process each column as a subcategory
  const subcategories = subcategoryColumns.map(columnKey => {
    const subcategoryName = headers[columnKey].trim();
    const services: any[] = [];

    // Extract services from rows 2-1000 (index 1-999 since we skip header)
    for (let i = 1; i < Math.min(rows.length, 1000); i++) {
      const row = rows[i];
      if (row && row[columnKey]) {
        const serviceName = typeof row[columnKey] === 'string' ? row[columnKey].trim() : String(row[columnKey]).trim();
        
        if (serviceName && serviceName !== '' && serviceName !== 'undefined') {
          services.push({
            name: serviceName,
            description: serviceName, // Use service name as description for now
            estimatedTime: 60, // Default 1 hour
            price: 0 // Default price
          });
        }
      }
    }

    console.log(`Subcategory "${subcategoryName}" has ${services.length} services`);
    
    return {
      name: subcategoryName,
      services
    };
  }).filter(subcategory => subcategory.services.length > 0);

  console.log(`File ${fileName} processed: ${subcategories.length} subcategories, ${subcategories.reduce((total, sub) => total + sub.services.length, 0)} total services`);

  return {
    sectorName: mainCategoryName,
    categories: [{
      name: mainCategoryName,
      subcategories
    }]
  };
}

/**
 * Processes Excel file from File object (for direct uploads)
 */
export async function processExcelFile(file: File): Promise<MappedServiceData> {
  try {
    console.log(`Processing uploaded file: ${file.name}`);
    
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`Converted ${file.name} to JSON with ${jsonData.length} rows`);
    
    // Convert array format to object format for processing
    if (jsonData.length > 0) {
      const headers = jsonData[0] as any[];
      const rows = jsonData.slice(1).map((row: any[]) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          if (header) {
            obj[index] = row[index];
          }
        });
        return obj;
      });
      
      // Add headers as first row for mapExcelToServiceHierarchy
      const processedRows = [
        headers.reduce((acc: any, header, index) => {
          acc[index] = header;
          return acc;
        }, {}),
        ...rows
      ];
      
      return mapExcelToServiceHierarchy(file.name, processedRows);
    }
    
    return {
      sectorName: file.name.replace(/\.xlsx?$/i, ''),
      categories: []
    };
    
  } catch (error) {
    console.error(`Error processing Excel file ${file.name}:`, error);
    throw new Error(`Failed to process Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Processes Excel file from storage
 */
export async function processExcelFileFromStorage(fileName: string, sectorName: string): Promise<MappedServiceData> {
  try {
    console.log(`Processing storage file: ${fileName} from sector: ${sectorName}`);
    
    // Download file from storage
    const { data, error } = await supabase.storage
      .from('service-data')
      .download(`${sectorName}/${fileName}`);

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }

    // Convert blob to array buffer
    const arrayBuffer = await data.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`Converted storage file ${fileName} to JSON with ${jsonData.length} rows`);
    
    // Convert array format to object format for processing
    if (jsonData.length > 0) {
      const headers = jsonData[0] as any[];
      const rows = jsonData.slice(1).map((row: any[]) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          if (header) {
            obj[index] = row[index];
          }
        });
        return obj;
      });
      
      // Add headers as first row for mapExcelToServiceHierarchy
      const processedRows = [
        headers.reduce((acc: any, header, index) => {
          acc[index] = header;
          return acc;
        }, {}),
        ...rows
      ];
      
      return mapExcelToServiceHierarchy(fileName, processedRows);
    }
    
    return {
      sectorName,
      categories: [{
        name: fileName.replace(/\.xlsx?$/i, ''),
        subcategories: []
      }]
    };
    
  } catch (error) {
    console.error('Error processing Excel file from storage:', error);
    throw error;
  }
}

/**
 * Processes multiple Excel files and creates sector-based hierarchy
 */
export function processMultipleExcelFiles(files: { fileName: string; data: any[] }[]): MappedServiceData[] {
  return files.map(file => mapExcelToServiceHierarchy(file.fileName, file.data));
}

/**
 * Validates Excel data structure
 */
export function validateExcelData(data: any[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!Array.isArray(data) || data.length === 0) {
    errors.push('Excel data is empty or invalid');
    return { isValid: false, errors };
  }
  
  if (data.length < 2) {
    errors.push('Excel file must have at least 2 rows (header + data)');
    return { isValid: false, errors };
  }
  
  // Check for required columns
  const firstRow = data[0];
  if (!firstRow || typeof firstRow !== 'object') {
    errors.push('Excel data format is invalid');
    return { isValid: false, errors };
  }
  
  return { isValid: errors.length === 0, errors };
}
