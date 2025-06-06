
import { supabase } from '@/integrations/supabase/client';

export interface ProcessedServiceData {
  sectors: Array<{
    name: string;
    description?: string;
    categories: Array<{
      name: string;
      description?: string;
      subcategories: Array<{
        name: string;
        description?: string;
        jobs: Array<{
          name: string;
          description?: string;
          estimatedTime?: number;
          price?: number;
        }>;
      }>;
    }>;
  }>;
}

export interface ImportStats {
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
}

export const processServiceDataFromSheets = (sheetsData: any[]): ProcessedServiceData => {
  console.log('Processing service data from sheets:', sheetsData.length, 'sheets');
  
  const sectors: ProcessedServiceData['sectors'] = [];
  let currentSector: any = null;
  let currentCategory: any = null;
  let currentSubcategory: any = null;

  for (const sheet of sheetsData) {
    const { sheetName, data } = sheet;
    console.log(`Processing sheet: ${sheetName} with ${data.length} rows`);
    
    // Skip if no data
    if (!data || data.length === 0) continue;
    
    // Determine if this is a sector sheet (usually named after the sector)
    const sectorName = sheetName.includes('Automotive') || sheetName.includes('Auto') ? 'Automotive' : 
                      sheetName.includes('Marine') ? 'Marine' : 
                      sheetName.includes('Motorcycle') ? 'Motorcycle' : 
                      'Automotive'; // Default to Automotive for now
    
    // Find or create sector
    currentSector = sectors.find(s => s.name === sectorName);
    if (!currentSector) {
      currentSector = {
        name: sectorName,
        description: `${sectorName} services and repairs`,
        categories: []
      };
      sectors.push(currentSector);
    }
    
    // Process each row in the sheet
    for (let i = 1; i < data.length; i++) { // Skip header row
      const row = data[i];
      if (!row || row.length === 0) continue;
      
      // Assume columns are: Category, Subcategory, Service, Description, Time, Price
      const [categoryName, subcategoryName, serviceName, description, timeStr, priceStr] = row;
      
      if (!categoryName || !subcategoryName || !serviceName) continue;
      
      // Find or create category
      currentCategory = currentSector.categories.find((c: any) => c.name === categoryName);
      if (!currentCategory) {
        currentCategory = {
          name: categoryName,
          description: `${categoryName} services`,
          subcategories: []
        };
        currentSector.categories.push(currentCategory);
      }
      
      // Find or create subcategory
      currentSubcategory = currentCategory.subcategories.find((s: any) => s.name === subcategoryName);
      if (!currentSubcategory) {
        currentSubcategory = {
          name: subcategoryName,
          description: `${subcategoryName} services`,
          jobs: []
        };
        currentCategory.subcategories.push(currentSubcategory);
      }
      
      // Add service/job
      const estimatedTime = timeStr ? parseInt(timeStr.toString()) : undefined;
      const price = priceStr ? parseFloat(priceStr.toString()) : undefined;
      
      currentSubcategory.jobs.push({
        name: serviceName.toString().trim(),
        description: description?.toString().trim() || undefined,
        estimatedTime,
        price
      });
    }
  }
  
  console.log('Processed service data:', sectors);
  return { sectors };
};

export const importProcessedDataToDatabase = async (
  processedData: ProcessedServiceData,
  onProgress?: (progress: { stage: string; progress: number; message: string }) => void
): Promise<ImportStats> => {
  console.log('Importing processed data to database...');
  
  let totalSectors = 0;
  let totalCategories = 0;
  let totalSubcategories = 0;
  let totalServices = 0;
  
  const totalSteps = processedData.sectors.length;
  let currentStep = 0;
  
  for (const sectorData of processedData.sectors) {
    currentStep++;
    
    if (onProgress) {
      onProgress({
        stage: 'importing',
        progress: (currentStep / totalSteps) * 80 + 20, // 20-100% range
        message: `Importing sector: ${sectorData.name}...`
      });
    }
    
    try {
      // Insert or get sector
      const { data: existingSector } = await supabase
        .from('service_sectors')
        .select('id')
        .eq('name', sectorData.name)
        .single();
      
      let sectorId: string;
      
      if (existingSector) {
        sectorId = existingSector.id;
      } else {
        const { data: newSector, error: sectorError } = await supabase
          .from('service_sectors')
          .insert({
            name: sectorData.name,
            description: sectorData.description,
            position: totalSectors + 1,
            is_active: true
          })
          .select('id')
          .single();
        
        if (sectorError) {
          console.error('Error creating sector:', sectorError);
          continue;
        }
        
        sectorId = newSector.id;
        totalSectors++;
      }
      
      // Process categories
      for (const categoryData of sectorData.categories) {
        try {
          // Insert or get category
          const { data: existingCategory } = await supabase
            .from('service_categories')
            .select('id')
            .eq('name', categoryData.name)
            .eq('sector_id', sectorId)
            .single();
          
          let categoryId: string;
          
          if (existingCategory) {
            categoryId = existingCategory.id;
          } else {
            const { data: newCategory, error: categoryError } = await supabase
              .from('service_categories')
              .insert({
                name: categoryData.name,
                description: categoryData.description,
                sector_id: sectorId,
                position: totalCategories + 1
              })
              .select('id')
              .single();
            
            if (categoryError) {
              console.error('Error creating category:', categoryError);
              continue;
            }
            
            categoryId = newCategory.id;
            totalCategories++;
          }
          
          // Process subcategories
          for (const subcategoryData of categoryData.subcategories) {
            try {
              // Insert or get subcategory
              const { data: existingSubcategory } = await supabase
                .from('service_subcategories')
                .select('id')
                .eq('name', subcategoryData.name)
                .eq('category_id', categoryId)
                .single();
              
              let subcategoryId: string;
              
              if (existingSubcategory) {
                subcategoryId = existingSubcategory.id;
              } else {
                const { data: newSubcategory, error: subcategoryError } = await supabase
                  .from('service_subcategories')
                  .insert({
                    name: subcategoryData.name,
                    description: subcategoryData.description,
                    category_id: categoryId
                  })
                  .select('id')
                  .single();
                
                if (subcategoryError) {
                  console.error('Error creating subcategory:', subcategoryError);
                  continue;
                }
                
                subcategoryId = newSubcategory.id;
                totalSubcategories++;
              }
              
              // Process jobs/services
              for (const jobData of subcategoryData.jobs) {
                try {
                  // Check if job exists
                  const { data: existingJob } = await supabase
                    .from('service_jobs')
                    .select('id')
                    .eq('name', jobData.name)
                    .eq('subcategory_id', subcategoryId)
                    .single();
                  
                  if (!existingJob) {
                    const { error: jobError } = await supabase
                      .from('service_jobs')
                      .insert({
                        name: jobData.name,
                        description: jobData.description,
                        subcategory_id: subcategoryId,
                        estimated_time: jobData.estimatedTime,
                        price: jobData.price
                      });
                    
                    if (jobError) {
                      console.error('Error creating job:', jobError);
                      continue;
                    }
                    
                    totalServices++;
                  }
                } catch (jobError) {
                  console.error('Error processing job:', jobError);
                }
              }
            } catch (subcategoryError) {
              console.error('Error processing subcategory:', subcategoryError);
            }
          }
        } catch (categoryError) {
          console.error('Error processing category:', categoryError);
        }
      }
    } catch (sectorError) {
      console.error('Error processing sector:', sectorError);
    }
  }
  
  console.log('Import completed. Stats:', { totalSectors, totalCategories, totalSubcategories, totalServices });
  
  return {
    sectors: totalSectors,
    categories: totalCategories,
    subcategories: totalSubcategories,
    services: totalServices
  };
};
