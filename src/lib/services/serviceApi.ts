
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { getServiceCategories } from '@/lib/serviceHierarchy';

export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  // For now, return the common service categories from serviceHierarchy
  // In a real implementation, this would fetch from your API/database
  return getServiceCategories();
};

export const bulkImportServiceCategories = async (
  categories: ServiceMainCategory[],
  onProgress?: (progress: number) => void
): Promise<void> => {
  // Simulate import process with progress updates
  for (let i = 0; i <= 100; i += 10) {
    if (onProgress) {
      onProgress(i / 100);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('Bulk import completed for', categories.length, 'categories');
  // In a real implementation, this would save to your API/database
};
