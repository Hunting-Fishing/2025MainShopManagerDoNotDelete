
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { v4 as uuidv4 } from 'uuid';

/**
 * Converts Excel data to service categories based on the sheet structure where:
 * - Column headers represent main categories 
 * - Each column contains service jobs for that category
 * - Some categories may have subcategories
 */
export function parseExcelToServiceHierarchy(excelData: any): ServiceMainCategory[] {
  try {
    console.log('Parsing Excel data:', excelData);
    
    if (!excelData || typeof excelData !== 'object' || Object.keys(excelData).length === 0) {
      console.error('Empty or invalid Excel data:', excelData);
      throw new Error('Excel file appears to be empty or in an invalid format.');
    }
    
    const categories: ServiceMainCategory[] = [];
    
    // Process each sheet as a source of data
    Object.keys(excelData).forEach((sheetName, index) => {
      // Skip sheets with names starting with "!" - these are special Excel sheets
      if (sheetName.startsWith('!') || !sheetName || sheetName === 'Instructions') {
        return;
      }
      
      console.log(`Processing sheet: ${sheetName}`);
      
      if (!excelData[sheetName] || !Array.isArray(excelData[sheetName]) || excelData[sheetName].length === 0) {
        console.log(`Sheet ${sheetName} is empty, skipping`);
        return;
      }
      
      const sheetData = excelData[sheetName];
      console.log(`Sheet data for ${sheetName}:`, sheetData);
      
      // Debug the first row to see its structure
      if (sheetData.length > 0) {
        console.log(`First row structure for ${sheetName}:`, sheetData[0]);
      }
      
      // Get column headers from the first row (row 1)
      const firstRow = sheetData[0];
      if (!firstRow) {
        console.log(`Sheet ${sheetName} has no header row, skipping`);
        return;
      }
      
      // Extract column keys (excluding __rowNum__ and any empty columns)
      const columnKeys = Object.keys(firstRow).filter(key => 
        key !== '__rowNum__' && firstRow[key] && firstRow[key].toString().trim() !== ''
      );
      
      console.log(`Found ${columnKeys.length} columns with category headers:`, columnKeys);
      console.log(`First row values:`, columnKeys.map(key => firstRow[key]));
      
      // Process each column as a main category
      columnKeys.forEach((columnKey, columnIndex) => {
        const categoryName = firstRow[columnKey].toString().trim();
        
        if (!categoryName) {
          console.log(`Empty category name in column ${columnKey}, skipping`);
          return;
        }
        
        console.log(`Processing main category: ${categoryName}`);
        
        // Create a new main category
        const mainCategory: ServiceMainCategory = {
          id: uuidv4(),
          name: categoryName,
          description: `Services in ${categoryName} category`,
          position: columnIndex,
          subcategories: []
        };

        // Group service jobs by subcategory
        // In this case, each cell value in the column will be treated as a service/job
        const jobsBySubcategory: Record<string, ServiceJob[]> = {};
        const defaultSubcategoryName = "General Services";
        jobsBySubcategory[defaultSubcategoryName] = [];
        
        // Start from row 2 (index 1) to skip the header
        for (let i = 1; i < sheetData.length; i++) {
          const row = sheetData[i];
          const cellValue = row[columnKey];
          
          if (cellValue && typeof cellValue === 'string' && cellValue.trim() !== '') {
            const jobName = cellValue.trim();
            
            console.log(`Found job: ${jobName} under ${categoryName}`);
            
            // Create a job
            const job: ServiceJob = {
              id: uuidv4(),
              name: jobName,
              description: `${jobName} service under ${categoryName}`,
              estimatedTime: 60, // Default to 60 minutes
              price: null // Price not specified in the Excel
            };
            
            // Add to default subcategory
            jobsBySubcategory[defaultSubcategoryName].push(job);
          }
        }
        
        // Create subcategories from the grouped jobs
        Object.keys(jobsBySubcategory).forEach(subcategoryName => {
          const jobs = jobsBySubcategory[subcategoryName];
          
          if (jobs.length > 0) {
            const subcategory: ServiceSubcategory = {
              id: uuidv4(),
              name: subcategoryName,
              description: `${subcategoryName} for ${categoryName}`,
              jobs: jobs
            };
            
            mainCategory.subcategories.push(subcategory);
          }
        });
        
        // Only add categories that have jobs
        if (mainCategory.subcategories.length > 0) {
          categories.push(mainCategory);
          console.log(`Added category ${mainCategory.name} with ${mainCategory.subcategories.length} subcategories containing ${mainCategory.subcategories.reduce((acc, sub) => acc + sub.jobs.length, 0)} total jobs`);
        } else {
          console.log(`Category ${mainCategory.name} has no jobs, skipping`);
        }
      });
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
