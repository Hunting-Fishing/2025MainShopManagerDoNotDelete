
import { supabase } from '@/integrations/supabase/client';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

interface ImportResult {
  sectors: number;
  categories: number;
  subcategories: number;
  jobs: number;
  totalImported: number;
}

interface ExcelSheetData {
  sheetName: string;
  data: any[];
}

export const importServiceHierarchy = async (
  rawData: ExcelSheetData[] | any[], 
  sectorName: string = 'Automotive Services'
): Promise<ImportResult> => {
  console.log('Starting 4-tier service hierarchy import...');
  console.log('Raw data structure:', rawData);

  try {
    if (!rawData || rawData.length === 0) {
      throw new Error('No data to import');
    }

    // Determine if we have multi-sheet data or single sheet data
    const isMultiSheet = Array.isArray(rawData) && rawData.length > 0 && 
                        typeof rawData[0] === 'object' && 'sheetName' in rawData[0];
    
    let sheetsData: ExcelSheetData[];
    
    if (isMultiSheet) {
      sheetsData = rawData as ExcelSheetData[];
      console.log(`Processing ${sheetsData.length} sheets as categories`);
    } else {
      // Convert single sheet data to multi-sheet format
      console.log('Converting single sheet data to multi-sheet format');
      sheetsData = [{
        sheetName: 'General Services',
        data: rawData as any[]
      }];
    }

    if (sheetsData.length === 0) {
      throw new Error('No valid sheets found in the Excel file');
    }

    // Step 1: Create or get the service sector
    let sectorData;
    const { data: existingSector, error: sectorFetchError } = await supabase
      .from('service_sectors')
      .select('*')
      .eq('name', sectorName)
      .single();

    if (sectorFetchError && sectorFetchError.code !== 'PGRST116') {
      throw sectorFetchError;
    }

    if (existingSector) {
      sectorData = existingSector;
      console.log('Using existing sector:', sectorData);
    } else {
      const { data: newSector, error: sectorError } = await supabase
        .from('service_sectors')
        .insert({
          name: sectorName,
          description: `Imported ${sectorName.toLowerCase()} services`,
          position: 0
        })
        .select()
        .single();

      if (sectorError) {
        console.error('Error inserting sector:', sectorError);
        throw sectorError;
      }

      sectorData = newSector;
      console.log('Created sector:', sectorData);
    }

    let totalJobs = 0;
    let totalSubcategories = 0;
    const categoriesCreated = [];

    // Step 2: Process each sheet as a category
    for (let sheetIndex = 0; sheetIndex < sheetsData.length; sheetIndex++) {
      const sheet = sheetsData[sheetIndex];
      const categoryName = sheet.sheetName;
      
      console.log(`Processing sheet "${categoryName}" as category...`);
      
      if (!sheet.data || sheet.data.length === 0) {
        console.warn(`Sheet "${categoryName}" has no data, skipping...`);
        continue;
      }

      // Create main category for this sheet
      const { data: categoryData, error: categoryError } = await supabase
        .from('service_categories')
        .insert({
          name: categoryName,
          description: `Services for ${categoryName}`,
          sector_id: sectorData.id,
          position: sheetIndex
        })
        .select()
        .single();

      if (categoryError) {
        console.error('Error inserting category:', categoryError);
        throw categoryError;
      }

      console.log('Created category:', categoryData);
      categoriesCreated.push(categoryData);

      // Get the headers (subcategory names) from the first row structure
      const firstRow = sheet.data[0];
      if (!firstRow) {
        console.warn(`Sheet "${categoryName}" has no header row, skipping...`);
        continue;
      }

      const headers = Object.keys(firstRow);
      console.log(`Sheet "${categoryName}" headers:`, headers);

      // Filter out empty headers - these will be our subcategories
      const subcategoryNames = headers.filter(header => 
        header && 
        header.trim() !== '' && 
        header.toLowerCase() !== 'service' && // Skip common descriptor columns
        header.toLowerCase() !== 'job' &&
        header.toLowerCase() !== 'task'
      );

      console.log(`Valid subcategory names for "${categoryName}":`, subcategoryNames);

      if (subcategoryNames.length === 0) {
        console.warn(`No valid subcategories found in sheet "${categoryName}"`);
        continue;
      }

      // Step 3: Create subcategories for this category
      const subcategoriesData = [];
      for (let i = 0; i < subcategoryNames.length; i++) {
        const subcategoryName = subcategoryNames[i].trim();
        
        const { data: subData, error: subError } = await supabase
          .from('service_subcategories')
          .insert({
            name: subcategoryName,
            description: `${categoryName} - ${subcategoryName} services`,
            category_id: categoryData.id,
            position: i
          })
          .select()
          .single();

        if (subError) {
          console.error('Error inserting subcategory:', subError);
          throw subError;
        }

        subcategoriesData.push(subData);
        totalSubcategories++;
        console.log('Created subcategory:', subData);
      }

      // Step 4: Process jobs for this sheet
      let sheetJobs = 0;
      
      for (const row of sheet.data) {
        // Skip empty rows
        if (!row || Object.values(row).every(value => !value || String(value).trim() === '')) {
          continue;
        }

        // Process each subcategory column in this row
        for (let i = 0; i < subcategoryNames.length; i++) {
          const subcategoryName = subcategoryNames[i];
          const jobName = row[subcategoryName];
          
          if (jobName && String(jobName).trim() !== '') {
            const subcategoryData = subcategoriesData[i];
            
            try {
              const { data: jobData, error: jobError } = await supabase
                .from('service_jobs')
                .insert({
                  name: String(jobName).trim(),
                  description: `${categoryName} - ${subcategoryName} service`,
                  subcategory_id: subcategoryData.id,
                  estimated_time: 60, // Default 1 hour
                  price: 50, // Default $50
                  position: sheetJobs
                })
                .select()
                .single();

              if (jobError) {
                console.error('Error inserting job:', jobError);
                // Continue with other jobs instead of throwing
                continue;
              }

              sheetJobs++;
              totalJobs++;
              
              if (totalJobs % 10 === 0) {
                console.log(`Imported ${totalJobs} jobs so far...`);
              }
            } catch (error) {
              console.error('Error processing job:', jobName, error);
              // Continue with other jobs
              continue;
            }
          }
        }

        // Add small delay to prevent overwhelming the database
        if (sheet.data.indexOf(row) % 20 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }

      console.log(`Completed sheet "${categoryName}": ${sheetJobs} jobs created`);
    }

    const result: ImportResult = {
      sectors: 1,
      categories: categoriesCreated.length,
      subcategories: totalSubcategories,
      jobs: totalJobs,
      totalImported: 1 + categoriesCreated.length + totalSubcategories + totalJobs
    };

    console.log('Import completed successfully:', result);
    return result;

  } catch (error) {
    console.error('Service import failed:', error);
    throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
