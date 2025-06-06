
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
  // Enhanced implementation for unlimited jobs per subcategory
  onProgress({
    stage: 'parsing',
    progress: 10,
    message: 'Starting folder structure analysis...'
  });
  
  try {
    // List all files in the bucket - no limit on number of files per folder
    const { data: files, error } = await supabase.storage
      .from(bucketName)
      .list('', {
        limit: 10000, // Increased limit to handle large datasets
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) throw error;

    onProgress({
      stage: 'parsing',
      progress: 30,
      message: `Found ${files?.length || 0} files to process...`
    });

    const parsedData: ParsedServiceData[] = [];
    
    // Process each file without any job count limitations
    for (const file of files || []) {
      // Parse file structure: sector/category/subcategory/job.txt
      const pathParts = file.name.split('/');
      
      if (pathParts.length >= 4) {
        const [sector, category, subcategory, jobFile] = pathParts;
        const serviceName = jobFile.replace('.txt', '').replace(/[-_]/g, ' ').toUpperCase();
        
        // No limit on jobs per subcategory - add all found services
        parsedData.push({
          sector,
          category,
          subcategory,
          serviceName,
          description: `Service: ${serviceName}`,
          estimatedTime: 60, // Default estimation
          price: 100 // Default price
        });
      }
    }

    onProgress({
      stage: 'parsing',
      progress: 80,
      message: `Parsed ${parsedData.length} services with unlimited jobs per subcategory...`
    });

    onProgress({
      stage: 'complete',
      progress: 100,
      message: `Successfully parsed ${parsedData.length} services from folder structure!`
    });
    
    return parsedData;
  } catch (error) {
    console.error('Error importing from folder structure:', error);
    throw new Error(`Failed to import: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const importParsedDataToDatabase = async (
  data: ParsedServiceData[],
  onProgress: (progress: ImportProgress) => void
): Promise<void> => {
  try {
    onProgress({
      stage: 'importing',
      progress: 10,
      message: 'Starting database import...'
    });

    // Group data by hierarchy levels
    const sectorMap = new Map<string, Set<string>>();
    const categoryMap = new Map<string, Set<string>>();
    const subcategoryMap = new Map<string, ParsedServiceData[]>();

    // Organize all data without job limits
    data.forEach(item => {
      if (!sectorMap.has(item.sector)) {
        sectorMap.set(item.sector, new Set());
      }
      sectorMap.get(item.sector)!.add(item.category);

      const categoryKey = `${item.sector}::${item.category}`;
      if (!categoryMap.has(categoryKey)) {
        categoryMap.set(categoryKey, new Set());
      }
      categoryMap.get(categoryKey)!.add(item.subcategory);

      const subcategoryKey = `${item.sector}::${item.category}::${item.subcategory}`;
      if (!subcategoryMap.has(subcategoryKey)) {
        subcategoryMap.set(subcategoryKey, []);
      }
      subcategoryMap.get(subcategoryKey)!.push(item);
    });

    // Import sectors
    onProgress({
      stage: 'importing',
      progress: 20,
      message: `Importing ${sectorMap.size} sectors...`
    });

    const sectorIds = new Map<string, string>();
    for (const [sectorName] of sectorMap) {
      const { data: sector, error } = await supabase
        .from('service_sectors')
        .insert({ name: sectorName, description: `${sectorName} services` })
        .select('id')
        .single();
      
      if (error) throw error;
      sectorIds.set(sectorName, sector.id);
    }

    // Import categories
    onProgress({
      stage: 'importing',
      progress: 40,
      message: `Importing ${categoryMap.size} categories...`
    });

    const categoryIds = new Map<string, string>();
    for (const [categoryKey, subcategories] of categoryMap) {
      const [sectorName, categoryName] = categoryKey.split('::');
      const sectorId = sectorIds.get(sectorName);
      
      const { data: category, error } = await supabase
        .from('service_categories')
        .insert({ 
          name: categoryName, 
          description: `${categoryName} category`,
          sector_id: sectorId
        })
        .select('id')
        .single();
      
      if (error) throw error;
      categoryIds.set(categoryKey, category.id);
    }

    // Import subcategories
    onProgress({
      stage: 'importing',
      progress: 60,
      message: `Importing ${subcategoryMap.size} subcategories...`
    });

    const subcategoryIds = new Map<string, string>();
    for (const [subcategoryKey] of subcategoryMap) {
      const [sectorName, categoryName, subcategoryName] = subcategoryKey.split('::');
      const categoryKey = `${sectorName}::${categoryName}`;
      const categoryId = categoryIds.get(categoryKey);
      
      const { data: subcategory, error } = await supabase
        .from('service_subcategories')
        .insert({ 
          name: subcategoryName, 
          description: `${subcategoryName} subcategory`,
          category_id: categoryId
        })
        .select('id')
        .single();
      
      if (error) throw error;
      subcategoryIds.set(subcategoryKey, subcategory.id);
    }

    // Import all jobs without any limits
    onProgress({
      stage: 'importing',
      progress: 80,
      message: `Importing ${data.length} jobs (unlimited per subcategory)...`
    });

    const jobBatches = [];
    for (let i = 0; i < data.length; i += 1000) { // Process in batches of 1000 for performance
      jobBatches.push(data.slice(i, i + 1000));
    }

    for (const [index, batch] of jobBatches.entries()) {
      const jobsToInsert = batch.map(item => {
        const subcategoryKey = `${item.sector}::${item.category}::${item.subcategory}`;
        const subcategoryId = subcategoryIds.get(subcategoryKey);
        
        return {
          name: item.serviceName,
          description: item.description,
          estimated_time: item.estimatedTime,
          price: item.price,
          subcategory_id: subcategoryId
        };
      });

      const { error } = await supabase
        .from('service_jobs')
        .insert(jobsToInsert);
      
      if (error) throw error;

      onProgress({
        stage: 'importing',
        progress: 80 + (index + 1) / jobBatches.length * 15,
        message: `Imported batch ${index + 1}/${jobBatches.length} of jobs...`
      });
    }

    onProgress({
      stage: 'complete',
      progress: 100,
      message: `Successfully imported ${data.length} services with unlimited jobs per subcategory!`
    });

  } catch (error) {
    console.error('Error importing to database:', error);
    throw new Error(`Failed to import to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
