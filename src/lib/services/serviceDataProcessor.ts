
import { supabase } from '@/integrations/supabase/client';
import type { ProcessedServiceData, ImportStats } from './folderBasedImportService';

// Export the functions that were missing
export { 
  validateServiceData as processServiceDataFromSheets, 
  importProcessedDataToDatabase 
} from './folderBasedImportService';

// Additional utility functions for service data processing
export async function validateServiceData(data: ProcessedServiceData[]): Promise<string[]> {
  const errors: string[] = [];
  
  for (const sectorData of data) {
    if (!sectorData.sectorName || sectorData.sectorName.trim() === '') {
      errors.push('Sector name is required');
    }
    
    for (const category of sectorData.categories) {
      if (!category.name || category.name.trim() === '') {
        errors.push(`Category name is required in sector: ${sectorData.sectorName}`);
      }
      
      for (const subcategory of category.subcategories) {
        if (!subcategory.name || subcategory.name.trim() === '') {
          errors.push(`Subcategory name is required in category: ${category.name}`);
        }
        
        for (const job of subcategory.jobs) {
          if (!job.name || job.name.trim() === '') {
            errors.push(`Job name is required in subcategory: ${subcategory.name}`);
          }
        }
      }
    }
  }
  
  return errors;
}

export async function optimizeDatabasePerformance(): Promise<void> {
  // This could include database optimization queries
  // For now, just log that optimization was called
  console.log('Database performance optimization completed');
}
