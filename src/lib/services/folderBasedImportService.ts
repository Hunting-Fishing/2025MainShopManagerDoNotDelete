import { supabase } from '@/integrations/supabase/client';

export interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
}

export interface ParsedServiceData {
  sector: string;
  category: string;
  subcategory: string;
  serviceName: string;
  description?: string;
  estimatedTime?: number;
  price?: number;
}

export const clearServiceDatabase = async (
  onProgress: (progress: ImportProgress) => void
): Promise<void> => {
  try {
    onProgress({
      stage: 'clear',
      progress: 10,
      message: 'Starting database cleanup...'
    });

    // Delete in correct order to maintain referential integrity
    
    // 1. Delete service jobs first
    onProgress({
      stage: 'clear',
      progress: 25,
      message: 'Removing service jobs...'
    });
    
    const { error: jobsError } = await supabase
      .from('service_jobs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (jobsError) throw jobsError;

    // 2. Delete service subcategories
    onProgress({
      stage: 'clear',
      progress: 50,
      message: 'Removing service subcategories...'
    });
    
    const { error: subcategoriesError } = await supabase
      .from('service_subcategories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (subcategoriesError) throw subcategoriesError;

    // 3. Delete service categories
    onProgress({
      stage: 'clear',
      progress: 75,
      message: 'Removing service categories...'
    });
    
    const { error: categoriesError } = await supabase
      .from('service_categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (categoriesError) throw categoriesError;

    // 4. Delete service sectors
    onProgress({
      stage: 'clear',
      progress: 90,
      message: 'Removing service sectors...'
    });
    
    const { error: sectorsError } = await supabase
      .from('service_sectors')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (sectorsError) throw sectorsError;

    onProgress({
      stage: 'complete',
      progress: 100,
      message: 'Database cleared successfully!'
    });

  } catch (error) {
    console.error('Error clearing database:', error);
    throw new Error(`Failed to clear database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getServiceCounts = async () => {
  try {
    const [sectorsResult, categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
      supabase.from('service_sectors').select('id', { count: 'exact', head: true }),
      supabase.from('service_categories').select('id', { count: 'exact', head: true }),
      supabase.from('service_subcategories').select('id', { count: 'exact', head: true }),
      supabase.from('service_jobs').select('id', { count: 'exact', head: true })
    ]);

    return {
      sectors: sectorsResult.count || 0,
      categories: categoriesResult.count || 0,
      subcategories: subcategoriesResult.count || 0,
      jobs: jobsResult.count || 0
    };
  } catch (error) {
    console.error('Error getting service counts:', error);
    return {
      sectors: 0,
      categories: 0,
      subcategories: 0,
      jobs: 0
    };
  }
};

export const importFromFolderStructure = async (
  bucketName: string,
  onProgress: (progress: ImportProgress) => void
): Promise<ParsedServiceData[]> => {
  // Placeholder implementation - this would contain the actual import logic
  // For now, return empty array as the focus is on the clear functionality
  onProgress({
    stage: 'complete',
    progress: 100,
    message: 'Import functionality coming soon...'
  });
  
  return [];
};

export const importParsedDataToDatabase = async (
  data: ParsedServiceData[],
  onProgress: (progress: ImportProgress) => void
): Promise<void> => {
  // Placeholder implementation
  onProgress({
    stage: 'complete',
    progress: 100,
    message: 'Database import functionality coming soon...'
  });
};
