import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed?: boolean;
  error?: string;
}

export interface ServiceCounts {
  sectors: number;
  categories: number;
  subcategories: number;
  jobs: number;
}

// Helper function to sanitize strings for database insertion
const sanitizeString = (str: string | undefined): string => {
  if (!str) return '';
  return str.replace(/[^\w\s]/gi, '').trim();
};

// Helper function to parse numbers safely
const parseNumber = (num: string | number | undefined): number | null => {
  if (num === undefined) return null;
  const parsed = typeof num === 'string' ? parseFloat(num) : num;
  return isNaN(parsed) ? null : parsed;
};

export const importFromFiles = async (
  files: FileList,
  onProgress?: (progress: ImportProgress) => void
): Promise<void> => {
  try {
    onProgress?.({
      stage: 'Starting Import',
      message: 'Preparing to process files...',
      progress: 0
    });

    const processedData: any[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      onProgress?.({
        stage: 'Processing Files',
        message: `Processing file ${i + 1} of ${files.length}: ${file.name}`,
        progress: (i / files.length) * 30
      });

      const data = await processFile(file);
      processedData.push(...data);
    }

    onProgress?.({
      stage: 'Importing Data',
      message: 'Saving data to database...',
      progress: 50
    });

    // Process the data and save to database
    await saveServiceData(processedData, onProgress);

    onProgress?.({
      stage: 'Complete',
      message: 'Import completed successfully!',
      progress: 100,
      completed: true
    });

  } catch (error) {
    console.error('Import failed:', error);
    onProgress?.({
      stage: 'Error',
      message: error instanceof Error ? error.message : 'Import failed',
      progress: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};

const processFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Failed to read file'));
          return;
        }

        let processedData: any[] = [];

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          // Process Excel file
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          processedData = XLSX.utils.sheet_to_json(worksheet);
        } else if (file.name.endsWith('.csv')) {
          // Process CSV file
          const csvData = data as string;
          const lines = csvData.split('\n');
          const headers = lines[0].split(',');
          
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',');
              const row: any = {};
              headers.forEach((header, index) => {
                row[header.trim()] = values[index]?.trim() || '';
              });
              processedData.push(row);
            }
          }
        }

        resolve(processedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
};

const saveServiceData = async (
  data: any[], 
  onProgress?: (progress: ImportProgress) => void
): Promise<void> => {
  // Group data by hierarchy
  const sectors = new Map();
  const categories = new Map();
  const subcategories = new Map();
  const jobs: any[] = [];

  let processedCount = 0;
  const totalItems = data.length;

  for (const row of data) {
    // Process each row and organize into hierarchy
    const sectorName = row.Sector || row.sector || '';
    const categoryName = row.Category || row.category || '';
    const subcategoryName = row.Subcategory || row.subcategory || '';
    const jobName = row.Job || row.job || row.Service || row.service || '';

    if (sectorName && !sectors.has(sectorName)) {
      sectors.set(sectorName, {
        name: sectorName,
        description: row.SectorDescription || ''
      });
    }

    if (categoryName && !categories.has(categoryName)) {
      categories.set(categoryName, {
        name: categoryName,
        sector: sectorName,
        description: row.CategoryDescription || ''
      });
    }

    if (subcategoryName && !subcategories.has(subcategoryName)) {
      subcategories.set(subcategoryName, {
        name: subcategoryName,
        category: categoryName,
        description: row.SubcategoryDescription || ''
      });
    }

    if (jobName) {
      jobs.push({
        name: jobName,
        subcategory: subcategoryName,
        description: row.JobDescription || row.Description || '',
        price: parseFloat(row.Price || row.price || '0') || null,
        duration: row.Duration || row.duration || null
      });
    }

    processedCount++;
    if (processedCount % 10 === 0) {
      onProgress?.({
        stage: 'Processing Data',
        message: `Processed ${processedCount} of ${totalItems} records`,
        progress: 50 + (processedCount / totalItems) * 30
      });
    }
  }

  // Save to database in batches
  await saveSectors(Array.from(sectors.values()));
  await saveCategories(Array.from(categories.values()));
  await saveSubcategories(Array.from(subcategories.values()));
  await saveJobs(jobs);
};

const saveSectors = async (sectors: any[]) => {
  for (const sector of sectors) {
    const { error } = await supabase
      .from('service_sectors')
      .upsert(sector, { onConflict: 'name' });
    
    if (error) {
      console.error('Error saving sector:', error);
    }
  }
};

const saveCategories = async (categories: any[]) => {
  for (const category of categories) {
    const { error } = await supabase
      .from('service_categories')
      .upsert(category, { onConflict: 'name' });
    
    if (error) {
      console.error('Error saving category:', error);
    }
  }
};

const saveSubcategories = async (subcategories: any[]) => {
  for (const subcategory of subcategories) {
    const { error } = await supabase
      .from('service_subcategories')
      .upsert(subcategory, { onConflict: 'name' });
    
    if (error) {
      console.error('Error saving subcategory:', error);
    }
  }
};

const saveJobs = async (jobs: any[]) => {
  // Process jobs in batches to avoid overwhelming the database
  const batchSize = 50;
  for (let i = 0; i < jobs.length; i += batchSize) {
    const batch = jobs.slice(i, i + batchSize);
    const { error } = await supabase
      .from('service_jobs')
      .upsert(batch, { onConflict: 'name' });
    
    if (error) {
      console.error('Error saving jobs batch:', error);
    }
  }
};

export const getServiceCounts = async (): Promise<ServiceCounts> => {
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
    return { sectors: 0, categories: 0, subcategories: 0, jobs: 0 };
  }
};

export const clearAllServiceData = async (): Promise<void> => {
  try {
    // Delete in reverse order to respect foreign key constraints
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
};
