
import { supabase } from '@/integrations/supabase/client';

export interface ImportResult {
  totalImported: number;
  categories: number;
  subcategories: number;
  jobs: number;
}

export interface ServiceRow {
  Category?: string;
  Subcategory?: string;
  Service?: string;
  Description?: string;
  EstimatedTime?: string | number;
  Price?: string | number;
  [key: string]: any;
}

export const importServiceHierarchy = async (rawData: any[]): Promise<ImportResult> => {
  console.log('Starting service hierarchy import with data:', rawData);
  
  if (!rawData || rawData.length === 0) {
    throw new Error('No data provided for import');
  }

  // Process and validate the data
  const processedData = rawData.map((row, index) => {
    console.log(`Processing row ${index + 1}:`, row);
    
    // Handle different possible column names (case insensitive)
    const category = findValue(row, ['category', 'Category', 'CATEGORY', 'main_category', 'Main Category']);
    const subcategory = findValue(row, ['subcategory', 'Subcategory', 'SUBCATEGORY', 'sub_category', 'Sub Category']);
    const service = findValue(row, ['service', 'Service', 'SERVICE', 'job', 'Job', 'service_name', 'Service Name']);
    const description = findValue(row, ['description', 'Description', 'DESCRIPTION', 'desc', 'Desc']);
    const estimatedTime = parseNumber(findValue(row, ['estimated_time', 'Estimated Time', 'EstimatedTime', 'time', 'Time', 'duration', 'Duration']));
    const price = parseNumber(findValue(row, ['price', 'Price', 'PRICE', 'cost', 'Cost', 'amount', 'Amount']));

    return {
      category: category || '',
      subcategory: subcategory || '',
      service: service || '',
      description: description || '',
      estimatedTime,
      price
    };
  }).filter(row => row.category && row.service); // Only keep rows with at least category and service

  console.log(`Filtered to ${processedData.length} valid rows`);

  if (processedData.length === 0) {
    throw new Error('No valid service data found. Please ensure your file has Category and Service columns.');
  }

  // Group data by categories and subcategories
  const categoryMap = new Map();
  
  processedData.forEach(row => {
    if (!categoryMap.has(row.category)) {
      categoryMap.set(row.category, new Map());
    }
    
    const subcategoryKey = row.subcategory || 'General';
    if (!categoryMap.get(row.category).has(subcategoryKey)) {
      categoryMap.get(row.category).set(subcategoryKey, []);
    }
    
    categoryMap.get(row.category).get(subcategoryKey).push(row);
  });

  console.log('Organized data into categories:', Array.from(categoryMap.keys()));

  let categoriesCreated = 0;
  let subcategoriesCreated = 0;
  let jobsCreated = 0;

  try {
    // Import categories, subcategories, and jobs
    for (const [categoryName, subcategoryMap] of categoryMap) {
      console.log(`Creating category: ${categoryName}`);
      
      // Create or get category
      const { data: categoryData, error: categoryError } = await supabase
        .from('service_categories')
        .upsert({
          name: categoryName,
          description: `${categoryName} services`,
          position: categoriesCreated + 1
        }, {
          onConflict: 'name'
        })
        .select()
        .single();

      if (categoryError) {
        console.error('Category creation error:', categoryError);
        throw new Error(`Failed to create category "${categoryName}": ${categoryError.message}`);
      }

      categoriesCreated++;
      console.log('Category created/updated:', categoryData);

      for (const [subcategoryName, services] of subcategoryMap) {
        console.log(`Creating subcategory: ${subcategoryName} under ${categoryName}`);
        
        // Create or get subcategory
        const { data: subcategoryData, error: subcategoryError } = await supabase
          .from('service_subcategories')
          .upsert({
            category_id: categoryData.id,
            name: subcategoryName,
            description: `${subcategoryName} services`
          }, {
            onConflict: 'category_id,name'
          })
          .select()
          .single();

        if (subcategoryError) {
          console.error('Subcategory creation error:', subcategoryError);
          throw new Error(`Failed to create subcategory "${subcategoryName}": ${subcategoryError.message}`);
        }

        subcategoriesCreated++;
        console.log('Subcategory created/updated:', subcategoryData);

        // Create jobs for this subcategory
        for (const service of services) {
          console.log(`Creating job: ${service.service}`);
          
          const { data: jobData, error: jobError } = await supabase
            .from('service_jobs')
            .upsert({
              subcategory_id: subcategoryData.id,
              name: service.service,
              description: service.description || '',
              estimated_time: service.estimatedTime || null,
              price: service.price || null
            }, {
              onConflict: 'subcategory_id,name'
            })
            .select()
            .single();

          if (jobError) {
            console.error('Job creation error:', jobError);
            throw new Error(`Failed to create job "${service.service}": ${jobError.message}`);
          }

          jobsCreated++;
          console.log('Job created/updated:', jobData);
        }
      }
    }

    const result = {
      totalImported: jobsCreated,
      categories: categoriesCreated,
      subcategories: subcategoriesCreated,
      jobs: jobsCreated
    };

    console.log('Import completed successfully:', result);
    return result;

  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
};

// Helper function to find a value by multiple possible keys
function findValue(obj: any, keys: string[]): string | undefined {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      return String(obj[key]).trim();
    }
  }
  return undefined;
}

// Helper function to parse numbers
function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const num = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? undefined : num;
}
