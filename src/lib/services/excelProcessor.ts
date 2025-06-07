import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import type { ServiceHierarchy, ImportStats } from '@/types/service';

export interface ExcelService {
  name: string;
  description: string;
  estimatedDuration: number;
  price: number;
}

export interface ExcelSubcategory {
  name: string;
  services: ExcelService[];
}

export interface ExcelCategory {
  name: string;
  subcategories: ExcelSubcategory[];
}

export interface ExcelSector {
  name: string;
  categories: ExcelCategory[];
}

/**
 * Processes multiple Excel files and transforms them into a structured service hierarchy.
 * @param files An array of File objects, each representing an Excel file.
 * @returns A promise that resolves to a ServiceHierarchy object.
 */
export async function processMultipleExcelFiles(files: File[]): Promise<ServiceHierarchy[]> {
  const serviceHierarchies: ServiceHierarchy[] = [];

  for (const file of files) {
    try {
      const serviceHierarchy = await processExcelFile(file);
      serviceHierarchies.push(serviceHierarchy);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      // Optionally, handle the error or re-throw it
    }
  }

  return serviceHierarchies;
}

/**
 * Processes a single Excel file and transforms it into a structured service hierarchy.
 * @param file A File object representing an Excel file.
 * @returns A promise that resolves to a ServiceHierarchy object.
 */
export async function processExcelFile(file: File): Promise<ServiceHierarchy> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      try {
        /* Parse data */
        const binarystr: string = e.target?.result as string;
        const workbook: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });

        /* Get first worksheet */
        const worksheetName: string = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[worksheetName];

        /* Convert array of arrays */
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        // Basic validation: Check if data is not empty
        if (!data || data.length === 0) {
          throw new Error('Excel file is empty or contains no data.');
        }

        // Transform the Excel data into a service hierarchy
        const serviceHierarchy = mapExcelToServiceHierarchy(data, 'default', file.name);
        resolve(serviceHierarchy);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Transforms Excel data into a structured service hierarchy.
 * @param data An array of arrays representing the Excel data.
 * @param sectorName The name of the service sector.
 * @param categoryName The name of the service category (e.g., the Excel file name).
 * @returns A ServiceHierarchy object.
 */
export async function mapExcelToServiceHierarchy(data: any[][], sectorName: string, categoryName: string): Promise<ServiceHierarchy> {
  const subcategories: { name: string; services: { name: string; description: string; estimatedDuration: number; price: number; }[]; }[] = [];
  let currentSubcategory: { name: string; services: { name: string; description: string; estimatedDuration: number; price: number; }[]; } | null = null;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    // Assuming the first column is the subcategory and subsequent columns are service details
    const subcategoryName = row[0]?.toString().trim();
    const serviceName = row[1]?.toString().trim();
    const serviceDescription = row[2]?.toString().trim();
    const estimatedDuration = parseFloat(row[3]?.toString().trim()) || 0;
    const servicePrice = parseFloat(row[4]?.toString().trim()) || 0;

    if (subcategoryName) {
      // If a subcategory name is found, create a new subcategory
      currentSubcategory = {
        name: subcategoryName,
        services: [],
      };
      subcategories.push(currentSubcategory);
    }

    if (currentSubcategory && serviceName) {
      // If a service name is found, add the service to the current subcategory
      currentSubcategory.services.push({
        name: serviceName,
        description: serviceDescription,
        estimatedDuration: estimatedDuration,
        price: servicePrice,
      });
    }
  }

  return {
    sectorName: sectorName,
    categoryName: categoryName,
    subcategories: subcategories,
  };
}

/**
 * Validates the structure and content of Excel data.
 * @param data An array of arrays representing the Excel data.
 * @returns An array of error messages, or an empty array if the data is valid.
 */
export function validateExcelData(data: any[][]): string[] {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Data is not an array.');
    return errors;
  }

  if (data.length === 0) {
    errors.push('Data is empty.');
    return errors;
  }

  for (let i = 0; i < data.length; i++) {
    const row = data[i];

    if (!Array.isArray(row)) {
      errors.push(`Row ${i + 1} is not an array.`);
      continue;
    }

    if (row.length < 2) {
      errors.push(`Row ${i + 1} does not have enough columns.`);
      continue;
    }

    const subcategoryName = row[0]?.toString().trim();
    const serviceName = row[1]?.toString().trim();
    const serviceDescription = row[2]?.toString().trim();
    const estimatedDuration = parseFloat(row[3]?.toString().trim()) || 0;
    const servicePrice = parseFloat(row[4]?.toString().trim()) || 0;

    if (!subcategoryName) {
      errors.push(`Row ${i + 1}, Column 1: Subcategory name is missing.`);
    }

    if (serviceName && serviceName.length > 255) {
      errors.push(`Row ${i + 1}, Column 2: Service name is too long (max 255 characters).`);
    }

    if (serviceDescription && serviceDescription.length > 1000) {
      errors.push(`Row ${i + 1}, Column 3: Service description is too long (max 1000 characters).`);
    }

    if (isNaN(estimatedDuration)) {
      errors.push(`Row ${i + 1}, Column 4: Estimated duration is not a number.`);
    }

    if (isNaN(servicePrice)) {
      errors.push(`Row ${i + 1}, Column 5: Service price is not a number.`);
    }
  }

  return errors;
}

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
      console.error('Error downloading file from storage:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }
    
    if (!fileData) {
      throw new Error('No file data received from storage');
    }
    
    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Parse Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    
    if (!firstSheetName) {
      throw new Error('No sheets found in Excel file');
    }
    
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON with proper typing
    const rawData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      raw: false 
    }) as any[][];
    
    if (!rawData || rawData.length === 0) {
      console.log('No data found in Excel file');
      return {
        success: true,
        message: 'File processed but no data found',
        stats: {
          totalSectors: 0,
          totalCategories: 0,
          totalSubcategories: 0,
          totalServices: 0,
          filesProcessed: 1
        }
      };
    }
    
    // Extract filename without extension for category name
    const fileName = filePath.split('/').pop() || '';
    const categoryName = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
    
    console.log(`Processing category: ${categoryName} in sector: ${sectorName}`);
    
    // Process the data using existing mapExcelToServiceHierarchy function
    const hierarchy = await mapExcelToServiceHierarchy(rawData, sectorName, categoryName);
    
    // Save to database
    const saveResult = await saveServiceHierarchyToDatabase(hierarchy);
    
    if (saveResult.success) {
      return {
        success: true,
        message: `Successfully processed file: ${fileName}`,
        stats: saveResult.stats
      };
    } else {
      throw new Error(saveResult.message);
    }
    
  } catch (error) {
    console.error('Error processing Excel file from storage:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      message: `Failed to process file ${filePath}: ${errorMessage}`
    };
  }
}

async function saveServiceHierarchyToDatabase(hierarchy: ServiceHierarchy): Promise<{ success: boolean; message: string; stats: ImportStats }> {
  try {
    console.log('Saving service hierarchy to database:', hierarchy);
    
    let stats: ImportStats = {
      totalSectors: 0,
      totalCategories: 0,
      totalSubcategories: 0,
      totalServices: 0,
      filesProcessed: 1
    };
    
    // 1. Create or get sector
    const { data: existingSector } = await supabase
      .from('service_sectors')
      .select('id')
      .eq('name', hierarchy.sectorName)
      .single();
    
    let sectorId: string;
    
    if (existingSector) {
      sectorId = existingSector.id;
      console.log(`Using existing sector: ${hierarchy.sectorName}`);
    } else {
      const { data: newSector, error: sectorError } = await supabase
        .from('service_sectors')
        .insert([{ 
          name: hierarchy.sectorName,
          description: `Services for ${hierarchy.sectorName} sector`
        }])
        .select('id')
        .single();
      
      if (sectorError) {
        throw new Error(`Failed to create sector: ${sectorError.message}`);
      }
      
      sectorId = newSector.id;
      stats.totalSectors = 1;
      console.log(`Created new sector: ${hierarchy.sectorName}`);
    }
    
    // 2. Create or get category
    const { data: existingCategory } = await supabase
      .from('service_categories')
      .select('id')
      .eq('name', hierarchy.categoryName)
      .eq('sector_id', sectorId)
      .single();
    
    let categoryId: string;
    
    if (existingCategory) {
      categoryId = existingCategory.id;
      console.log(`Using existing category: ${hierarchy.categoryName}`);
    } else {
      const { data: newCategory, error: categoryError } = await supabase
        .from('service_categories')
        .insert([{
          name: hierarchy.categoryName,
          sector_id: sectorId,
          description: `Services category: ${hierarchy.categoryName}`
        }])
        .select('id')
        .single();
      
      if (categoryError) {
        throw new Error(`Failed to create category: ${categoryError.message}`);
      }
      
      categoryId = newCategory.id;
      stats.totalCategories = 1;
      console.log(`Created new category: ${hierarchy.categoryName}`);
    }
    
    // 3. Process subcategories and services
    for (const subcategoryData of hierarchy.subcategories) {
      // Create or get subcategory
      const { data: existingSubcategory } = await supabase
        .from('service_subcategories')
        .select('id')
        .eq('name', subcategoryData.name)
        .eq('category_id', categoryId)
        .single();
      
      let subcategoryId: string;
      
      if (existingSubcategory) {
        subcategoryId = existingSubcategory.id;
        console.log(`Using existing subcategory: ${subcategoryData.name}`);
      } else {
        const { data: newSubcategory, error: subcategoryError } = await supabase
          .from('service_subcategories')
          .insert([{
            name: subcategoryData.name,
            category_id: categoryId,
            description: `Subcategory: ${subcategoryData.name}`
          }])
          .select('id')
          .single();
        
        if (subcategoryError) {
          throw new Error(`Failed to create subcategory: ${subcategoryError.message}`);
        }
        
        subcategoryId = newSubcategory.id;
        stats.totalSubcategories++;
        console.log(`Created new subcategory: ${subcategoryData.name}`);
      }
      
      // 4. Create services
      for (const service of subcategoryData.services) {
        // Check if service already exists
        const { data: existingService } = await supabase
          .from('service_jobs')
          .select('id')
          .eq('name', service.name)
          .eq('subcategory_id', subcategoryId)
          .single();
        
        if (!existingService) {
          const { error: serviceError } = await supabase
            .from('service_jobs')
            .insert([{
              name: service.name,
              subcategory_id: subcategoryId,
              description: service.description,
              estimated_duration: service.estimatedDuration,
              price: service.price
            }]);
          
          if (serviceError) {
            console.error(`Failed to create service ${service.name}:`, serviceError);
            // Continue with other services instead of failing completely
          } else {
            stats.totalServices++;
            console.log(`Created new service: ${service.name}`);
          }
        } else {
          console.log(`Service already exists: ${service.name}`);
        }
      }
    }
    
    console.log('Successfully saved service hierarchy to database');
    return {
      success: true,
      message: `Successfully saved ${stats.totalServices} services`,
      stats
    };
    
  } catch (error) {
    console.error('Error saving service hierarchy to database:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      message: `Failed to save to database: ${errorMessage}`,
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
