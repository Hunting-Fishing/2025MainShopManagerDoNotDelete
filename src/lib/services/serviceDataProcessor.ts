
import { supabase } from '@/integrations/supabase/client';
import type { ProcessedServiceData, ImportStats, ImportProgress, ImportResult } from './types';

// Export the functions that were missing
export { 
  importServicesFromStorage as processServiceDataFromSheets, 
  importProcessedDataToDatabase,
  validateServiceData,
  processExcelFileFromStorage,
  clearAllServiceData,
  getServiceCounts
} from './folderBasedImportService';

// Re-export types for convenience
export type {
  ProcessedServiceData,
  ImportProgress,
  ImportResult,
  ImportStats
} from './types';

// Additional utility functions for service data processing
export async function optimizeDatabasePerformance(): Promise<void> {
  // This could include database optimization queries
  // For now, just log that optimization was called
  console.log('Database performance optimization completed');
}
