
import { supabase } from '@/integrations/supabase/client';
import { MappedServiceData, ProcessedServiceData, ImportStats } from '@/types/service';
import * as XLSX from 'xlsx';

export async function processExcelFileFromStorage(
  fileName: string, 
  sectorName: string
): Promise<ProcessedServiceData> {
  try {
    console.log(`Processing Excel file: ${fileName} from sector: ${sectorName}`);
    
    // Download the file from Supabase storage
    const { data: fileData, error } = await supabase.storage
      .from('service-data')
      .download(`${sectorName}/${fileName}`);
    
    if (error) {
      console.error('Error downloading file:', error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
    
    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Parse the Excel file
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0]; // Use first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header row as keys
    const rawData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      range: 0,
      defval: ''
    }) as string[][];
    
    if (rawData.length < 2) {
      throw new Error('Excel file must have at least 2 rows (header + data)');
    }
    
    // Extract category name from file name (remove .xlsx extension)
    const categoryName = fileName.replace(/\.xlsx?$/i, '');
    
    // Row 1 contains subcategory names (column headers)
    const subcategoryHeaders = rawData[0].filter(header => header && header.trim() !== '');
    
    if (subcategoryHeaders.length === 0) {
      throw new Error('No subcategory headers found in row 1');
    }
    
    console.log(`Found subcategories: ${subcategoryHeaders.join(', ')}`);
    
    // Process each subcategory column
    const subcategories = subcategoryHeaders.map((subcategoryName, columnIndex) => {
      // Extract services from column (rows 2 onwards)
      const services = [];
      
      for (let rowIndex = 1; rowIndex < Math.min(rawData.length, 1001); rowIndex++) {
        const row = rawData[rowIndex];
        const serviceName = row[columnIndex];
        
        if (serviceName && serviceName.trim() !== '') {
          services.push({
            name: serviceName.trim(),
            description: `${categoryName} - ${subcategoryName} service`,
            estimatedTime: 60, // Default 1 hour
            price: 100 // Default price
          });
        }
      }
      
      return {
        name: subcategoryName.trim(),
        services
      };
    });
    
    // Filter out empty subcategories
    const validSubcategories = subcategories.filter(sub => sub.services.length > 0);
    
    console.log(`Processed ${validSubcategories.length} subcategories with services`);
    
    const mappedData: MappedServiceData = {
      sectorName,
      categories: [{
        name: categoryName,
        subcategories: validSubcategories
      }]
    };
    
    // Save to database
    await importProcessedDataToDatabase(mappedData, sectorName);
    
    const stats: ImportStats = {
      totalSectors: 1,
      totalCategories: 1,
      totalSubcategories: validSubcategories.length,
      totalServices: validSubcategories.reduce((acc, sub) => acc + sub.services.length, 0),
      filesProcessed: 1
    };
    
    return {
      sectors: [], // Will be populated by the database import
      stats,
      sectorName,
      categories: mappedData.categories
    };
    
  } catch (error) {
    console.error(`Error processing Excel file ${fileName}:`, error);
    throw error;
  }
}

async function importProcessedDataToDatabase(
  mappedData: MappedServiceData,
  sectorName: string
): Promise<void> {
  try {
    // 1. Create or get sector
    let sectorId: string;
    const { data: existingSector } = await supabase
      .from('service_sectors')
      .select('id')
      .eq('name', sectorName)
      .single();
    
    if (existingSector) {
      sectorId = existingSector.id;
    } else {
      const { data: newSector, error: sectorError } = await supabase
        .from('service_sectors')
        .insert({
          name: sectorName,
          description: `${sectorName} services sector`,
          position: 1,
          is_active: true
        })
        .select('id')
        .single();
      
      if (sectorError) throw sectorError;
      sectorId = newSector.id;
    }
    
    // 2. Process each category
    for (const category of mappedData.categories) {
      // Create or get category
      let categoryId: string;
      const { data: existingCategory } = await supabase
        .from('service_categories')
        .select('id')
        .eq('name', category.name)
        .eq('sector_id', sectorId)
        .single();
      
      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const { data: newCategory, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            sector_id: sectorId,
            name: category.name,
            description: `${category.name} category`,
            position: 1
          })
          .select('id')
          .single();
        
        if (categoryError) throw categoryError;
        categoryId = newCategory.id;
      }
      
      // 3. Process each subcategory
      for (const subcategory of category.subcategories) {
        // Create or get subcategory
        let subcategoryId: string;
        const { data: existingSubcategory } = await supabase
          .from('service_subcategories')
          .select('id')
          .eq('name', subcategory.name)
          .eq('category_id', categoryId)
          .single();
        
        if (existingSubcategory) {
          subcategoryId = existingSubcategory.id;
          
          // Clear existing jobs for this subcategory to avoid duplicates
          await supabase
            .from('service_jobs')
            .delete()
            .eq('subcategory_id', subcategoryId);
        } else {
          const { data: newSubcategory, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert({
              category_id: categoryId,
              name: subcategory.name,
              description: `${subcategory.name} subcategory`
            })
            .select('id')
            .single();
          
          if (subcategoryError) throw subcategoryError;
          subcategoryId = newSubcategory.id;
        }
        
        // 4. Insert all services for this subcategory
        if (subcategory.services.length > 0) {
          const jobsToInsert = subcategory.services.map(service => ({
            subcategory_id: subcategoryId,
            name: service.name,
            description: service.description,
            estimated_time: service.estimatedTime,
            price: service.price
          }));
          
          const { error: jobsError } = await supabase
            .from('service_jobs')
            .insert(jobsToInsert);
          
          if (jobsError) throw jobsError;
        }
      }
    }
    
    console.log(`Successfully imported data for sector: ${sectorName}`);
    
  } catch (error) {
    console.error('Error importing to database:', error);
    throw error;
  }
}

export async function processMultipleExcelFiles(
  sectorFiles: { sectorName: string; files: { name: string }[] }[]
): Promise<ProcessedServiceData> {
  const allStats: ImportStats = {
    totalSectors: 0,
    totalCategories: 0,
    totalSubcategories: 0,
    totalServices: 0,
    filesProcessed: 0
  };
  
  for (const sectorFile of sectorFiles) {
    for (const file of sectorFile.files) {
      try {
        const result = await processExcelFileFromStorage(file.name, sectorFile.sectorName);
        
        allStats.totalSectors += result.stats.totalSectors;
        allStats.totalCategories += result.stats.totalCategories;
        allStats.totalSubcategories += result.stats.totalSubcategories;
        allStats.totalServices += result.stats.totalServices;
        allStats.filesProcessed += result.stats.filesProcessed;
        
      } catch (error) {
        console.error(`Failed to process file ${file.name}:`, error);
        throw error;
      }
    }
  }
  
  return {
    sectors: [],
    stats: allStats
  };
}

export function mapExcelToServiceHierarchy(excelData: any[], fileName: string): MappedServiceData {
  // This function is now handled by processExcelFileFromStorage
  throw new Error('Use processExcelFileFromStorage instead');
}

export function processExcelFile(file: File): Promise<any> {
  // This function is now handled by processExcelFileFromStorage
  throw new Error('Use processExcelFileFromStorage instead');
}

export function validateExcelData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!Array.isArray(data) || data.length < 2) {
    errors.push('Excel file must have at least 2 rows (header + data)');
  }
  
  if (data.length > 0 && (!Array.isArray(data[0]) || data[0].length === 0)) {
    errors.push('First row must contain subcategory headers');
  }
  
  return { isValid: errors.length === 0, errors };
}
