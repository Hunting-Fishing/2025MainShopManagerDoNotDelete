
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import type { ImportProgress, ImportResult, ImportStats, SectorFiles, StorageFile } from './types';

export async function ensureStorageBucket(bucketName: string = 'service-data'): Promise<boolean> {
  try {
    console.log('Checking if bucket exists:', bucketName);
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log('Creating bucket:', bucketName);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError);
        return false;
      }
      
      console.log('Bucket created successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Error in ensureStorageBucket:', error);
    return false;
  }
}

export async function ensureServiceTables(): Promise<boolean> {
  try {
    console.log('Ensuring service tables exist...');
    
    // Check if tables exist by trying to query them
    const { error: sectorsError } = await supabase.from('service_sectors').select('id').limit(1);
    const { error: categoriesError } = await supabase.from('service_categories').select('id').limit(1);
    const { error: subcategoriesError } = await supabase.from('service_subcategories').select('id').limit(1);
    const { error: jobsError } = await supabase.from('service_jobs').select('id').limit(1);
    
    if (sectorsError || categoriesError || subcategoriesError || jobsError) {
      console.error('Some service tables do not exist:', {
        sectorsError,
        categoriesError,
        subcategoriesError,
        jobsError
      });
      return false;
    }
    
    console.log('All service tables exist');
    return true;
  } catch (error) {
    console.error('Error checking service tables:', error);
    return false;
  }
}

export async function getAllSectorFiles(): Promise<SectorFiles[]> {
  try {
    console.log('Getting all sector files...');
    
    // Ensure bucket exists
    const bucketReady = await ensureStorageBucket();
    if (!bucketReady) {
      console.log('Bucket not ready, returning empty result');
      return [];
    }
    
    const { data: files, error } = await supabase.storage
      .from('service-data')
      .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

    if (error) {
      console.error('Error listing files:', error);
      return [];
    }

    console.log('Files found:', files?.length || 0);
    
    if (!files || files.length === 0) {
      return [];
    }

    const sectorFiles: SectorFiles[] = [];
    const folders = files.filter(file => !file.metadata); // Folders don't have metadata

    for (const folder of folders) {
      console.log('Processing folder:', folder.name);
      
      const { data: folderFiles, error: folderError } = await supabase.storage
        .from('service-data')
        .list(folder.name, { limit: 1000 });

      if (folderError) {
        console.error(`Error listing files in folder ${folder.name}:`, folderError);
        continue;
      }

      const excelFiles = folderFiles?.filter(file => 
        file.metadata && 
        (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls'))
      ).map(file => ({
        name: file.name,
        path: `${folder.name}/${file.name}`,
        size: file.metadata?.size,
        type: file.metadata?.mimetype,
        lastModified: new Date(file.updated_at)
      })) || [];

      if (excelFiles.length > 0) {
        sectorFiles.push({
          sectorName: folder.name,
          excelFiles,
          totalFiles: excelFiles.length
        });
      }
    }

    console.log('Final sector files result:', sectorFiles);
    return sectorFiles;
  } catch (error) {
    console.error('Error in getAllSectorFiles:', error);
    return [];
  }
}

export async function downloadAndParseExcel(filePath: string): Promise<any[]> {
  try {
    console.log('Downloading and parsing Excel file:', filePath);
    
    const { data, error } = await supabase.storage
      .from('service-data')
      .download(filePath);

    if (error) {
      console.error('Error downloading file:', error);
      return [];
    }

    const arrayBuffer = await data.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`Parsed ${jsonData.length} rows from ${filePath}`);
    return jsonData;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    return [];
  }
}

export async function processExcelFileFromStorage(filePath: string): Promise<any> {
  try {
    const excelData = await downloadAndParseExcel(filePath);
    
    if (excelData.length === 0) {
      return { categories: [], subcategories: [], jobs: [] };
    }

    // Parse the Excel data structure
    const categories: any[] = [];
    const subcategories: any[] = [];
    const jobs: any[] = [];
    
    let currentCategory = '';
    let currentSubcategory = '';
    
    for (let i = 1; i < excelData.length; i++) { // Skip header row
      const row = excelData[i];
      if (!row || row.length === 0) continue;
      
      const [categoryName, subcategoryName, jobName, description, estimatedTime, price] = row;
      
      if (categoryName && categoryName.trim()) {
        currentCategory = categoryName.trim();
        
        if (!categories.find(cat => cat.name === currentCategory)) {
          categories.push({
            name: currentCategory,
            description: `${currentCategory} services`
          });
        }
      }
      
      if (subcategoryName && subcategoryName.trim()) {
        currentSubcategory = subcategoryName.trim();
        
        if (!subcategories.find(sub => sub.name === currentSubcategory && sub.categoryName === currentCategory)) {
          subcategories.push({
            name: currentSubcategory,
            categoryName: currentCategory,
            description: `${currentSubcategory} services`
          });
        }
      }
      
      if (jobName && jobName.trim()) {
        jobs.push({
          name: jobName.trim(),
          subcategoryName: currentSubcategory,
          categoryName: currentCategory,
          description: description?.toString().trim() || '',
          estimatedTime: estimatedTime ? parseInt(estimatedTime.toString()) : null,
          price: price ? parseFloat(price.toString()) : null
        });
      }
    }
    
    return { categories, subcategories, jobs };
  } catch (error) {
    console.error('Error processing Excel file:', error);
    return { categories: [], subcategories: [], jobs: [] };
  }
}

export async function insertSectorToDatabase(sectorName: string): Promise<string> {
  try {
    console.log('Inserting sector:', sectorName);
    
    // Check if sector already exists
    const { data: existingSector } = await supabase
      .from('service_sectors')
      .select('id')
      .eq('name', sectorName)
      .single();
    
    if (existingSector) {
      console.log('Sector already exists:', existingSector.id);
      return existingSector.id;
    }
    
    const { data, error } = await supabase
      .from('service_sectors')
      .insert({ name: sectorName, description: `${sectorName} sector` })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error inserting sector:', error);
      throw error;
    }
    
    console.log('Sector inserted:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error in insertSectorToDatabase:', error);
    throw error;
  }
}

export async function insertCategoriesToDatabase(sectorId: string, categories: any[]): Promise<Map<string, string>> {
  const categoryIds = new Map<string, string>();
  
  for (const category of categories) {
    try {
      // Check if category already exists
      const { data: existingCategory } = await supabase
        .from('service_categories')
        .select('id')
        .eq('name', category.name)
        .eq('sector_id', sectorId)
        .single();
      
      if (existingCategory) {
        categoryIds.set(category.name, existingCategory.id);
        continue;
      }
      
      const { data, error } = await supabase
        .from('service_categories')
        .insert({
          name: category.name,
          description: category.description,
          sector_id: sectorId
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Error inserting category:', error);
        continue;
      }
      
      categoryIds.set(category.name, data.id);
    } catch (error) {
      console.error('Error processing category:', category.name, error);
    }
  }
  
  return categoryIds;
}

export async function insertSubcategoriesToDatabase(categoryIds: Map<string, string>, subcategories: any[]): Promise<Map<string, string>> {
  const subcategoryIds = new Map<string, string>();
  
  for (const subcategory of subcategories) {
    try {
      const categoryId = categoryIds.get(subcategory.categoryName);
      if (!categoryId) {
        console.warn('Category not found for subcategory:', subcategory.name);
        continue;
      }
      
      // Check if subcategory already exists
      const { data: existingSubcategory } = await supabase
        .from('service_subcategories')
        .select('id')
        .eq('name', subcategory.name)
        .eq('category_id', categoryId)
        .single();
      
      if (existingSubcategory) {
        subcategoryIds.set(subcategory.name, existingSubcategory.id);
        continue;
      }
      
      const { data, error } = await supabase
        .from('service_subcategories')
        .insert({
          name: subcategory.name,
          description: subcategory.description,
          category_id: categoryId
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Error inserting subcategory:', error);
        continue;
      }
      
      subcategoryIds.set(subcategory.name, data.id);
    } catch (error) {
      console.error('Error processing subcategory:', subcategory.name, error);
    }
  }
  
  return subcategoryIds;
}

export async function insertJobsToDatabase(subcategoryIds: Map<string, string>, jobs: any[]): Promise<number> {
  let jobsInserted = 0;
  
  for (const job of jobs) {
    try {
      const subcategoryId = subcategoryIds.get(job.subcategoryName);
      if (!subcategoryId) {
        console.warn('Subcategory not found for job:', job.name);
        continue;
      }
      
      // Check if job already exists
      const { data: existingJob } = await supabase
        .from('service_jobs')
        .select('id')
        .eq('name', job.name)
        .eq('subcategory_id', subcategoryId)
        .single();
      
      if (existingJob) {
        continue;
      }
      
      const { error } = await supabase
        .from('service_jobs')
        .insert({
          name: job.name,
          description: job.description,
          estimated_time: job.estimatedTime,
          price: job.price,
          subcategory_id: subcategoryId
        });
      
      if (error) {
        console.error('Error inserting job:', error);
        continue;
      }
      
      jobsInserted++;
    } catch (error) {
      console.error('Error processing job:', job.name, error);
    }
  }
  
  return jobsInserted;
}

export async function importServicesFromStorage(
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  try {
    console.log('Starting service import from storage...');
    
    onProgress?.({
      stage: 'initializing',
      message: 'Initializing import process...',
      progress: 0,
      completed: false,
      error: null
    });
    
    // Ensure storage bucket and tables exist
    const bucketReady = await ensureStorageBucket();
    const tablesReady = await ensureServiceTables();
    
    if (!bucketReady || !tablesReady) {
      throw new Error('Storage bucket or database tables not ready');
    }
    
    onProgress?.({
      stage: 'scanning',
      message: 'Scanning storage for Excel files...',
      progress: 10,
      completed: false,
      error: null
    });
    
    const sectorFiles = await getAllSectorFiles();
    
    if (sectorFiles.length === 0) {
      return {
        success: false,
        message: 'No Excel files found in storage',
        stats: {
          totalSectors: 0,
          totalCategories: 0,
          totalSubcategories: 0,
          totalServices: 0,
          filesProcessed: 0
        }
      };
    }
    
    const stats: ImportStats = {
      totalSectors: 0,
      totalCategories: 0,
      totalSubcategories: 0,
      totalServices: 0,
      filesProcessed: 0
    };
    
    let currentProgress = 20;
    const progressIncrement = 70 / sectorFiles.reduce((sum, sector) => sum + sector.totalFiles, 0);
    
    for (const sectorFile of sectorFiles) {
      try {
        console.log(`Processing sector: ${sectorFile.sectorName}`);
        
        onProgress?.({
          stage: 'processing',
          message: `Processing sector: ${sectorFile.sectorName}...`,
          progress: currentProgress,
          completed: false,
          error: null
        });
        
        const sectorId = await insertSectorToDatabase(sectorFile.sectorName);
        stats.totalSectors++;
        
        const allCategories: any[] = [];
        const allSubcategories: any[] = [];
        const allJobs: any[] = [];
        
        for (const file of sectorFile.excelFiles) {
          try {
            console.log(`Processing file: ${file.path}`);
            
            const { categories, subcategories, jobs } = await processExcelFileFromStorage(file.path);
            
            allCategories.push(...categories);
            allSubcategories.push(...subcategories);
            allJobs.push(...jobs);
            
            stats.filesProcessed++;
            currentProgress += progressIncrement;
            
            onProgress?.({
              stage: 'processing',
              message: `Processed ${file.name}`,
              progress: Math.min(currentProgress, 90),
              completed: false,
              error: null
            });
          } catch (fileError) {
            console.error(`Error processing file ${file.path}:`, fileError);
          }
        }
        
        // Remove duplicates
        const uniqueCategories = allCategories.filter((cat, index, self) => 
          index === self.findIndex(c => c.name === cat.name)
        );
        const uniqueSubcategories = allSubcategories.filter((sub, index, self) => 
          index === self.findIndex(s => s.name === sub.name && s.categoryName === sub.categoryName)
        );
        
        // Insert to database
        const categoryIds = await insertCategoriesToDatabase(sectorId, uniqueCategories);
        const subcategoryIds = await insertSubcategoriesToDatabase(categoryIds, uniqueSubcategories);
        const jobsInserted = await insertJobsToDatabase(subcategoryIds, allJobs);
        
        stats.totalCategories += uniqueCategories.length;
        stats.totalSubcategories += uniqueSubcategories.length;
        stats.totalServices += jobsInserted;
        
      } catch (sectorError) {
        console.error(`Error processing sector ${sectorFile.sectorName}:`, sectorError);
      }
    }
    
    onProgress?.({
      stage: 'complete',
      message: 'Import completed successfully!',
      progress: 100,
      completed: true,
      error: null
    });
    
    return {
      success: true,
      message: `Successfully imported ${stats.totalServices} services from ${stats.filesProcessed} files`,
      stats
    };
    
  } catch (error) {
    console.error('Import failed:', error);
    
    onProgress?.({
      stage: 'error',
      message: error instanceof Error ? error.message : 'Import failed',
      progress: 0,
      completed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Import failed',
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

export async function clearAllServiceData(): Promise<void> {
  try {
    console.log('Clearing all service data...');
    
    // Delete in reverse order due to foreign key constraints
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('Service data cleared successfully');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
}

export async function getServiceCounts() {
  try {
    const [
      { count: sectorsCount },
      { count: categoriesCount },
      { count: subcategoriesCount },
      { count: jobsCount }
    ] = await Promise.all([
      supabase.from('service_sectors').select('*', { count: 'exact', head: true }),
      supabase.from('service_categories').select('*', { count: 'exact', head: true }),
      supabase.from('service_subcategories').select('*', { count: 'exact', head: true }),
      supabase.from('service_jobs').select('*', { count: 'exact', head: true })
    ]);
    
    return {
      sectors: sectorsCount || 0,
      categories: categoriesCount || 0,
      subcategories: subcategoriesCount || 0,
      jobs: jobsCount || 0
    };
  } catch (error) {
    console.error('Error getting service counts:', error);
    return { sectors: 0, categories: 0, subcategories: 0, jobs: 0 };
  }
}
