import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { 
  insertServiceSector, 
  insertServiceCategory, 
  insertServiceSubcategory, 
  insertServiceJob 
} from './serviceApi';
import type { ProcessedServiceData, ExcelRowData } from '@/types/service';

export async function processExcelFileFromStorage(
  filePath: string,
  sectorName: string
): Promise<ProcessedServiceData> {
  try {
    console.log(`Processing Excel file from storage: ${filePath} for sector: ${sectorName}`);
    
    // Download the file from Supabase storage
    const { data: fileData, error } = await supabase.storage
      .from('service-data')
      .download(filePath);
    
    if (error) {
      throw new Error(`Failed to download file ${filePath}: ${error.message}`);
    }
    
    if (!fileData) {
      throw new Error(`No data received for file ${filePath}`);
    }
    
    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Parse the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const worksheetName = workbook.SheetNames[0];
    
    if (!worksheetName) {
      throw new Error(`No worksheets found in file ${filePath}`);
    }
    
    const worksheet = workbook.Sheets[worksheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (!Array.isArray(jsonData) || jsonData.length < 2) {
      throw new Error(`Invalid data structure in file ${filePath}. Expected at least 2 rows.`);
    }
    
    // Extract category name from file name (without extension)
    const fileName = filePath.split('/').pop() || '';
    const categoryName = fileName.replace(/\.(xlsx|xls)$/i, '');
    
    // Process the Excel data according to the structure:
    // - Row 1: Subcategory headers
    // - Rows 2-1000: Services for each subcategory
    const subcategoryHeaders = (jsonData[0] as string[]).filter(header => header && header.trim() !== '');
    
    if (subcategoryHeaders.length === 0) {
      throw new Error(`No subcategory headers found in row 1 of file ${filePath}`);
    }
    
    console.log(`Found ${subcategoryHeaders.length} subcategories in ${fileName}`);
    
    // Create or get sector
    const sectorId = await insertServiceSector(sectorName);
    console.log(`Created/found sector: ${sectorName} with ID: ${sectorId}`);
    
    // Create category
    const categoryId = await insertServiceCategory(categoryName, `Category from ${fileName}`, 1, sectorId);
    console.log(`Created category: ${categoryName} with ID: ${categoryId}`);
    
    const subcategories = [];
    
    // Process each subcategory column
    for (let colIndex = 0; colIndex < subcategoryHeaders.length; colIndex++) {
      const subcategoryName = subcategoryHeaders[colIndex].trim();
      
      // Create subcategory
      const subcategoryId = await insertServiceSubcategory(categoryId, subcategoryName);
      console.log(`Created subcategory: ${subcategoryName} with ID: ${subcategoryId}`);
      
      const services = [];
      
      // Extract services from rows 2-1000 for this column
      for (let rowIndex = 1; rowIndex < Math.min(jsonData.length, 1001); rowIndex++) {
        const row = jsonData[rowIndex] as string[];
        const serviceName = row[colIndex];
        
        if (serviceName && serviceName.trim() !== '') {
          try {
            // Create service job
            const jobId = await insertServiceJob(
              subcategoryId,
              serviceName.trim(),
              `${categoryName} service from ${fileName}`,
              60, // Default 1 hour
              100 // Default price
            );
            
            services.push({
              id: jobId,
              name: serviceName.trim(),
              description: `${categoryName} service from ${fileName}`,
              estimatedTime: 60,
              price: 100,
              subcategory_id: subcategoryId
            });
            
            console.log(`Created service: ${serviceName.trim()} with ID: ${jobId}`);
          } catch (serviceError) {
            console.error(`Error creating service ${serviceName}:`, serviceError);
          }
        }
      }
      
      subcategories.push({
        id: subcategoryId,
        name: subcategoryName,
        jobs: services,
        category_id: categoryId
      });
    }
    
    const result: ProcessedServiceData = {
      sectors: [{
        id: sectorId,
        name: sectorName,
        categories: [{
          id: categoryId,
          name: categoryName,
          subcategories,
          sector_id: sectorId
        }]
      }],
      stats: {
        totalSectors: 1,
        totalCategories: 1,
        totalSubcategories: subcategories.length,
        totalServices: subcategories.reduce((acc, sub) => acc + sub.jobs.length, 0),
        filesProcessed: 1
      },
      sectorName,
      categories: [{
        name: categoryName,
        subcategories: subcategories.map(sub => ({
          name: sub.name,
          services: sub.jobs.map(job => ({
            name: job.name,
            description: job.description || '',
            estimatedTime: job.estimatedTime || 60,
            price: job.price || 100
          }))
        }))
      }]
    };
    
    console.log(`Successfully processed file ${fileName}:`, {
      subcategories: subcategories.length,
      totalServices: result.stats.totalServices
    });
    
    return result;
    
  } catch (error) {
    console.error(`Error processing Excel file ${filePath}:`, error);
    throw error;
  }
}

export function mapExcelToServiceHierarchy(excelData: ExcelRowData[]) {
  // Implementation for direct Excel data mapping
  return {
    sectorName: 'Imported Data',
    categories: []
  };
}

export async function processExcelFile(file: File) {
  // Implementation for processing uploaded files
  return {
    sectors: [],
    stats: {
      totalSectors: 0,
      totalCategories: 0,
      totalSubcategories: 0,
      totalServices: 0,
      filesProcessed: 1
    }
  };
}

export async function processMultipleExcelFiles(files: File[]) {
  // Implementation for processing multiple files
  return {
    sectors: [],
    stats: {
      totalSectors: 0,
      totalCategories: 0,
      totalSubcategories: 0,
      totalServices: 0,
      filesProcessed: files.length
    }
  };
}

export function validateExcelData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
  }
  
  return { isValid: errors.length === 0, errors };
}
