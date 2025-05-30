import * as XLSX from 'xlsx';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export function parseExcelToServiceCategories(file: File): Promise<ServiceMainCategory[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const categories: ServiceMainCategory[] = [];

        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];

          if (!aoa || aoa.length < 2) {
            console.warn(`Sheet "${sheetName}" is empty or has an invalid format.`);
            return;
          }

          const subcategoryNames: string[] = aoa[0].slice(1);
          const jobsData: string[][] = aoa.slice(1);

          const subcategories: ServiceSubcategory[] = subcategoryNames.map(name => ({
            id: crypto.randomUUID(),
            name: name.trim(),
            description: '',
            jobs: []
          }));

          jobsData.forEach(rowData => {
            const jobName = rowData[0].trim();
            if (!jobName) return;

            for (let i = 1; i < rowData.length; i++) {
              const jobDescription = rowData[i].trim();
              if (!jobDescription) continue;

              subcategories[i - 1].jobs.push({
                id: crypto.randomUUID(),
                name: jobDescription,
                description: jobName,
                estimatedTime: 60,
                price: 50
              });
            }
          });

          categories.push({
            id: crypto.randomUUID(),
            name: sheetName,
            description: '',
            subcategories: subcategories,
            position: 0
          });
        });

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
  
  // Write workbook to ArrayBuffer
  console.log('Writing workbook to buffer...');
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  
  console.log('Template generated successfully');
  return buffer;
}
