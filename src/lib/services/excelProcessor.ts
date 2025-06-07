
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import type { MappedServiceData, ProcessedServiceData, ImportStats } from '@/types/service';

export async function processExcelFileFromStorage(
  filePath: string, 
  sectorName: string
): Promise<{ success: boolean; message: string; stats?: ImportStats }> {
  try {
    console.log(`Processing Excel file from storage: ${filePath} for sector: ${sectorName}`);
    
    // Download the file from Supabase storage
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
    
    // Convert blob to array buffer for XLSX processing
    const arrayBuffer = await fileData.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Process the workbook
    const result = await processWorkbook(workbook, sectorName);
    
    if (result.success) {
      // Save to database here (implement database saving logic)
      console.log('Successfully processed Excel file:', result);
      
      return {
        success: true,
        message: `Successfully processed ${filePath}`,
        stats: result.stats
      };
    } else {
      return {
        success: false,
        message: result.message
      };
    }
    
  } catch (error) {
    console.error('Error processing Excel file from storage:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      message: `Failed to process ${filePath}: ${errorMessage}`
    };
  }
}

async function processWorkbook(
  workbook: XLSX.WorkBook, 
  sectorName: string
): Promise<{ success: boolean; message: string; stats?: ImportStats }> {
  try {
    const sheetNames = workbook.SheetNames;
    
    if (sheetNames.length === 0) {
      return {
        success: false,
        message: 'No worksheets found in the Excel file'
      };
    }
    
    // Process the first sheet
    const firstSheetName = sheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    if (!worksheet) {
      return {
        success: false,
        message: 'Could not access worksheet data'
      };
    }
    
    // Convert worksheet to 2D array
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
    
    if (!Array.isArray(data) || data.length === 0) {
      return {
        success: false,
        message: 'No data found in worksheet'
      };
    }
    
    // Process the data according to the expected structure
    const mappedData = await mapExcelToServiceHierarchy(data, sectorName, firstSheetName);
    
    if (!mappedData) {
      return {
        success: false,
        message: 'Failed to map Excel data to service hierarchy'
      };
    }
    
    // Calculate stats
    const stats: ImportStats = {
      totalSectors: 1,
      totalCategories: mappedData.categories.length,
      totalSubcategories: mappedData.categories.reduce((acc, cat) => acc + cat.subcategories.length, 0),
      totalServices: mappedData.categories.reduce((acc, cat) => 
        acc + cat.subcategories.reduce((subAcc, sub) => subAcc + sub.services.length, 0), 0
      ),
      filesProcessed: 1
    };
    
    return {
      success: true,
      message: `Successfully processed Excel data for sector: ${sectorName}`,
      stats
    };
    
  } catch (error) {
    console.error('Error processing workbook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      message: `Failed to process workbook: ${errorMessage}`
    };
  }
}

export async function mapExcelToServiceHierarchy(
  data: any[][],
  sectorName: string,
  fileName: string
): Promise<MappedServiceData | null> {
  try {
    if (!Array.isArray(data) || data.length < 2) {
      console.warn('Insufficient data rows for processing');
      return null;
    }
    
    // Extract category name from filename (remove .xlsx extension)
    const categoryName = fileName.replace(/\.(xlsx|xls)$/i, '');
    
    // First row contains subcategory headers
    const headers = data[0] as string[];
    if (!headers || headers.length === 0) {
      console.warn('No headers found in Excel file');
      return null;
    }
    
    // Initialize subcategories based on headers
    const subcategories: { [key: string]: any[] } = {};
    headers.forEach((header, index) => {
      if (header && typeof header === 'string' && header.trim()) {
        subcategories[header.trim()] = [];
      }
    });
    
    // Process data rows (skip header row)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || !Array.isArray(row)) continue;
      
      headers.forEach((header, colIndex) => {
        if (header && subcategories[header] && row[colIndex]) {
          const serviceName = String(row[colIndex]).trim();
          if (serviceName) {
            subcategories[header].push({
              name: serviceName,
              description: serviceName,
              estimatedTime: 60, // Default 60 minutes
              price: 0 // Default price
            });
          }
        }
      });
    }
    
    // Convert to the expected structure
    const mappedSubcategories = Object.entries(subcategories)
      .filter(([_, services]) => services.length > 0)
      .map(([name, services]) => ({
        name,
        services
      }));
    
    return {
      sectorName,
      categories: [{
        name: categoryName,
        subcategories: mappedSubcategories
      }]
    };
    
  } catch (error) {
    console.error('Error mapping Excel to service hierarchy:', error);
    return null;
  }
}

// Legacy functions for backward compatibility
export async function processExcelFile() {
  throw new Error('processExcelFile is deprecated, use processExcelFileFromStorage instead');
}

export async function processMultipleExcelFiles() {
  throw new Error('processMultipleExcelFiles is deprecated, use processExcelFileFromStorage instead');
}

export async function validateExcelData() {
  return { isValid: true, errors: [] };
}
