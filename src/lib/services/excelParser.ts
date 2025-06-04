
import * as XLSX from 'xlsx';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

// Export the main parsing function with the correct name
export function parseExcelFile(file: File): Promise<ServiceMainCategory[]> {
  return parseExcelToServiceCategories(file);
}

export function parseExcelToServiceCategories(file: File): Promise<ServiceMainCategory[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e: any) => {
      try {
        console.log('Starting Excel file parsing...');
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const categories: ServiceMainCategory[] = [];
        let categoryIndex = 0;

        for (const sheetName of workbook.SheetNames) {
          console.log(`Processing sheet: ${sheetName}`);
          const worksheet = workbook.Sheets[sheetName];
          const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

          if (!aoa || aoa.length < 2) {
            console.warn(`Sheet "${sheetName}" is empty or has an invalid format.`);
            continue;
          }

          // Get subcategory names from first row (starting from column B)
          const subcategoryNames: string[] = aoa[0].slice(1).filter(name => name && name.toString().trim());
          console.log(`Found subcategories: ${subcategoryNames.join(', ')}`);

          // Create subcategories
          const subcategories: ServiceSubcategory[] = subcategoryNames.map(name => ({
            id: crypto.randomUUID(),
            name: name.toString().trim(),
            description: '',
            jobs: []
          }));

          // Process job data (starting from row 2)
          const jobsData: string[][] = aoa.slice(1);
          
          for (const rowData of jobsData) {
            if (!rowData[0] || !rowData[0].toString().trim()) continue;

            const jobName = rowData[0].toString().trim();
            
            // Process each subcategory column
            for (let i = 1; i < rowData.length && i <= subcategoryNames.length; i++) {
              const jobDescription = rowData[i] ? rowData[i].toString().trim() : '';
              if (!jobDescription) continue;

              const subcategoryIndex = i - 1;
              if (subcategoryIndex < subcategories.length) {
                subcategories[subcategoryIndex].jobs.push({
                  id: crypto.randomUUID(),
                  name: jobDescription,
                  description: jobName,
                  estimatedTime: 60,
                  price: 50
                });
              }
            }

            // Add small delay to prevent blocking
            if (jobsData.indexOf(rowData) % 10 === 0) {
              await new Promise(resolve => setTimeout(resolve, 1));
            }
          }

          categories.push({
            id: crypto.randomUUID(),
            name: sheetName,
            description: '',
            subcategories: subcategories,
            position: categoryIndex++
          });

          console.log(`Completed processing sheet: ${sheetName} with ${subcategories.length} subcategories`);
        }

        console.log(`Excel parsing completed. Total categories: ${categories.length}`);
        resolve(categories);

      } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject(error);
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
}

// Export with the correct name
export function generateExcelTemplate(): ArrayBuffer {
  return generateServiceTemplate();
}

export function generateServiceTemplate(): ArrayBuffer {
  console.log('Generating service template...');
  
  const workbook = XLSX.utils.book_new();
  
  // Sample data for demonstration
  const sampleCategories = [
    {
      name: 'Automotive Services',
      subcategories: ['Oil Change', 'Brake Service', 'Engine Repair'],
      jobs: [
        ['Basic Oil Change', 'Synthetic Oil Change', 'Oil Filter Replacement'],
        ['Brake Pad Replacement', 'Brake Rotor Service', 'Brake Fluid Flush'],
        ['Engine Diagnostics', 'Engine Tune-up', 'Engine Overhaul']
      ]
    },
    {
      name: 'Electrical Services', 
      subcategories: ['Battery Service', 'Alternator Service', 'Wiring'],
      jobs: [
        ['Battery Test', 'Battery Replacement', 'Battery Cleaning'],
        ['Alternator Test', 'Alternator Replacement', 'Alternator Repair'],
        ['Wire Repair', 'Harness Replacement', 'Electrical Diagnostics']
      ]
    }
  ];
  
  sampleCategories.forEach(category => {
    console.log(`Creating sheet for category: ${category.name}`);
    
    // Create worksheet data
    const wsData: any[][] = [];
    
    // Header row (row 1): empty cell in A1, then subcategory names
    const headerRow = ['', ...category.subcategories];
    wsData.push(headerRow);
    
    // Find the maximum number of jobs in any subcategory
    const maxJobs = Math.max(...category.jobs.map(jobList => jobList.length));
    
    // Data rows: jobs for each subcategory
    for (let i = 0; i < maxJobs; i++) {
      const dataRow = [''];
      category.jobs.forEach(jobList => {
        dataRow.push(jobList[i] || '');
      });
      wsData.push(dataRow);
    }
    
    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    
    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, category.name);
  });
  
  // Write workbook to ArrayBuffer using correct XLSX API
  console.log('Writing workbook to buffer...');
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  
  console.log('Template generated successfully');
  return buffer;
}
