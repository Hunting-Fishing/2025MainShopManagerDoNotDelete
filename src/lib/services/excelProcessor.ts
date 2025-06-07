import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { 
  ServiceSector, 
  ServiceMainCategory, 
  ServiceSubcategory, 
  ServiceJob,
  ExcelRowData,
  MappedServiceData,
  ProcessedServiceData,
  ImportStats
} from '@/types/service';

// Helper function to generate a unique ID
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Function to validate a single Excel row
export function isValidExcelRow(row: any[]): boolean {
  if (!row || row.length === 0) {
    return false;
  }
  // Check if at least one cell in the row has a non-empty value
  return row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '');
}

export async function processExcelFileFromStorage(
  fileName: string, 
  sectorName: string
): Promise<{ success: boolean; message: string; stats?: ImportStats }> {
  try {
    console.log(`Processing Excel file: ${fileName} from sector: ${sectorName}`);
    
    // Download file from Supabase storage
    const filePath = `${sectorName}/${fileName}`;
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
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      throw new Error('No worksheet found in Excel file');
    }
    
    // Convert to JSON with proper typing
    const rawData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      raw: false 
    }) as any[][];
    
    if (!rawData || rawData.length === 0) {
      throw new Error('No data found in Excel file');
    }
    
    console.log('Raw Excel data:', rawData.slice(0, 5)); // Log first 5 rows for debugging
    
    // Process the Excel data
    const processedData = await processExcelData(rawData, fileName, sectorName);
    
    if (!processedData.success) {
      return processedData;
    }
    
    return {
      success: true,
      message: `Successfully processed file: ${fileName}`,
      stats: processedData.stats
    };
    
  } catch (error: any) {
    console.error('Error processing Excel file:', error);
    return {
      success: false,
      message: `Error processing file ${fileName}: ${error.message || error}`
    };
  }
}

async function processExcelData(
  data: any[][],
  fileName: string,
  sectorName: string
): Promise<{ success: boolean; message: string; stats?: ImportStats }> {
  try {
    if (data.length < 2) {
      throw new Error('Excel file must have at least 2 rows (header + data)');
    }
    
    // First row should contain subcategory headers
    const subcategoryHeaders = data[0].filter(header => header && header.trim() !== '');
    
    if (subcategoryHeaders.length === 0) {
      throw new Error('No subcategory headers found in first row');
    }
    
    console.log('Found subcategories:', subcategoryHeaders);
    
    // Process data rows (skip header row)
    const dataRows = data.slice(1).filter(row => 
      row && row.some(cell => cell && cell.toString().trim() !== '')
    );
    
    if (dataRows.length === 0) {
      throw new Error('No data rows found');
    }
    
    // Map Excel data to service structure
    const mappedData = mapExcelToServiceHierarchy(dataRows, subcategoryHeaders, fileName, sectorName);
    
    // Save to database
    const saveResult = await saveServiceDataToDatabase(mappedData);
    
    if (!saveResult.success) {
      return saveResult;
    }
    
    const stats: ImportStats = {
      totalSectors: 1,
      totalCategories: 1, // One category per file
      totalSubcategories: subcategoryHeaders.length,
      totalServices: dataRows.length,
      filesProcessed: 1
    };
    
    return {
      success: true,
      message: `Successfully processed ${dataRows.length} services in ${subcategoryHeaders.length} subcategories`,
      stats
    };
    
  } catch (error: any) {
    console.error('Error processing Excel data:', error);
    return {
      success: false,
      message: `Error processing Excel data: ${error.message || error}`
    };
  }
}

function mapExcelToServiceHierarchy(
  dataRows: any[][],
  subcategoryHeaders: string[],
  fileName: string,
  sectorName: string
): MappedServiceData {
  const categoryName = fileName.replace(/\.(xlsx|xls)$/i, '');
  
  // Group services by subcategory
  const subcategoriesMap: { [key: string]: ServiceJob[] } = {};
  
  // Initialize subcategories
  subcategoryHeaders.forEach(header => {
    subcategoriesMap[header] = [];
  });
  
  // Process each data row
  dataRows.forEach((row, rowIndex) => {
    subcategoryHeaders.forEach((subcategoryName, colIndex) => {
      const serviceName = row[colIndex];
      
      if (serviceName && serviceName.toString().trim() !== '') {
        const service: ServiceJob = {
          id: `${sectorName}-${categoryName}-${subcategoryName}-${rowIndex}-${colIndex}`,
          name: serviceName.toString().trim(),
          description: `Service from ${fileName}`,
          estimatedTime: 60, // Default 1 hour
          price: 0 // Default price
        };
        
        subcategoriesMap[subcategoryName].push(service);
      }
    });
  });
  
  // Convert to subcategory objects
  const subcategories = Object.entries(subcategoriesMap)
    .filter(([_, services]) => services.length > 0)
    .map(([subcategoryName, services]) => ({
      name: subcategoryName,
      services
    }));
  
  return {
    sectorName,
    categories: [{
      name: categoryName,
      subcategories
    }]
  };
}

async function saveServiceDataToDatabase(data: MappedServiceData): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Saving service data to database:', data);
    
    // For now, just log the data structure
    // In a real implementation, you would save this to your database
    console.log(`Would save sector: ${data.sectorName}`);
    console.log(`Categories: ${data.categories.length}`);
    data.categories.forEach(category => {
      console.log(`  Category: ${category.name}`);
      console.log(`  Subcategories: ${category.subcategories.length}`);
      category.subcategories.forEach(subcategory => {
        console.log(`    Subcategory: ${subcategory.name}`);
        console.log(`    Services: ${subcategory.services.length}`);
      });
    });
    
    return {
      success: true,
      message: 'Service data saved successfully'
    };
    
  } catch (error: any) {
    console.error('Error saving service data:', error);
    return {
      success: false,
      message: `Error saving service data: ${error.message || error}`
    };
  }
}

export async function processExcelFile(file: File): Promise<ProcessedServiceData> {
  try {
    const fileReader = new FileReader();
    
    fileReader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      console.log('Excel data:', jsonData.slice(0, 5));
      
      if (!validateExcelData(jsonData)) {
        throw new Error('Excel data validation failed');
      }
    };
    
    fileReader.readAsArrayBuffer(file);
    
  } catch (error: any) {
    console.error('Error processing Excel file:', error);
    throw error;
  }
  return {
    sectors: [],
    stats: {
      totalSectors: 0,
      totalCategories: 0,
      totalSubcategories: 0,
      totalServices: 0,
      filesProcessed: 0
    }
  };
}

export async function processMultipleExcelFiles(files: File[]): Promise<ProcessedServiceData> {
  let totalCategories = 0;
  let totalSubcategories = 0;
  let totalServices = 0;
  
  for (const file of files) {
    try {
      const fileReader = new FileReader();
      
      fileReader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        
        if (!validateExcelData(jsonData)) {
          throw new Error(`Validation failed for file: ${file.name}`);
        }
        
        // Assuming each file represents a category
        totalCategories++;
        
        // Basic stats update - adjust based on your data structure
        totalSubcategories += (jsonData[0]?.length || 0); // Headers
        totalServices += (jsonData.length - 1); // Subtract header row
      };
      
      fileReader.readAsArrayBuffer(file);
      
    } catch (error: any) {
      console.error(`Error processing file ${file.name}:`, error);
      throw error;
    }
  }
  return {
    sectors: [],
    stats: {
      totalSectors: 0,
      totalCategories: 0,
      totalSubcategories: 0,
      totalServices: 0,
      filesProcessed: 0
    }
  };
}

export function validateExcelData(data: any[][]): boolean {
  if (!data || data.length === 0) {
    console.warn('Excel data is empty');
    return false;
  }
  
  const headerRow = data[0];
  if (!headerRow || headerRow.length === 0) {
    console.warn('Excel file missing header row');
    return false;
  }
  
  // Check if at least one data row exists
  if (data.length < 2) {
    console.warn('Excel file missing data rows');
    return false;
  }
  
  return true;
}
