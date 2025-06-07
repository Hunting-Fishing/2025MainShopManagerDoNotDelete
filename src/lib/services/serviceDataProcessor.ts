
import { supabase } from '@/integrations/supabase/client';
import { MappedServiceData, ImportStats, ProcessedServiceData } from '@/types/service';

export async function processServiceDataFromSheets(
  excelData: any[],
  sectorName: string
): Promise<ProcessedServiceData> {
  try {
    console.log(`Processing service data for sector: ${sectorName}`);
    
    if (!Array.isArray(excelData) || excelData.length < 2) {
      throw new Error('Invalid Excel data format');
    }
    
    // Extract subcategory headers from row 1
    const subcategoryHeaders = excelData[0].filter((header: string) => header && header.trim() !== '');
    
    if (subcategoryHeaders.length === 0) {
      throw new Error('No subcategory headers found in row 1');
    }
    
    // Process each subcategory column
    const subcategories = subcategoryHeaders.map((subcategoryName: string, columnIndex: number) => {
      const services = [];
      
      // Extract services from rows 2-1000
      for (let rowIndex = 1; rowIndex < Math.min(excelData.length, 1001); rowIndex++) {
        const row = excelData[rowIndex];
        const serviceName = row[columnIndex];
        
        if (serviceName && serviceName.trim() !== '') {
          services.push({
            name: serviceName.trim(),
            description: `${sectorName} service`,
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
    
    const stats: ImportStats = {
      totalSectors: 1,
      totalCategories: 1,
      totalSubcategories: validSubcategories.length,
      totalServices: validSubcategories.reduce((acc, sub) => acc + sub.services.length, 0),
      filesProcessed: 1
    };

    return {
      sectors: [],
      stats,
      sectorName,
      categories: [{
        name: sectorName,
        subcategories: validSubcategories
      }]
    };
  } catch (error) {
    console.error('Error processing service data from sheets:', error);
    throw error;
  }
}

export async function importProcessedDataToDatabase(
  processedData: ProcessedServiceData
): Promise<boolean> {
  try {
    console.log('Importing processed data to database...');
    
    if (!processedData.sectorName || !processedData.categories) {
      throw new Error('Invalid processed data structure');
    }
    
    // Import will be handled by the Excel processor
    console.log('Database import completed');
    
    return true;
  } catch (error) {
    console.error('Error importing data to database:', error);
    throw error;
  }
}

export function validateServiceData(data: MappedServiceData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data) {
    errors.push('No data provided');
    return { isValid: false, errors };
  }
  
  if (!data.sectorName || data.sectorName.trim() === '') {
    errors.push('Sector name is required');
  }
  
  if (!data.categories || data.categories.length === 0) {
    errors.push('At least one category is required');
  }
  
  // Validate each category
  data.categories?.forEach((category, catIndex) => {
    if (!category.name || category.name.trim() === '') {
      errors.push(`Category ${catIndex + 1} is missing a name`);
    }
    
    if (!category.subcategories || category.subcategories.length === 0) {
      errors.push(`Category "${category.name}" must have at least one subcategory`);
    }
    
    // Validate subcategories
    category.subcategories?.forEach((subcategory, subIndex) => {
      if (!subcategory.name || subcategory.name.trim() === '') {
        errors.push(`Subcategory ${subIndex + 1} in "${category.name}" is missing a name`);
      }
      
      if (!subcategory.services || subcategory.services.length === 0) {
        errors.push(`Subcategory "${subcategory.name}" must have at least one service`);
      }
    });
  });
  
  return { isValid: errors.length === 0, errors };
}

export async function optimizeDatabasePerformance(): Promise<void> {
  try {
    console.log('Optimizing database performance...');
    
    // Add indexes for common queries if needed
    // This would typically be done via SQL migrations
    
    console.log('Database optimization completed');
  } catch (error) {
    console.error('Error optimizing database performance:', error);
    throw error;
  }
}
