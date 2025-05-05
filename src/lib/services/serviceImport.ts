
import { ServiceMainCategory } from "@/types/serviceHierarchy";
import { saveServiceCategory } from './serviceCategories';

/**
 * Function to bulk import service categories with progress tracking
 */
export async function bulkImportServiceCategories(
  categories: ServiceMainCategory[], 
  progressCallback?: (progress: number) => void
): Promise<void> {
  if (!categories || categories.length === 0) {
    throw new Error("No categories to import");
  }
  
  // For large datasets, import in batches
  const BATCH_SIZE = 5; // Smaller batch size for better progress reporting
  let completedBatches = 0;
  const totalBatches = Math.ceil(categories.length / BATCH_SIZE);
  
  for (let i = 0; i < categories.length; i += BATCH_SIZE) {
    const batch = categories.slice(i, i + BATCH_SIZE);
    
    // Process each category in the batch
    for (const category of batch) {
      await saveServiceCategory(category);
    }
    
    completedBatches++;
    
    // Report progress
    if (progressCallback) {
      progressCallback(completedBatches / totalBatches);
    }
    
    // Small delay to prevent overwhelming the database
    if (i + BATCH_SIZE < categories.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}
