
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface ParsedServiceData {
  sectorName: string;
  categoryName: string;
  subcategoryName: string;
  jobName: string;
  description?: string;
  estimatedTime?: number;
  price?: number;
}

interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
}

export const importFromFolderStructure = async (
  bucketName: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<ParsedServiceData[]> => {
  try {
    if (onProgress) {
      onProgress({
        stage: 'scan',
        progress: 5,
        message: 'Scanning bucket for folder structure...'
      });
    }

    // List all files in the bucket
    const { data: fileList, error: listError } = await supabase.storage
      .from(bucketName)
      .list('', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (listError) {
      throw new Error(`Failed to list bucket contents: ${listError.message}`);
    }

    // Get folders (look for directories)
    const folders = fileList?.filter(item => item.name && !item.name.includes('.')) || [];
    
    if (onProgress) {
      onProgress({
        stage: 'scan',
        progress: 10,
        message: `Found ${folders.length} sector folders`
      });
    }

    const allServiceData: ParsedServiceData[] = [];
    const totalFolders = folders.length;

    // Process each sector folder
    for (let folderIndex = 0; folderIndex < folders.length; folderIndex++) {
      const folder = folders[folderIndex];
      const sectorName = folder.name;
      
      if (onProgress) {
        onProgress({
          stage: 'process',
          progress: 10 + (folderIndex / totalFolders) * 70,
          message: `Processing ${sectorName} sector...`
        });
      }

      // List Excel files in this folder
      const { data: folderFiles, error: folderError } = await supabase.storage
        .from(bucketName)
        .list(sectorName, {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (folderError) {
        console.warn(`Error listing files in ${sectorName}:`, folderError);
        continue;
      }

      const excelFiles = folderFiles?.filter(file => 
        file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')
      ) || [];

      // Process each Excel file (category) in the folder
      for (const excelFile of excelFiles) {
        const categoryName = excelFile.name.replace(/\.(xlsx|xls)$/i, '');
        const filePath = `${sectorName}/${excelFile.name}`;

        try {
          // Download and parse the Excel file
          const { data: fileData, error: downloadError } = await supabase.storage
            .from(bucketName)
            .download(filePath);

          if (downloadError) {
            console.warn(`Error downloading ${filePath}:`, downloadError);
            continue;
          }

          const arrayBuffer = await fileData.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          
          // Process first sheet only for category data
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const sheetData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            blankrows: false
          }) as any[][];

          if (sheetData.length < 2) continue; // Need at least header and one data row

          // Row 1 contains subcategory headers
          const subcategoryHeaders = sheetData[0].filter(Boolean);
          
          // Rows 2+ contain job tasks
          for (let rowIndex = 1; rowIndex < sheetData.length; rowIndex++) {
            const row = sheetData[rowIndex];
            
            for (let colIndex = 0; colIndex < subcategoryHeaders.length && colIndex < row.length; colIndex++) {
              const subcategoryName = subcategoryHeaders[colIndex];
              const jobName = row[colIndex];
              
              if (jobName && jobName.toString().trim()) {
                // Try to extract price and time from job name if formatted like "Job Name ($50, 30min)"
                const jobString = jobName.toString().trim();
                let cleanJobName = jobString;
                let price: number | undefined;
                let estimatedTime: number | undefined;
                
                // Look for price pattern like ($50) or ($50.00)
                const priceMatch = jobString.match(/\$(\d+(?:\.\d{2})?)/);
                if (priceMatch) {
                  price = parseFloat(priceMatch[1]);
                }
                
                // Look for time pattern like (30min) or (2hr) or (1.5hrs)
                const timeMatch = jobString.match(/(\d+(?:\.\d+)?)(min|hr|hrs?)/);
                if (timeMatch) {
                  const value = parseFloat(timeMatch[1]);
                  const unit = timeMatch[2];
                  estimatedTime = unit.startsWith('hr') ? value * 60 : value;
                }
                
                // Clean the job name by removing price and time info
                cleanJobName = jobString
                  .replace(/\$\d+(?:\.\d{2})?/g, '')
                  .replace(/\d+(?:\.\d+)?(?:min|hr|hrs?)/g, '')
                  .replace(/[(),]/g, '')
                  .trim();

                allServiceData.push({
                  sectorName,
                  categoryName,
                  subcategoryName,
                  jobName: cleanJobName,
                  description: `${categoryName} - ${subcategoryName} service`,
                  estimatedTime,
                  price
                });
              }
            }
          }
        } catch (fileError) {
          console.warn(`Error processing ${filePath}:`, fileError);
        }
      }
    }

    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: `Parsed ${allServiceData.length} services from ${totalFolders} sectors`
      });
    }

    return allServiceData;

  } catch (error) {
    console.error('Error importing from folder structure:', error);
    throw error;
  }
};

export const importParsedDataToDatabase = async (
  serviceData: ParsedServiceData[],
  onProgress?: (progress: ImportProgress) => void
): Promise<void> => {
  try {
    if (onProgress) {
      onProgress({
        stage: 'database',
        progress: 5,
        message: 'Starting database import...'
      });
    }

    // Group data by sector
    const sectorGroups = serviceData.reduce((acc, item) => {
      if (!acc[item.sectorName]) {
        acc[item.sectorName] = {};
      }
      if (!acc[item.sectorName][item.categoryName]) {
        acc[item.sectorName][item.categoryName] = {};
      }
      if (!acc[item.sectorName][item.categoryName][item.subcategoryName]) {
        acc[item.sectorName][item.categoryName][item.subcategoryName] = [];
      }
      acc[item.sectorName][item.categoryName][item.subcategoryName].push(item);
      return acc;
    }, {} as Record<string, Record<string, Record<string, ParsedServiceData[]>>>);

    const totalSectors = Object.keys(sectorGroups).length;
    let processedSectors = 0;

    for (const [sectorName, categories] of Object.entries(sectorGroups)) {
      if (onProgress) {
        onProgress({
          stage: 'database',
          progress: 5 + (processedSectors / totalSectors) * 85,
          message: `Importing ${sectorName} sector...`
        });
      }

      // Check if sector already exists
      const { data: existingSector } = await supabase
        .from('service_sectors')
        .select('id')
        .eq('name', sectorName)
        .single();

      let sectorId: string;
      
      if (existingSector) {
        sectorId = existingSector.id;
        console.log(`Using existing sector: ${sectorName}`);
      } else {
        // Create new sector
        const { data: newSector, error: sectorError } = await supabase
          .from('service_sectors')
          .insert({
            name: sectorName,
            description: `${sectorName} services`,
            position: processedSectors + 1
          })
          .select('id')
          .single();

        if (sectorError) {
          throw new Error(`Failed to create sector ${sectorName}: ${sectorError.message}`);
        }
        sectorId = newSector.id;
      }

      // Process categories within this sector
      for (const [categoryName, subcategories] of Object.entries(categories)) {
        // Check if category already exists for this sector
        const { data: existingCategory } = await supabase
          .from('service_categories')
          .select('id')
          .eq('name', categoryName)
          .eq('sector_id', sectorId)
          .single();

        let categoryId: string;
        
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          // Create new category
          const { data: newCategory, error: categoryError } = await supabase
            .from('service_categories')
            .insert({
              name: categoryName,
              description: `${categoryName} services for ${sectorName}`,
              sector_id: sectorId,
              position: Object.keys(categories).indexOf(categoryName) + 1
            })
            .select('id')
            .single();

          if (categoryError) {
            throw new Error(`Failed to create category ${categoryName}: ${categoryError.message}`);
          }
          categoryId = newCategory.id;
        }

        // Process subcategories within this category
        for (const [subcategoryName, jobs] of Object.entries(subcategories)) {
          // Check if subcategory already exists for this category
          const { data: existingSubcategory } = await supabase
            .from('service_subcategories')
            .select('id')
            .eq('name', subcategoryName)
            .eq('category_id', categoryId)
            .single();

          let subcategoryId: string;
          
          if (existingSubcategory) {
            subcategoryId = existingSubcategory.id;
          } else {
            // Create new subcategory
            const { data: newSubcategory, error: subcategoryError } = await supabase
              .from('service_subcategories')
              .insert({
                name: subcategoryName,
                description: `${subcategoryName} services`,
                category_id: categoryId,
                position: Object.keys(subcategories).indexOf(subcategoryName) + 1
              })
              .select('id')
              .single();

            if (subcategoryError) {
              throw new Error(`Failed to create subcategory ${subcategoryName}: ${subcategoryError.message}`);
            }
            subcategoryId = newSubcategory.id;
          }

          // Process jobs within this subcategory
          for (const job of jobs) {
            // Check if job already exists
            const { data: existingJob } = await supabase
              .from('service_jobs')
              .select('id')
              .eq('name', job.jobName)
              .eq('subcategory_id', subcategoryId)
              .single();

            if (!existingJob) {
              // Create new job
              const { error: jobError } = await supabase
                .from('service_jobs')
                .insert({
                  name: job.jobName,
                  description: job.description,
                  estimated_time: job.estimatedTime,
                  price: job.price,
                  subcategory_id: subcategoryId,
                  position: jobs.indexOf(job) + 1
                });

              if (jobError) {
                console.warn(`Failed to create job ${job.jobName}:`, jobError);
              }
            }
          }
        }
      }

      processedSectors++;
    }

    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: `Successfully imported ${serviceData.length} services into database`
      });
    }

  } catch (error) {
    console.error('Error importing to database:', error);
    throw error;
  }
};
