
import { supabase } from '@/lib/supabase';

export interface ImportProgress {
  current: number;
  total: number;
  currentFile?: string;
  stage: 'reading' | 'processing' | 'importing' | 'complete';
}

export interface ServiceCounts {
  sectors: number;
  categories: number;
  subcategories: number;
  jobs: number;
}

// Function to get service counts from database
export async function getServiceCounts(): Promise<ServiceCounts> {
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
}

// Function to clear all service data
export async function clearAllServiceData(): Promise<void> {
  try {
    // Delete in reverse order to maintain referential integrity
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
}

interface ImportedService {
  sector: string;
  category: string;
  subcategory: string;
  job: string;
}

function parseExcelData(workbook: any): ImportedService[] {
  const services: ImportedService[] = [];
  
  // Get the first worksheet
  const sheetNames = workbook.SheetNames;
  if (sheetNames.length === 0) return services;
  
  const worksheet = workbook.Sheets[sheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Skip header row and process data
  for (let i = 1; i < data.length; i++) {
    const row = data[i] as string[];
    if (row && row.length >= 4) {
      services.push({
        sector: row[0]?.toString().trim() || '',
        category: row[1]?.toString().trim() || '',
        subcategory: row[2]?.toString().trim() || '',
        job: row[3]?.toString().trim() || ''
      });
    }
  }
  
  return services;
}

function parseCSVData(csvText: string): ImportedService[] {
  const services: ImportedService[] = [];
  const lines = csvText.split('\n');
  
  // Skip header row and process data
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const columns = line.split(',').map(col => col.replace(/"/g, '').trim());
      if (columns.length >= 4) {
        services.push({
          sector: columns[0] || '',
          category: columns[1] || '',
          subcategory: columns[2] || '',
          job: columns[3] || ''
        });
      }
    }
  }
  
  return services;
}

async function importServicesData(
  services: ImportedService[], 
  onProgress?: (progress: ImportProgress) => void
): Promise<void> {
  const total = services.length;
  let current = 0;

  // Group services by hierarchy
  const sectorMap = new Map<string, Set<string>>();
  const categoryMap = new Map<string, Set<string>>();
  const subcategoryMap = new Map<string, Set<string>>();

  for (const service of services) {
    if (!sectorMap.has(service.sector)) {
      sectorMap.set(service.sector, new Set());
    }
    sectorMap.get(service.sector)!.add(service.category);

    const categoryKey = `${service.sector}|${service.category}`;
    if (!categoryMap.has(categoryKey)) {
      categoryMap.set(categoryKey, new Set());
    }
    categoryMap.get(categoryKey)!.add(service.subcategory);

    const subcategoryKey = `${service.sector}|${service.category}|${service.subcategory}`;
    if (!subcategoryMap.has(subcategoryKey)) {
      subcategoryMap.set(subcategoryKey, new Set());
    }
    subcategoryMap.get(subcategoryKey)!.add(service.job);
  }

  onProgress?.({
    current: 0,
    total,
    stage: 'importing',
    currentFile: 'Creating sectors...'
  });

  // Import sectors
  const sectorsToInsert = Array.from(sectorMap.keys()).map(name => ({
    name,
    description: `Services for ${name}`,
    is_active: true
  }));

  if (sectorsToInsert.length > 0) {
    const { data: insertedSectors, error: sectorError } = await supabase
      .from('service_sectors')
      .upsert(sectorsToInsert, { onConflict: 'name' })
      .select();

    if (sectorError) throw sectorError;

    // Import categories
    onProgress?.({
      current: Math.floor(total * 0.25),
      total,
      stage: 'importing',
      currentFile: 'Creating categories...'
    });

    const categoriesToInsert: any[] = [];
    for (const [sector, categories] of sectorMap.entries()) {
      const sectorData = insertedSectors?.find(s => s.name === sector);
      if (sectorData) {
        for (const categoryName of categories) {
          categoriesToInsert.push({
            name: categoryName,
            sector_id: sectorData.id,
            description: `${categoryName} services`,
            is_active: true
          });
        }
      }
    }

    if (categoriesToInsert.length > 0) {
      const { data: insertedCategories, error: categoryError } = await supabase
        .from('service_categories')
        .upsert(categoriesToInsert, { onConflict: 'name,sector_id' })
        .select();

      if (categoryError) throw categoryError;

      // Import subcategories
      onProgress?.({
        current: Math.floor(total * 0.5),
        total,
        stage: 'importing',
        currentFile: 'Creating subcategories...'
      });

      const subcategoriesToInsert: any[] = [];
      for (const [categoryKey, subcategories] of categoryMap.entries()) {
        const [sectorName, categoryName] = categoryKey.split('|');
        const categoryData = insertedCategories?.find(c => 
          c.name === categoryName && 
          insertedSectors?.find(s => s.id === c.sector_id)?.name === sectorName
        );
        
        if (categoryData) {
          for (const subcategoryName of subcategories) {
            subcategoriesToInsert.push({
              name: subcategoryName,
              category_id: categoryData.id,
              description: `${subcategoryName} services`,
              is_active: true
            });
          }
        }
      }

      if (subcategoriesToInsert.length > 0) {
        const { data: insertedSubcategories, error: subcategoryError } = await supabase
          .from('service_subcategories')
          .upsert(subcategoriesToInsert, { onConflict: 'name,category_id' })
          .select();

        if (subcategoryError) throw subcategoryError;

        // Import jobs
        onProgress?.({
          current: Math.floor(total * 0.75),
          total,
          stage: 'importing',
          currentFile: 'Creating jobs...'
        });

        const jobsToInsert: any[] = [];
        for (const [subcategoryKey, jobs] of subcategoryMap.entries()) {
          const [sectorName, categoryName, subcategoryName] = subcategoryKey.split('|');
          const subcategoryData = insertedSubcategories?.find(sc => {
            const category = insertedCategories?.find(c => c.id === sc.category_id);
            const sector = insertedSectors?.find(s => s.id === category?.sector_id);
            return sc.name === subcategoryName && 
                   category?.name === categoryName && 
                   sector?.name === sectorName;
          });
          
          if (subcategoryData) {
            for (const jobName of jobs) {
              jobsToInsert.push({
                name: jobName,
                subcategory_id: subcategoryData.id,
                description: `${jobName} service`,
                estimated_hours: 1.0,
                base_price: 100.0,
                is_active: true
              });
            }
          }
        }

        // Process jobs in batches to avoid overwhelming the database
        const batchSize = 100;
        for (let i = 0; i < jobsToInsert.length; i += batchSize) {
          const batch = jobsToInsert.slice(i, i + batchSize);
          const { error: jobError } = await supabase
            .from('service_jobs')
            .upsert(batch, { onConflict: 'name,subcategory_id' });

          if (jobError) throw jobError;

          onProgress?.({
            current: Math.floor(total * 0.75) + Math.floor((i / jobsToInsert.length) * (total * 0.25)),
            total,
            stage: 'importing',
            currentFile: `Processing jobs batch ${Math.floor(i / batchSize) + 1}...`
          });
        }
      }
    }
  }

  onProgress?.({
    current: total,
    total,
    stage: 'complete'
  });
}

export async function importFromFiles(
  files: FileList,
  onProgress?: (progress: ImportProgress) => void
): Promise<void> {
  const XLSX = await import('xlsx');
  let allServices: ImportedService[] = [];

  onProgress?.({
    current: 0,
    total: files.length,
    stage: 'reading'
  });

  // Process each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    onProgress?.({
      current: i,
      total: files.length,
      stage: 'reading',
      currentFile: file.name
    });

    try {
      const fileContent = await file.arrayBuffer();
      
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const workbook = XLSX.read(fileContent, { type: 'array' });
        const services = parseExcelData(workbook);
        allServices.push(...services);
      } else if (file.name.endsWith('.csv')) {
        const text = new TextDecoder().decode(fileContent);
        const services = parseCSVData(text);
        allServices.push(...services);
      }
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      throw new Error(`Failed to process file: ${file.name}`);
    }
  }

  onProgress?.({
    current: files.length,
    total: files.length,
    stage: 'processing'
  });

  // Remove duplicates and empty entries
  const uniqueServices = allServices.filter((service, index, array) => {
    if (!service.sector || !service.category || !service.subcategory || !service.job) {
      return false;
    }
    
    return array.findIndex(s => 
      s.sector === service.sector &&
      s.category === service.category &&
      s.subcategory === service.subcategory &&
      s.job === service.job
    ) === index;
  });

  if (uniqueServices.length === 0) {
    throw new Error('No valid service data found in the uploaded files');
  }

  // Import the data
  await importServicesData(uniqueServices, onProgress);
}
