
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import {
  insertServiceSector,
  insertServiceCategory,
  insertServiceSubcategory,
  insertServiceJob
} from './serviceApi';
import { StorageFile } from '@/types/service';

export async function processExcelFile(file: File, sectorName: string) {
  try {
    console.log(`Processing Excel file: ${file.name} for sector: ${sectorName}`);
    
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first sheet (assuming one sheet per file)
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error('No sheets found in Excel file');
    }
    
    const worksheet = workbook.Sheets[firstSheetName];
    if (!worksheet) {
      throw new Error('Could not read worksheet data');
    }
    
    // Convert sheet to JSON format - this gives us array of arrays
    const sheetData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, // Use array format instead of object format
      defval: '' // Default value for empty cells
    }) as any[][];
    
    console.log('Sheet data extracted:', sheetData.length, 'rows');
    
    if (sheetData.length < 2) {
      throw new Error('Excel file must have at least 2 rows (headers and data)');
    }
    
    // Process the data
    await processExcelData(sheetData, sectorName, file.name);
    
    return {
      success: true,
      message: `Successfully processed ${file.name}`,
      stats: {
        totalSectors: 1,
        totalCategories: 1,
        totalSubcategories: 0,
        totalServices: 0,
        filesProcessed: 1
      }
    };
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw error;
  }
}

export async function processExcelFileFromStorage(filePath: string | undefined, sectorName: string) {
  try {
    if (!filePath) {
      throw new Error('File path is required');
    }
    
    console.log(`Processing Excel file from storage: ${filePath} for sector: ${sectorName}`);
    
    // Download file from storage
    const { data, error } = await supabase.storage
      .from('service-data')
      .download(filePath);
    
    if (error) {
      console.error('Error downloading file from storage:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No file data received from storage');
    }
    
    // Convert blob to array buffer
    const arrayBuffer = await data.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error('No sheets found in Excel file');
    }
    
    const worksheet = workbook.Sheets[firstSheetName];
    if (!worksheet) {
      throw new Error('Could not read worksheet data');
    }
    
    // Convert sheet to array format
    const sheetData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: ''
    }) as any[][];
    
    console.log('Sheet data extracted from storage:', sheetData.length, 'rows');
    
    if (sheetData.length < 2) {
      throw new Error('Excel file must have at least 2 rows (headers and data)');
    }
    
    // Extract category name from file path (remove .xlsx extension)
    const fileName = filePath.split('/').pop() || '';
    const categoryName = fileName.replace(/\.(xlsx|xls)$/i, '');
    
    // Process the data
    await processExcelData(sheetData, sectorName, categoryName);
    
    return {
      success: true,
      message: `Successfully processed ${fileName}`,
      stats: {
        totalSectors: 1,
        totalCategories: 1,
        totalSubcategories: 0,
        totalServices: 0,
        filesProcessed: 1
      }
    };
  } catch (error) {
    console.error('Error processing Excel file from storage:', error);
    throw error;
  }
}

async function processExcelData(sheetData: any[][], sectorName: string, categoryName: string) {
  try {
    console.log(`Processing Excel data for sector: ${sectorName}, category: ${categoryName}`);
    
    // Create or get sector
    const sector = await insertServiceSector({
      name: sectorName,
      description: `${sectorName} services sector`,
      position: 1,
      is_active: true
    });
    
    // Create category (from file name)
    const category = await insertServiceCategory({
      name: categoryName,
      description: `${categoryName} services`,
      position: 1,
      sector_id: sector.id
    });
    
    // Row 1 contains subcategory headers
    const subcategoryHeaders = sheetData[0] || [];
    console.log('Subcategory headers:', subcategoryHeaders);
    
    // Process each column (subcategory)
    for (let colIndex = 0; colIndex < subcategoryHeaders.length; colIndex++) {
      const subcategoryName = subcategoryHeaders[colIndex];
      
      if (!subcategoryName || subcategoryName.trim() === '') {
        continue; // Skip empty headers
      }
      
      // Create subcategory
      const subcategory = await insertServiceSubcategory({
        name: subcategoryName.trim(),
        description: `${subcategoryName} services in ${categoryName}`,
        category_id: category.id
      });
      
      // Process services in this column (rows 2-1000)
      let serviceCount = 0;
      for (let rowIndex = 1; rowIndex < Math.min(sheetData.length, 1001); rowIndex++) {
        const row = sheetData[rowIndex];
        const serviceName = row && row[colIndex] ? row[colIndex] : '';
        
        if (serviceName && serviceName.toString().trim() !== '') {
          // Create service
          await insertServiceJob({
            name: serviceName.toString().trim(),
            description: `${serviceName} service in ${subcategoryName}`,
            estimatedTime: 60, // Default 1 hour
            price: 100, // Default price
            subcategory_id: subcategory.id
          });
          serviceCount++;
        }
      }
      
      console.log(`Created ${serviceCount} services for subcategory: ${subcategoryName}`);
    }
    
    console.log(`Successfully processed category: ${categoryName}`);
  } catch (error) {
    console.error('Error processing Excel data:', error);
    throw error;
  }
}

export async function processMultipleExcelFiles(files: File[], sectorName: string) {
  const results = [];
  
  for (const file of files) {
    try {
      const result = await processExcelFile(file, sectorName);
      results.push(result);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      results.push({
        success: false,
        message: `Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        stats: {
          totalSectors: 0,
          totalCategories: 0,
          totalSubcategories: 0,
          totalServices: 0,
          filesProcessed: 0
        }
      });
    }
  }
  
  return results;
}

export function validateExcelData(data: any[][]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!Array.isArray(data) || data.length < 2) {
    errors.push('Excel file must have at least 2 rows (headers and data)');
  }
  
  if (data.length > 0 && (!Array.isArray(data[0]) || data[0].length === 0)) {
    errors.push('First row must contain subcategory headers');
  }
  
  return { isValid: errors.length === 0, errors };
}

export function mapExcelToServiceHierarchy(data: any[][], sectorName: string, categoryName: string) {
  // This function can be used for mapping without database operations
  const subcategoryHeaders = data[0] || [];
  
  const subcategories = subcategoryHeaders.map((header: any, colIndex: number) => {
    if (!header || header.toString().trim() === '') return null;
    
    const services = [];
    for (let rowIndex = 1; rowIndex < Math.min(data.length, 1001); rowIndex++) {
      const row = data[rowIndex];
      const serviceName = row && row[colIndex] ? row[colIndex] : '';
      
      if (serviceName && serviceName.toString().trim() !== '') {
        services.push({
          name: serviceName.toString().trim(),
          description: `${serviceName} service`,
          estimatedTime: 60,
          price: 100
        });
      }
    }
    
    return {
      name: header.toString().trim(),
      services
    };
  }).filter(Boolean);
  
  return {
    sectorName,
    categories: [{
      name: categoryName,
      subcategories
    }]
  };
}
