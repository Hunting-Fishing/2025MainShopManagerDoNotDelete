
import { ServiceMainCategory } from '@/types/serviceHierarchy';

export const parseExcelData = async (file: File): Promise<ServiceMainCategory[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        // Import the xlsx library dynamically
        const XLSX = await import('xlsx');
        
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Parse the Excel data into our service hierarchy format
        const categories: ServiceMainCategory[] = [];
        let currentCategory: ServiceMainCategory | null = null;
        let currentSubcategory: any = null;
        
        // Skip header row and process data
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          
          if (!row || row.length === 0) continue;
          
          const [categoryName, subcategoryName, serviceName, price, estimatedTime, description] = row;
          
          if (!categoryName) continue;
          
          // Find or create category
          if (!currentCategory || currentCategory.name !== categoryName) {
            currentCategory = {
              id: `cat-${categoryName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
              name: categoryName,
              description: `${categoryName} services`,
              subcategories: []
            };
            categories.push(currentCategory);
            currentSubcategory = null;
          }
          
          // Find or create subcategory
          if (subcategoryName && (!currentSubcategory || currentSubcategory.name !== subcategoryName)) {
            currentSubcategory = {
              id: `sub-${subcategoryName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
              name: subcategoryName,
              description: `${subcategoryName} services`,
              jobs: []
            };
            currentCategory.subcategories.push(currentSubcategory);
          }
          
          // Add service/job if we have a service name
          if (serviceName && currentSubcategory) {
            const job = {
              id: `job-${serviceName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
              name: serviceName,
              description: description || undefined,
              price: price ? parseFloat(price.toString()) : undefined,
              estimatedTime: estimatedTime ? parseInt(estimatedTime.toString()) : undefined
            };
            currentSubcategory.jobs.push(job);
          }
        }
        
        console.log('Parsed Excel data:', categories);
        resolve(categories);
        
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject(new Error('Failed to parse Excel file: ' + (error instanceof Error ? error.message : 'Unknown error')));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};
