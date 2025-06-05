
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

interface ImportResult {
  categories: number;
  subcategories: number;
  jobs: number;
  totalImported: number;
}

export const importServiceHierarchy = async (rawData: any[]): Promise<ImportResult> => {
  console.log('Starting service hierarchy import...');
  console.log('Raw data structure:', rawData);

  try {
    // Parse the Excel data structure where:
    // - Each row represents job data across multiple subcategories
    // - Column headers are subcategory names
    // - First column might be a category indicator or job name
    
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

    // Create a single main category for this import
    const categoryName = 'Automotive Services'; // Default category name
    
    // Insert main category
    const { data: categoryData, error: categoryError } = await supabase
      .from('service_categories')
      .insert({
        name: categoryName,
        description: 'Imported automotive services',
        position: 0
      })
      .select()
      .single();

    if (categoryError) {
      console.error('Error inserting category:', categoryError);
      throw categoryError;
    }

    console.log('Created category:', categoryData);

    // Create subcategories
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

    // Process jobs
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
      categories: 1,
      subcategories: subcategoriesData.length,
      jobs: totalJobs,
      totalImported: 1 + subcategoriesData.length + totalJobs
    };

    console.log('Import completed successfully:', result);
    return result;

  } catch (error) {
    console.error('Service import failed:', error);
    throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
