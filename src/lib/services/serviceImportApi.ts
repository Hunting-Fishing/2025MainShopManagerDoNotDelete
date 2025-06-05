
import { supabase } from '@/integrations/supabase/client';

interface ExcelSheetData {
  sheetName: string;
  data: any[];
}

interface ImportResult {
  totalImported: number;
  sectors: number;
  categories: number;
  subcategories: number;
  jobs: number;
}

export const importServiceHierarchy = async (rawData: ExcelSheetData[]): Promise<ImportResult> => {
  try {
    console.log('Starting service hierarchy import with data:', rawData);

    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('No valid sheet data provided');
    }

    // Step 1: Create or get the "Automotive Services" sector
    const { data: existingSector, error: sectorCheckError } = await supabase
      .from('service_sectors')
      .select('id')
      .eq('name', 'Automotive Services')
      .single();

    let sectorId: string;

    if (existingSector) {
      sectorId = existingSector.id;
      console.log('Using existing Automotive Services sector:', sectorId);
    } else {
      const { data: newSector, error: sectorCreateError } = await supabase
        .from('service_sectors')
        .insert([{
          name: 'Automotive Services',
          description: 'Automotive service categories and jobs',
          position: 1,
          is_active: true
        }])
        .select('id')
        .single();

      if (sectorCreateError) throw sectorCreateError;
      sectorId = newSector.id;
      console.log('Created new Automotive Services sector:', sectorId);
    }

    let totalImported = 0;
    let categoriesCreated = 0;
    let subcategoriesCreated = 0;
    let jobsCreated = 0;

    // Step 2: Process each sheet as a category
    for (let sheetIndex = 0; sheetIndex < rawData.length; sheetIndex++) {
      const sheet = rawData[sheetIndex];
      const categoryName = sheet.sheetName;
      
      console.log(`Processing category: ${categoryName} with ${sheet.data.length} rows`);

      if (!sheet.data || sheet.data.length < 2) {
        console.warn(`Skipping sheet "${categoryName}" - insufficient data`);
        continue;
      }

      // Create category
      const { data: category, error: categoryError } = await supabase
        .from('service_categories')
        .insert([{
          name: categoryName,
          description: `Services for ${categoryName}`,
          position: sheetIndex + 1,
          sector_id: sectorId
        }])
        .select('id')
        .single();

      if (categoryError) {
        console.error(`Error creating category ${categoryName}:`, categoryError);
        continue;
      }

      categoriesCreated++;
      const categoryId = category.id;
      console.log(`Created category: ${categoryName} (${categoryId})`);

      // Get subcategory names from first row (excluding first column which might be empty)
      const headerRow = sheet.data[0];
      const subcategoryNames = headerRow
        .slice(1) // Skip first column
        .filter(name => name && name.toString().trim())
        .map(name => name.toString().trim());

      console.log(`Found ${subcategoryNames.length} subcategories:`, subcategoryNames);

      if (subcategoryNames.length === 0) {
        console.warn(`No subcategories found in sheet "${categoryName}"`);
        continue;
      }

      // Create subcategories
      const subcategoryInserts = subcategoryNames.map((name, index) => ({
        name,
        description: `${name} services`,
        position: index + 1,
        category_id: categoryId
      }));

      const { data: subcategories, error: subcategoryError } = await supabase
        .from('service_subcategories')
        .insert(subcategoryInserts)
        .select('id, name');

      if (subcategoryError) {
        console.error(`Error creating subcategories for ${categoryName}:`, subcategoryError);
        continue;
      }

      subcategoriesCreated += subcategories.length;
      console.log(`Created ${subcategories.length} subcategories for ${categoryName}`);

      // Create a mapping of subcategory names to IDs
      const subcategoryMap = new Map();
      subcategories.forEach(sub => {
        subcategoryMap.set(sub.name, sub.id);
      });

      // Process job data (rows 2 onwards, up to 100 rows)
      const jobRows = sheet.data.slice(1, 100); // Skip header row, limit to 99 data rows
      const jobsToInsert = [];

      let jobPosition = 1;
      for (const row of jobRows) {
        if (!row || !row[0] || !row[0].toString().trim()) {
          continue; // Skip empty rows
        }

        // Process each subcategory column for this row
        for (let colIndex = 1; colIndex < Math.min(row.length, subcategoryNames.length + 1); colIndex++) {
          const jobName = row[colIndex];
          if (!jobName || !jobName.toString().trim()) {
            continue; // Skip empty cells
          }

          const subcategoryName = subcategoryNames[colIndex - 1];
          const subcategoryId = subcategoryMap.get(subcategoryName);

          if (subcategoryId) {
            jobsToInsert.push({
              name: jobName.toString().trim(),
              description: `${jobName} service`,
              estimated_time: 60, // Default 1 hour
              price: 100, // Default price
              position: jobPosition++,
              subcategory_id: subcategoryId
            });
          }
        }
      }

      // Insert jobs in batches to avoid large single operations
      const batchSize = 100;
      for (let i = 0; i < jobsToInsert.length; i += batchSize) {
        const batch = jobsToInsert.slice(i, i + batchSize);
        
        const { error: jobError } = await supabase
          .from('service_jobs')
          .insert(batch);

        if (jobError) {
          console.error(`Error inserting jobs batch for ${categoryName}:`, jobError);
        } else {
          jobsCreated += batch.length;
          console.log(`Inserted ${batch.length} jobs for ${categoryName} (batch ${Math.floor(i/batchSize) + 1})`);
        }
      }

      totalImported += jobsToInsert.length;
    }

    const result = {
      totalImported,
      sectors: 1,
      categories: categoriesCreated,
      subcategories: subcategoriesCreated,
      jobs: jobsCreated
    };

    console.log('Import completed:', result);
    return result;

  } catch (error) {
    console.error('Error importing service hierarchy:', error);
    throw error;
  }
};
