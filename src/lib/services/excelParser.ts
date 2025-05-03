
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { v4 as uuidv4 } from 'uuid';

/**
 * Converts Excel data to service categories based on the sheet structure where:
 * - Each sheet name becomes a main category 
 * - Column headers in each sheet represent subcategories
 * - Each cell contains service jobs for that subcategory
 */
export function parseExcelToServiceHierarchy(excelData: any): ServiceMainCategory[] {
  try {
    console.log('Parsing Excel data:', excelData);
    
    if (!excelData || typeof excelData !== 'object' || Object.keys(excelData).length === 0) {
      console.error('Empty or invalid Excel data:', excelData);
      throw new Error('Excel file appears to be empty or in an invalid format.');
    }
    
    const categories: ServiceMainCategory[] = [];
    
    // Process each sheet as a main category
    Object.keys(excelData).forEach((sheetName, index) => {
      // Skip sheets with names starting with "!" - these are special Excel sheets
      if (sheetName.startsWith('!') || !sheetName || sheetName === 'Instructions') {
        return;
      }
      
      console.log(`Processing sheet as main category: ${sheetName}`);
      
      if (!excelData[sheetName] || !Array.isArray(excelData[sheetName]) || excelData[sheetName].length === 0) {
        console.log(`Sheet ${sheetName} is empty, skipping`);
        return;
      }
      
      const sheetData = excelData[sheetName];
      console.log(`Sheet data for ${sheetName}:`, sheetData);
      
      // Create a new main category from sheet name
      const mainCategory: ServiceMainCategory = {
        id: uuidv4(),
        name: sheetName,
        description: `Services in ${sheetName} category`,
        position: index,
        subcategories: []
      };
      
      // Get column headers from the first row (row 1)
      const firstRow = sheetData[0];
      if (!firstRow) {
        console.log(`Sheet ${sheetName} has no header row, using General Services subcategory`);
        // Create a default subcategory if no headers
        const defaultSubcategory: ServiceSubcategory = {
          id: uuidv4(),
          name: "General Services",
          description: `General services for ${sheetName}`,
          jobs: []
        };
        
        mainCategory.subcategories.push(defaultSubcategory);
      } else {
        // Extract column keys (excluding __rowNum__ and any empty columns)
        const columnKeys = Object.keys(firstRow).filter(key => 
          key !== '__rowNum__' && firstRow[key] && firstRow[key].toString().trim() !== ''
        );
        
        console.log(`Found ${columnKeys.length} columns with subcategory headers:`, columnKeys);
        
        // Process each column as a subcategory
        columnKeys.forEach((columnKey) => {
          const subcategoryName = firstRow[columnKey].toString().trim();
          
          if (!subcategoryName) {
            console.log(`Empty subcategory name in column ${columnKey}, skipping`);
            return;
          }
          
          console.log(`Processing subcategory: ${subcategoryName}`);
          
          // Create subcategory
          const subcategory: ServiceSubcategory = {
            id: uuidv4(),
            name: subcategoryName,
            description: `${subcategoryName} for ${sheetName}`,
            jobs: []
          };
          
          // Process job names from each cell in the column
          for (let i = 1; i < sheetData.length; i++) {
            const row = sheetData[i];
            const cellValue = row[columnKey];
            
            if (cellValue && typeof cellValue === 'string' && cellValue.trim() !== '') {
              const jobName = cellValue.trim();
              
              console.log(`Found job: ${jobName} under ${subcategoryName}`);
              
              // Create a job
              const job: ServiceJob = {
                id: uuidv4(),
                name: jobName,
                description: `${jobName} service under ${subcategoryName}`,
                estimatedTime: 60, // Default to 60 minutes
                price: null
              };
              
              subcategory.jobs.push(job);
            }
          }
          
          // Only add subcategories that have jobs
          if (subcategory.jobs.length > 0) {
            mainCategory.subcategories.push(subcategory);
          }
        });
      }
      
      // Check if no subcategories were created from columns, create a default one
      if (mainCategory.subcategories.length === 0) {
        const defaultSubcategory: ServiceSubcategory = {
          id: uuidv4(),
          name: "General Services",
          description: `General services for ${sheetName}`,
          jobs: []
        };
        
        // Try to gather services from all rows as a flat list
        for (let i = 1; i < sheetData.length; i++) {
          const row = sheetData[i];
          Object.keys(row).forEach(key => {
            if (key !== '__rowNum__' && row[key] && typeof row[key] === 'string' && row[key].trim() !== '') {
              const jobName = row[key].trim();
              
              const job: ServiceJob = {
                id: uuidv4(),
                name: jobName,
                description: `${jobName} service under ${sheetName}`,
                estimatedTime: 60,
                price: null
              };
              
              defaultSubcategory.jobs.push(job);
            }
          });
        }
        
        if (defaultSubcategory.jobs.length > 0) {
          mainCategory.subcategories.push(defaultSubcategory);
        }
      }
      
      // Only add categories that have subcategories with jobs
      if (mainCategory.subcategories.some(sub => sub.jobs.length > 0)) {
        categories.push(mainCategory);
        console.log(`Added category ${mainCategory.name} with ${mainCategory.subcategories.length} subcategories containing ${mainCategory.subcategories.reduce((acc, sub) => acc + sub.jobs.length, 0)} total jobs`);
      } else {
        console.log(`Category ${mainCategory.name} has no jobs, skipping`);
      }
    });
    
    console.log(`Parsed ${categories.length} categories from Excel data`);
    
    if (categories.length === 0) {
      throw new Error('No valid service categories found in the Excel file. Please ensure your Excel follows the expected format with column headers as categories and rows containing services.');
    }
    
    return categories;
  } catch (error) {
    console.error("Error parsing Excel data:", error);
    throw error;
  }
}
