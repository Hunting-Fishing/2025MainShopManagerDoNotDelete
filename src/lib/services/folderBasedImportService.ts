
import { supabase } from '@/integrations/supabase/client';

export interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
  error?: string;
  completed?: boolean;
}

interface ServiceRecord {
  sector: string;
  category: string;
  subcategory: string;
  job: string;
  description?: string;
  price?: number;
  duration?: number;
}

export const processServiceData = async (
  sheetsData: any[],
  onProgress?: (progress: ImportProgress) => void
) => {
  try {
    if (onProgress) {
      onProgress({
        stage: 'validation',
        progress: 10,
        message: 'Validating sheet data...'
      });
    }

    const serviceRecords: ServiceRecord[] = [];
    let processedSheets = 0;

    for (const sheet of sheetsData) {
      if (onProgress) {
        onProgress({
          stage: 'processing',
          progress: 10 + (processedSheets / sheetsData.length) * 40,
          message: `Processing sheet: ${sheet.sheetName}...`
        });
      }

      const records = processSheetData(sheet.sheetName, sheet.data);
      serviceRecords.push(...records);
      processedSheets++;
    }

    if (serviceRecords.length === 0) {
      throw new Error('No valid service records found in the imported sheets. Please check the file format and column headers.');
    }

    if (onProgress) {
      onProgress({
        stage: 'importing',
        progress: 50,
        message: `Importing ${serviceRecords.length} service records...`
      });
    }

    await importServiceRecords(serviceRecords, onProgress);

    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: `Successfully imported ${serviceRecords.length} service records!`,
        completed: true
      });
    }

  } catch (error) {
    console.error('Error processing service data:', error);
    throw error;
  }
};

const processSheetData = (sheetName: string, data: any[]): ServiceRecord[] => {
  if (!data || data.length < 2) {
    console.warn(`Sheet "${sheetName}" has insufficient data`);
    return [];
  }

  const headers = data[0];
  if (!headers || !Array.isArray(headers)) {
    console.warn(`Sheet "${sheetName}" has invalid headers`);
    return [];
  }

  // Normalize headers to lowercase for flexible matching
  const normalizedHeaders = headers.map((h: any) => 
    h ? h.toString().toLowerCase().trim() : ''
  );

  // Find column indices with flexible matching
  const columnMap = findColumnIndices(normalizedHeaders);
  
  if (!columnMap.isValid) {
    console.warn(`Sheet "${sheetName}": ${columnMap.missingColumns.join(', ')} columns not found`);
    console.log('Available columns:', normalizedHeaders);
    return [];
  }

  const records: ServiceRecord[] = [];
  
  // Process data rows (skip header row)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !Array.isArray(row)) continue;

    const record = createServiceRecord(row, columnMap, sheetName);
    if (record) {
      records.push(record);
    }
  }

  console.log(`Sheet "${sheetName}": Processed ${records.length} service records`);
  return records;
};

const findColumnIndices = (headers: string[]) => {
  // Define flexible column name patterns
  const patterns = {
    sector: ['sector', 'service sector', 'business sector', 'industry'],
    category: ['category', 'service category', 'main category', 'type'],
    subcategory: ['subcategory', 'sub category', 'sub-category', 'service type'],
    job: ['job', 'service', 'service name', 'task', 'work', 'description']
  };

  const columnMap: any = {
    sector: -1,
    category: -1,
    subcategory: -1,
    job: -1,
    description: -1,
    price: -1,
    duration: -1,
    isValid: false,
    missingColumns: []
  };

  // Find required columns
  for (const [key, possibleNames] of Object.entries(patterns)) {
    const index = headers.findIndex(header => 
      possibleNames.some(pattern => header.includes(pattern))
    );
    columnMap[key] = index;
    if (index === -1) {
      columnMap.missingColumns.push(key);
    }
  }

  // Find optional columns
  const descIndex = headers.findIndex(h => 
    h.includes('description') || h.includes('details') || h.includes('notes')
  );
  columnMap.description = descIndex;

  const priceIndex = headers.findIndex(h => 
    h.includes('price') || h.includes('cost') || h.includes('rate') || h.includes('amount')
  );
  columnMap.price = priceIndex;

  const durationIndex = headers.findIndex(h => 
    h.includes('duration') || h.includes('time') || h.includes('hours') || h.includes('minutes')
  );
  columnMap.duration = durationIndex;

  // Check if we have at least the required columns (job is the minimum requirement)
  columnMap.isValid = columnMap.job !== -1;
  
  // If we don't have explicit categories, we can use the sheet name as category
  if (columnMap.category === -1 && columnMap.job !== -1) {
    columnMap.useSheetAsCategory = true;
    columnMap.isValid = true;
    columnMap.missingColumns = columnMap.missingColumns.filter((col: string) => col !== 'category');
  }

  return columnMap;
};

const createServiceRecord = (row: any[], columnMap: any, sheetName: string): ServiceRecord | null => {
  try {
    const getValue = (index: number) => {
      if (index === -1 || !row[index]) return null;
      return row[index].toString().trim();
    };

    const job = getValue(columnMap.job);
    if (!job) return null;

    const record: ServiceRecord = {
      sector: getValue(columnMap.sector) || 'General',
      category: columnMap.useSheetAsCategory ? sheetName : (getValue(columnMap.category) || 'General'),
      subcategory: getValue(columnMap.subcategory) || 'General',
      job: job
    };

    // Add optional fields
    const description = getValue(columnMap.description);
    if (description) record.description = description;

    const priceStr = getValue(columnMap.price);
    if (priceStr) {
      const price = parseFloat(priceStr.replace(/[^\d.-]/g, ''));
      if (!isNaN(price)) record.price = price;
    }

    const durationStr = getValue(columnMap.duration);
    if (durationStr) {
      const duration = parseFloat(durationStr.replace(/[^\d.-]/g, ''));
      if (!isNaN(duration)) record.duration = duration;
    }

    return record;
  } catch (error) {
    console.warn('Error creating service record from row:', error);
    return null;
  }
};

const importServiceRecords = async (
  records: ServiceRecord[],
  onProgress?: (progress: ImportProgress) => void
) => {
  const sectorsMap = new Map<string, any>();
  const categoriesMap = new Map<string, any>();
  const subcategoriesMap = new Map<string, any>();

  let processed = 0;
  const totalRecords = records.length;

  for (const record of records) {
    // Create or get sector
    const sectorKey = record.sector.toLowerCase();
    if (!sectorsMap.has(sectorKey)) {
      const { data: existingSector } = await supabase
        .from('service_sectors')
        .select('id')
        .eq('name', record.sector)
        .single();

      if (existingSector) {
        sectorsMap.set(sectorKey, existingSector);
      } else {
        const { data: newSector, error } = await supabase
          .from('service_sectors')
          .insert({ name: record.sector })
          .select()
          .single();

        if (error) throw error;
        sectorsMap.set(sectorKey, newSector);
      }
    }

    const sector = sectorsMap.get(sectorKey);

    // Create or get category
    const categoryKey = `${sectorKey}-${record.category.toLowerCase()}`;
    if (!categoriesMap.has(categoryKey)) {
      const { data: existingCategory } = await supabase
        .from('service_categories')
        .select('id')
        .eq('name', record.category)
        .eq('sector_id', sector.id)
        .single();

      if (existingCategory) {
        categoriesMap.set(categoryKey, existingCategory);
      } else {
        const { data: newCategory, error } = await supabase
          .from('service_categories')
          .insert({ 
            name: record.category, 
            sector_id: sector.id 
          })
          .select()
          .single();

        if (error) throw error;
        categoriesMap.set(categoryKey, newCategory);
      }
    }

    const category = categoriesMap.get(categoryKey);

    // Create or get subcategory
    const subcategoryKey = `${categoryKey}-${record.subcategory.toLowerCase()}`;
    if (!subcategoriesMap.has(subcategoryKey)) {
      const { data: existingSubcategory } = await supabase
        .from('service_subcategories')
        .select('id')
        .eq('name', record.subcategory)
        .eq('category_id', category.id)
        .single();

      if (existingSubcategory) {
        subcategoriesMap.set(subcategoryKey, existingSubcategory);
      } else {
        const { data: newSubcategory, error } = await supabase
          .from('service_subcategories')
          .insert({ 
            name: record.subcategory, 
            category_id: category.id 
          })
          .select()
          .single();

        if (error) throw error;
        subcategoriesMap.set(subcategoryKey, newSubcategory);
      }
    }

    const subcategory = subcategoriesMap.get(subcategoryKey);

    // Check if job already exists
    const { data: existingJob } = await supabase
      .from('service_jobs')
      .select('id')
      .eq('name', record.job)
      .eq('subcategory_id', subcategory.id)
      .single();

    if (!existingJob) {
      // Create the job
      const jobData: any = {
        name: record.job,
        subcategory_id: subcategory.id
      };

      if (record.description) jobData.description = record.description;
      if (record.price) jobData.price = record.price;
      if (record.duration) jobData.estimated_time = record.duration;

      const { error } = await supabase
        .from('service_jobs')
        .insert(jobData);

      if (error) throw error;
    }

    processed++;
    if (onProgress && processed % 10 === 0) {
      onProgress({
        stage: 'importing',
        progress: 50 + (processed / totalRecords) * 50,
        message: `Imported ${processed}/${totalRecords} service records...`
      });
    }
  }
};

export const clearAllServiceData = async () => {
  // Delete in reverse order due to foreign key constraints
  await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
};

export const getServiceCounts = async () => {
  const [sectors, categories, subcategories, jobs] = await Promise.all([
    supabase.from('service_sectors').select('id', { count: 'exact' }),
    supabase.from('service_categories').select('id', { count: 'exact' }),
    supabase.from('service_subcategories').select('id', { count: 'exact' }),
    supabase.from('service_jobs').select('id', { count: 'exact' })
  ]);

  return {
    sectors: sectors.count || 0,
    categories: categories.count || 0,
    subcategories: subcategories.count || 0,
    jobs: jobs.count || 0
  };
};
