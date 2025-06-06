
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
}

interface ServiceData {
  sectors: any[];
  categories: any[];
  subcategories: any[];
  jobs: any[];
}

export const clearServiceDatabase = async (
  onProgress?: (progress: ImportProgress) => void
): Promise<void> => {
  try {
    if (onProgress) {
      onProgress({
        stage: 'clearing',
        progress: 10,
        message: 'Clearing service jobs...'
      });
    }

    // Clear in reverse order to maintain referential integrity
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (onProgress) {
      onProgress({
        stage: 'clearing',
        progress: 40,
        message: 'Clearing service subcategories...'
      });
    }

    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (onProgress) {
      onProgress({
        stage: 'clearing',
        progress: 70,
        message: 'Clearing service categories...'
      });
    }

    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (onProgress) {
      onProgress({
        stage: 'clearing',
        progress: 90,
        message: 'Clearing service sectors...'
      });
    }

    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: 'Database cleared successfully!'
      });
    }

    console.log('Service database cleared successfully');
  } catch (error) {
    console.error('Error clearing service database:', error);
    throw new Error(`Failed to clear database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Updated function to use file input instead of fetch to avoid CORS issues
export const importFromLocalFiles = async (
  files: FileList,
  onProgress?: (progress: ImportProgress) => void
): Promise<ServiceData> => {
  try {
    if (onProgress) {
      onProgress({
        stage: 'reading',
        progress: 10,
        message: 'Reading uploaded files...'
      });
    }

    const serviceData: ServiceData = {
      sectors: [],
      categories: [],
      subcategories: [],
      jobs: []
    };

    let processedFiles = 0;
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (onProgress) {
        onProgress({
          stage: 'processing',
          progress: 10 + (processedFiles / totalFiles) * 60,
          message: `Processing file ${i + 1}/${totalFiles}: ${file.name}...`
        });
      }

      try {
        const fileData = await processFile(file);
        
        // Merge data from this file
        serviceData.sectors.push(...fileData.sectors);
        serviceData.categories.push(...fileData.categories);
        serviceData.subcategories.push(...fileData.subcategories);
        serviceData.jobs.push(...fileData.jobs);
        
        processedFiles++;
      } catch (fileError) {
        console.warn(`Failed to process file ${file.name}:`, fileError);
        // Continue with other files
      }
    }

    if (onProgress) {
      onProgress({
        stage: 'importing',
        progress: 70,
        message: 'Importing data to database...'
      });
    }

    // Import to database
    await importServiceData(serviceData, onProgress);

    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: `Import completed! Processed ${processedFiles}/${totalFiles} files successfully.`
      });
    }

    return serviceData;

  } catch (error) {
    console.error('Error importing from local files:', error);
    throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const processFile = async (file: File): Promise<ServiceData> => {
  const serviceData: ServiceData = {
    sectors: [],
    categories: [],
    subcategories: [],
    jobs: []
  };

  try {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { 
        type: 'array',
        cellDates: true,
        cellNF: false,
        cellText: false
      });

      // Process all sheets in the workbook
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          blankrows: false,
          raw: false
        }) as any[][];

        const filteredData = sheetData.filter(row => 
          row && row.some(cell => cell && cell.toString().trim())
        );

        if (filteredData.length > 0) {
          const parsedData = parseSheetData(sheetName, filteredData);
          serviceData.sectors.push(...parsedData.sectors);
          serviceData.categories.push(...parsedData.categories);
          serviceData.subcategories.push(...parsedData.subcategories);
          serviceData.jobs.push(...parsedData.jobs);
        }
      }
    } else if (fileExtension === 'csv') {
      const text = await file.text();
      const rows = text.split('\n').map(row => row.split(','));
      const filteredRows = rows.filter(row => 
        row && row.some(cell => cell && cell.trim())
      );
      
      if (filteredRows.length > 0) {
        const parsedData = parseSheetData(file.name.replace('.csv', ''), filteredRows);
        serviceData.sectors.push(...parsedData.sectors);
        serviceData.categories.push(...parsedData.categories);
        serviceData.subcategories.push(...parsedData.subcategories);
        serviceData.jobs.push(...parsedData.jobs);
      }
    }

    return serviceData;
  } catch (error) {
    console.error(`Error processing file ${file.name}:`, error);
    throw error;
  }
};

const parseSheetData = (sheetName: string, data: any[][]): ServiceData => {
  const serviceData: ServiceData = {
    sectors: [],
    categories: [],
    subcategories: [],
    jobs: []
  };

  // Determine sector name from sheet name or first cell
  let sectorName = sheetName;
  if (data.length > 0 && data[0][0]) {
    sectorName = data[0][0].toString().trim();
  }

  // Create sector
  const sectorId = generateId();
  serviceData.sectors.push({
    id: sectorId,
    name: sectorName,
    description: `Services for ${sectorName}`,
    position: 1
  });

  let currentCategory = null;
  let currentSubcategory = null;

  for (let i = 1; i < data.length; i++) { // Start from 1 to skip header
    const row = data[i];
    if (!row || row.length === 0) continue;

    const cell1 = row[0]?.toString().trim();
    const cell2 = row[1]?.toString().trim();
    const cell3 = row[2]?.toString().trim();

    // If first column has content, it's likely a category
    if (cell1 && !cell2 && !cell3) {
      const categoryId = generateId();
      currentCategory = {
        id: categoryId,
        name: cell1,
        description: `${cell1} services`,
        sector_id: sectorId,
        position: serviceData.categories.length + 1
      };
      serviceData.categories.push(currentCategory);
      currentSubcategory = null;
    }
    // If first two columns have content, it's likely a subcategory
    else if (cell1 && cell2 && !cell3) {
      if (!currentCategory) {
        // Create a default category if none exists
        const categoryId = generateId();
        currentCategory = {
          id: categoryId,
          name: 'General Services',
          description: 'General service category',
          sector_id: sectorId,
          position: 1
        };
        serviceData.categories.push(currentCategory);
      }

      const subcategoryId = generateId();
      currentSubcategory = {
        id: subcategoryId,
        name: cell2,
        description: `${cell2} services`,
        category_id: currentCategory.id
      };
      serviceData.subcategories.push(currentSubcategory);
    }
    // If we have content in the last column, it's likely a job
    else if (cell3 || (cell1 && currentSubcategory)) {
      if (!currentSubcategory) {
        // Create default category and subcategory if none exist
        if (!currentCategory) {
          const categoryId = generateId();
          currentCategory = {
            id: categoryId,
            name: 'General Services',
            description: 'General service category',
            sector_id: sectorId,
            position: 1
          };
          serviceData.categories.push(currentCategory);
        }

        const subcategoryId = generateId();
        currentSubcategory = {
          id: subcategoryId,
          name: 'General',
          description: 'General services',
          category_id: currentCategory.id
        };
        serviceData.subcategories.push(currentSubcategory);
      }

      const jobName = cell3 || cell1;
      if (jobName) {
        const jobId = generateId();
        serviceData.jobs.push({
          id: jobId,
          name: jobName,
          description: `${jobName} service`,
          subcategory_id: currentSubcategory.id,
          estimated_time: 60, // Default 1 hour
          price: 0
        });
      }
    }
  }

  return serviceData;
};

const importServiceData = async (
  serviceData: ServiceData,
  onProgress?: (progress: ImportProgress) => void
): Promise<void> => {
  try {
    // Import sectors
    if (serviceData.sectors.length > 0) {
      if (onProgress) {
        onProgress({
          stage: 'importing',
          progress: 75,
          message: `Importing ${serviceData.sectors.length} sectors...`
        });
      }

      const { error: sectorsError } = await supabase
        .from('service_sectors')
        .insert(serviceData.sectors);

      if (sectorsError) throw sectorsError;
    }

    // Import categories
    if (serviceData.categories.length > 0) {
      if (onProgress) {
        onProgress({
          stage: 'importing',
          progress: 80,
          message: `Importing ${serviceData.categories.length} categories...`
        });
      }

      const { error: categoriesError } = await supabase
        .from('service_categories')
        .insert(serviceData.categories);

      if (categoriesError) throw categoriesError;
    }

    // Import subcategories
    if (serviceData.subcategories.length > 0) {
      if (onProgress) {
        onProgress({
          stage: 'importing',
          progress: 85,
          message: `Importing ${serviceData.subcategories.length} subcategories...`
        });
      }

      const { error: subcategoriesError } = await supabase
        .from('service_subcategories')
        .insert(serviceData.subcategories);

      if (subcategoriesError) throw subcategoriesError;
    }

    // Import jobs in batches to handle large datasets
    if (serviceData.jobs.length > 0) {
      if (onProgress) {
        onProgress({
          stage: 'importing',
          progress: 90,
          message: `Importing ${serviceData.jobs.length} jobs...`
        });
      }

      const batchSize = 1000;
      for (let i = 0; i < serviceData.jobs.length; i += batchSize) {
        const batch = serviceData.jobs.slice(i, i + batchSize);
        const { error: jobsError } = await supabase
          .from('service_jobs')
          .insert(batch);

        if (jobsError) throw jobsError;

        if (onProgress && serviceData.jobs.length > batchSize) {
          const progress = 90 + ((i + batch.length) / serviceData.jobs.length) * 5;
          onProgress({
            stage: 'importing',
            progress,
            message: `Importing jobs: ${i + batch.length}/${serviceData.jobs.length}...`
          });
        }
      }
    }

    console.log('Service data imported successfully:', {
      sectors: serviceData.sectors.length,
      categories: serviceData.categories.length,
      subcategories: serviceData.subcategories.length,
      jobs: serviceData.jobs.length
    });

  } catch (error) {
    console.error('Error importing service data:', error);
    throw error;
  }
};

const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
