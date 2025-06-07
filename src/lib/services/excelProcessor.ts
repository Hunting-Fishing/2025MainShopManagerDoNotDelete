import { supabase } from '@/integrations/supabase/client';
import { MappedServiceData, ExcelRowData, ProcessedServiceData, ImportStats } from '@/types/service';
import * as XLSX from 'xlsx';

// Define the structure of Excel data
interface ExcelData {
  [key: string]: string | number | undefined;
}

// Function to convert Excel data to JSON
export function convertExcelToJson(file: File): Promise<ExcelData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData: ExcelData[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
}

// Function to validate Excel data
export function validateExcelData(jsonData: ExcelData[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!jsonData || jsonData.length === 0) {
    errors.push('Excel file is empty.');
    return { isValid: false, errors };
  }

  // Add more validation logic here based on your requirements
  return { isValid: errors.length === 0, errors };
}

// Function to process a single Excel file
export async function processExcelFile(file: File): Promise<MappedServiceData> {
  try {
    const jsonData = await convertExcelToJson(file);
    const { isValid, errors } = validateExcelData(jsonData);

    if (!isValid) {
      console.error('Validation errors:', errors);
      throw new Error(`Excel file validation failed: ${errors.join(', ')}`);
    }

    // Map Excel data to service hierarchy
    const mappedData = mapExcelToServiceHierarchy(jsonData, 'defaultSector', file.name);
    return mappedData;
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw error;
  }
}

// Function to process multiple Excel files
export async function processMultipleExcelFiles(files: File[]): Promise<MappedServiceData[]> {
  try {
    const results: MappedServiceData[] = [];

    for (const file of files) {
      const result = await processExcelFile(file);
      results.push(result);
    }

    return results;
  } catch (error) {
    console.error('Error processing multiple Excel files:', error);
    throw error;
  }
}

export async function processExcelFileFromStorage(filePath: string, sectorName: string) {
  try {
    console.log(`Processing Excel file from storage: ${filePath} for sector: ${sectorName}`);
    
    // Download the file from storage
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
    
    // Parse the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with proper typing
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      raw: false 
    }) as any[][];
    
    console.log(`Parsed ${jsonData.length} rows from Excel file`);
    
    // Process the data and save to database
    const processedData = await processExcelData(jsonData, sectorName, filePath);
    
    return {
      success: true,
      message: `Successfully processed ${filePath}`,
      stats: processedData.stats
    };
    
  } catch (error) {
    console.error(`Error processing Excel file ${filePath}:`, error);
    return {
      success: false,
      message: `Failed to process ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      stats: {
        totalSectors: 0,
        totalCategories: 0,
        totalSubcategories: 0,
        totalServices: 0,
        filesProcessed: 0
      }
    };
  }
}

export async function processExcelData(jsonData: any[][], sectorName: string, fileName: string): Promise<ProcessedServiceData> {
  try {
    console.log(`Processing Excel data for sector: ${sectorName}, file: ${fileName}`);
    
    // Skip header row and process data
    const dataRows = jsonData.slice(1);
    const categoryName = fileName.replace(/\.(xlsx|xls)$/i, ''); // Use filename as category name
    
    // Group services by subcategory (assuming Column A is subcategory)
    const subcategoriesMap = new Map<string, any[]>();
    
    dataRows.forEach((row, index) => {
      if (row.length === 0 || !row[0]) return; // Skip empty rows
      
      const subcategoryName = row[0]?.toString().trim() || `Subcategory ${index + 1}`;
      const serviceName = row[1]?.toString().trim() || `Service ${index + 1}`;
      const description = row[2]?.toString().trim() || '';
      const estimatedTime = parseFloat(row[3]?.toString()) || 0;
      const price = parseFloat(row[4]?.toString()) || 0;
      
      if (!subcategoriesMap.has(subcategoryName)) {
        subcategoriesMap.set(subcategoryName, []);
      }
      
      subcategoriesMap.get(subcategoryName)!.push({
        name: serviceName,
        description: description,
        estimatedTime: estimatedTime,
        price: price
      });
    });
    
    // Convert to required structure
    const subcategories = Array.from(subcategoriesMap.entries()).map(([name, services]) => ({
      name,
      services: services.map(service => ({
        name: service.name,
        description: service.description || '', // Ensure description is always a string
        estimatedTime: service.estimatedTime,
        price: service.price
      }))
    }));
    
    const processedData: MappedServiceData = {
      sectorName,
      categories: [{
        name: categoryName,
        subcategories
      }]
    };
    
    // Save to database
    await saveProcessedDataToDatabase(processedData);
    
    const stats: ImportStats = {
      totalSectors: 1,
      totalCategories: 1,
      totalSubcategories: subcategories.length,
      totalServices: subcategories.reduce((sum, sub) => sum + sub.services.length, 0),
      filesProcessed: 1
    };
    
    return {
      sectors: [], // Will be populated by the database save operation
      stats,
      sectorName,
      categories: processedData.categories
    };
    
  } catch (error) {
    console.error('Error processing Excel data:', error);
    throw error;
  }
}

async function saveProcessedDataToDatabase(data: MappedServiceData): Promise<void> {
  try {
    console.log(`Saving processed data to database for sector: ${data.sectorName}`);
    
    // First, create or get the sector
    const { data: existingSector, error: sectorError } = await supabase
      .from('service_sectors')
      .select('id')
      .eq('name', data.sectorName)
      .maybeSingle();
    
    let sectorId: string;
    
    if (existingSector) {
      sectorId = existingSector.id;
    } else {
      const { data: newSector, error: createSectorError } = await supabase
        .from('service_sectors')
        .insert({
          name: data.sectorName,
          description: `Sector for ${data.sectorName} services`,
          is_active: true
        })
        .select('id')
        .single();
      
      if (createSectorError) {
        console.error('Error creating sector:', createSectorError);
        throw createSectorError;
      }
      
      sectorId = newSector.id;
    }
    
    // Process each category
    for (const category of data.categories) {
      // Create or get the category
      const { data: existingCategory, error: categoryError } = await supabase
        .from('service_main_categories')
        .select('id')
        .eq('name', category.name)
        .eq('sector_id', sectorId)
        .maybeSingle();
      
      let categoryId: string;
      
      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const { data: newCategory, error: createCategoryError } = await supabase
          .from('service_main_categories')
          .insert({
            name: category.name,
            description: `Category for ${category.name} services`,
            sector_id: sectorId
          })
          .select('id')
          .single();
        
        if (createCategoryError) {
          console.error('Error creating category:', createCategoryError);
          throw createCategoryError;
        }
        
        categoryId = newCategory.id;
      }
      
      // Process each subcategory
      for (const subcategory of category.subcategories) {
        // Create or get the subcategory
        const { data: existingSubcategory, error: subcategoryError } = await supabase
          .from('service_subcategories')
          .select('id')
          .eq('name', subcategory.name)
          .eq('category_id', categoryId)
          .maybeSingle();
        
        let subcategoryId: string;
        
        if (existingSubcategory) {
          subcategoryId = existingSubcategory.id;
        } else {
          const { data: newSubcategory, error: createSubcategoryError } = await supabase
            .from('service_subcategories')
            .insert({
              name: subcategory.name,
              description: `Subcategory for ${subcategory.name} services`,
              category_id: categoryId
            })
            .select('id')
            .single();
          
          if (createSubcategoryError) {
            console.error('Error creating subcategory:', createSubcategoryError);
            throw createSubcategoryError;
          }
          
          subcategoryId = newSubcategory.id;
        }
        
        // Process each service
        for (const service of subcategory.services) {
          // Check if service already exists
          const { data: existingService } = await supabase
            .from('service_jobs')
            .select('id')
            .eq('name', service.name)
            .eq('subcategory_id', subcategoryId)
            .maybeSingle();
          
          if (!existingService) {
            const { error: createServiceError } = await supabase
              .from('service_jobs')
              .insert({
                name: service.name,
                description: service.description,
                estimated_time: service.estimatedTime,
                price: service.price,
                subcategory_id: subcategoryId
              });
            
            if (createServiceError) {
              console.error('Error creating service:', createServiceError);
              throw createServiceError;
            }
          }
        }
      }
    }
    
    console.log(`Successfully saved data for sector: ${data.sectorName}`);
    
  } catch (error) {
    console.error('Error saving processed data to database:', error);
    throw error;
  }
}

// Export the mapping function
export function mapExcelToServiceHierarchy(jsonData: any[][], sectorName: string, fileName: string): MappedServiceData {
  const categoryName = fileName.replace(/\.(xlsx|xls)$/i, '');
  const dataRows = jsonData.slice(1);
  
  const subcategoriesMap = new Map<string, any[]>();
  
  dataRows.forEach((row, index) => {
    if (row.length === 0 || !row[0]) return;
    
    const subcategoryName = row[0]?.toString().trim() || `Subcategory ${index + 1}`;
    const serviceName = row[1]?.toString().trim() || `Service ${index + 1}`;
    const description = row[2]?.toString().trim() || '';
    const estimatedTime = parseFloat(row[3]?.toString()) || 0;
    const price = parseFloat(row[4]?.toString()) || 0;
    
    if (!subcategoriesMap.has(subcategoryName)) {
      subcategoriesMap.set(subcategoryName, []);
    }
    
    subcategoriesMap.get(subcategoryName)!.push({
      name: serviceName,
      description: description,
      estimatedTime: estimatedTime,
      price: price
    });
  });
  
  const subcategories = Array.from(subcategoriesMap.entries()).map(([name, services]) => ({
    name,
    services: services.map(service => ({
      name: service.name,
      description: service.description || '',
      estimatedTime: service.estimatedTime,
      price: service.price
    }))
  }));
  
  return {
    sectorName,
    categories: [{
      name: categoryName,
      subcategories
    }]
  };
}
