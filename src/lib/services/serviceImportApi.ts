
import { supabase } from '@/integrations/supabase/client';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

interface ImportResult {
  sectors: number;
  categories: number;
  subcategories: number;
  jobs: number;
  totalImported: number;
}

export const importServiceHierarchy = async (rawData: any[], sectorName: string = 'Automotive Services'): Promise<ImportResult> => {
  console.log('Starting 4-tier service hierarchy import...');
  console.log('Raw data structure:', rawData);

  try {
    if (!rawData || rawData.length === 0) {
      throw new Error('No data to import');
    }

    // Get the headers (subcategory names) from the first row
    const firstRow = rawData[0];
    const headers = Object.keys(firstRow);
    console.log('Excel headers (subcategories):', headers);

    // Filter out empty headers and the first column which might be a descriptor
    const subcategoryNames = headers.filter(header => 
      header && 
      header.trim() !== '' && 
      !header.toLowerCase().includes('adjustments and diagnostics') // Skip descriptor columns
    );

    console.log('Valid subcategory names:', subcategoryNames);

    if (subcategoryNames.length === 0) {
      throw new Error('No valid subcategories found in the Excel file');
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

    // Step 2: Create a main category for this import
    const categoryName = 'General Services'; // You can make this dynamic based on sheet name
    
    const { data: categoryData, error: categoryError } = await supabase
      .from('service_categories')
      .insert({
        name: categoryName,
        description: `Imported services for ${categoryName}`,
        sector_id: sectorData.id,
        position: 0
      })
      .select()
      .single();

    if (categoryError) {
      console.error('Error inserting category:', categoryError);
      throw categoryError;
    }

    console.log('Created category:', categoryData);

    // Step 3: Create subcategories
    const subcategoriesData = [];
    for (let i = 0; i < subcategoryNames.length; i++) {
      const subcategoryName = subcategoryNames[i].trim();
      
      const { data: subData, error: subError } = await supabase
        .from('service_subcategories')
        .insert({
          name: subcategoryName,
          description: `Services for ${subcategoryName}`,
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
      console.log('Created subcategory:', subData);
    }

    // Step 4: Process jobs
    let totalJobs = 0;
    
    for (const row of rawData) {
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
                description: `${subcategoryName} service`,
                subcategory_id: subcategoryData.id,
                estimated_time: 60, // Default 1 hour
                price: 50, // Default $50
                position: totalJobs
              })
              .select()
              .single();

            if (jobError) {
              console.error('Error inserting job:', jobError);
              // Continue with other jobs instead of throwing
              continue;
            }

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
    }

    const result: ImportResult = {
      sectors: 1,
      categories: 1,
      subcategories: subcategoriesData.length,
      jobs: totalJobs,
      totalImported: 1 + 1 + subcategoriesData.length + totalJobs
    };

    console.log('Import completed successfully:', result);
    return result;

  } catch (error) {
    console.error('Service import failed:', error);
    throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
