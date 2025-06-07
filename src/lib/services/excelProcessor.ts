import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import {
  insertServiceSector,
  insertServiceCategory,
  insertServiceSubcategory,
  insertServiceJob
} from './serviceApi';
import type { 
  ExcelSectorData, 
  ExcelCategoryData, 
  ProcessedServiceData,
  ImportStats 
} from '@/types/service';

export async function processExcelFileFromStorage(
  filePath: string | undefined,
  sectorName: string
): Promise<ProcessedServiceData> {
  try {
    if (!filePath) {
      throw new Error('File path is required');
    }

    console.log(`Processing Excel file from storage: ${filePath} for sector: ${sectorName}`);
    
    // Download the file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('service-data')
      .download(filePath);
    
    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }
    
    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Parse Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (!jsonData || jsonData.length < 2) {
      throw new Error('Excel file must have at least 2 rows (header + data)');
    }
    
    // Extract file name without extension as category name
    const fileName = filePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'Unknown Category';
    
    // Process the Excel data according to your structure
    const processedData = await processExcelDataToDatabase(jsonData, sectorName, fileName);
    
    return processedData;
    
  } catch (error) {
    console.error('Error processing Excel file from storage:', error);
    throw error;
  }
}

async function processExcelDataToDatabase(
  excelData: any[][],
  sectorName: string,
  categoryName: string
): Promise<ProcessedServiceData> {
  try {
    console.log(`Processing data for sector: ${sectorName}, category: ${categoryName}`);
    
    // Get or create sector
    let sector;
    const { data: existingSector } = await supabase
      .from('service_sectors')
      .select('*')
      .eq('name', sectorName)
      .single();
    
    if (existingSector) {
      sector = existingSector;
    } else {
      sector = await insertServiceSector({
        name: sectorName,
        description: `${sectorName} services`,
        is_active: true,
        position: 1
      });
    }
    
    // Get or create category
    let category;
    const { data: existingCategory } = await supabase
      .from('service_categories')
      .select('*')
      .eq('name', categoryName)
      .eq('sector_id', sector.id)
      .single();
    
    if (existingCategory) {
      category = existingCategory;
    } else {
      category = await insertServiceCategory({
        name: categoryName,
        description: `${categoryName} services`,
        sector_id: sector.id,
        position: 1
      });
    }
    
    // Extract subcategories from row 1 (index 0)
    const subcategoryHeaders = excelData[0].filter((header: string) => header && header.trim() !== '');
    
    let totalServices = 0;
    const subcategoryCount = subcategoryHeaders.length;
    
    // Process each subcategory
    for (let colIndex = 0; colIndex < subcategoryHeaders.length; colIndex++) {
      const subcategoryName = subcategoryHeaders[colIndex].trim();
      
      // Get or create subcategory
      let subcategory;
      const { data: existingSubcategory } = await supabase
        .from('service_subcategories')
        .select('*')
        .eq('name', subcategoryName)
        .eq('category_id', category.id)
        .single();
      
      if (existingSubcategory) {
        subcategory = existingSubcategory;
      } else {
        subcategory = await insertServiceSubcategory({
          name: subcategoryName,
          description: `${subcategoryName} services`,
          category_id: category.id
        });
      }
      
      // Process services for this subcategory (rows 2-1000, indexes 1-999)
      for (let rowIndex = 1; rowIndex < Math.min(excelData.length, 1000); rowIndex++) {
        const row = excelData[rowIndex];
        const serviceName = row[colIndex];
        
        if (serviceName && serviceName.trim() !== '') {
          // Check if service already exists
          const { data: existingJob } = await supabase
            .from('service_jobs')
            .select('*')
            .eq('name', serviceName.trim())
            .eq('subcategory_id', subcategory.id)
            .single();
          
          if (!existingJob) {
            await insertServiceJob({
              name: serviceName.trim(),
              description: `${serviceName.trim()} service`,
              estimatedTime: 60, // Default 1 hour
              price: 100, // Default price
              subcategory_id: subcategory.id
            });
          }
          
          totalServices++;
        }
      }
    }
    
    const stats: ImportStats = {
      totalSectors: 1,
      totalCategories: 1,
      totalSubcategories: subcategoryCount,
      totalServices,
      filesProcessed: 1
    };
    
    console.log(`Import completed. Stats:`, stats);
    
    return {
      sectors: [sector],
      stats,
      sectorName,
      categories: [{
        name: categoryName,
        subcategories: subcategoryHeaders.map(name => ({ name, services: [] }))
      }]
    };
    
  } catch (error) {
    console.error('Error processing Excel data to database:', error);
    throw error;
  }
}

// Excel import types - Updated to match actual structure
export interface ExcelRowData {
  category: string;
  subcategory: string;
  serviceName: string;
  description: string;
  estimatedTime: number;
  price: number;
}

export async function processExcelFile(file: File): Promise<any> {
  try {
    const reader = new FileReader();

    reader.onload = async (e: any) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });

      workbook.SheetNames.forEach(sheet => {
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
        console.log(data);  // Process the data as needed
      });
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
    };

    reader.readAsBinaryString(file);
    return { success: true, message: 'File processing started.' };
  } catch (error) {
    console.error("Error processing Excel file:", error);
    return { success: false, message: 'Failed to process Excel file.' };
  }
}

export async function processMultipleExcelFiles(files: File[]): Promise<any> {
  try {
    for (const file of files) {
      await processExcelFile(file);
    }
    return { success: true, message: 'All files processed.' };
  } catch (error) {
    console.error("Error processing multiple Excel files:", error);
    return { success: false, message: 'Failed to process all Excel files.' };
  }
}

export async function validateExcelData(data: any): Promise<boolean> {
  if (!data || typeof data !== 'object') {
    console.warn("Invalid data format: Expected an object.");
    return false;
  }

  // Add more specific checks based on your data structure
  if (!data.hasOwnProperty('category') || !data.hasOwnProperty('subcategory') || !data.hasOwnProperty('serviceName')) {
    console.warn("Missing required fields in data.");
    return false;
  }

  return true;
}

export async function mapExcelToServiceHierarchy(data: any): Promise<any> {
  if (!Array.isArray(data)) {
    console.error('Data is not an array.');
    return null;
  }

  const hierarchy = {
    sectors: [
      {
        name: 'Default Sector',
        categories: [
          {
            name: 'Default Category',
            subcategories: [
              {
                name: 'Default Subcategory',
                services: []
              }
            ]
          }
        ]
      }
    ]
  };

  return hierarchy;
}
