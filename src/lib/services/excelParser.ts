
import * as XLSX from 'xlsx';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export interface ParsedServiceData {
  categories: ServiceMainCategory[];
  totalJobs: number;
  totalSubcategories: number;
}

export const parseExcelFile = async (file: File): Promise<ParsedServiceData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const categories: ServiceMainCategory[] = [];
        let totalJobs = 0;
        let totalSubcategories = 0;
        
        // Process each worksheet as a category
        workbook.SheetNames.forEach((sheetName, categoryIndex) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (jsonData.length < 2) {
            console.warn(`Worksheet "${sheetName}" has insufficient data, skipping`);
            return;
          }
          
          // Row 1 contains subcategory names
          const subcategoryRow = jsonData[0] as string[];
          const subcategories: ServiceSubcategory[] = [];
          
          // Create subcategories from row 1
          subcategoryRow.forEach((subcategoryName, colIndex) => {
            if (subcategoryName && subcategoryName.trim()) {
              const subcategory: ServiceSubcategory = {
                id: `${sheetName.toLowerCase().replace(/\s+/g, '_')}_sub_${colIndex}`,
                name: subcategoryName.trim(),
                description: `${subcategoryName.trim()} services`,
                category_id: sheetName.toLowerCase().replace(/\s+/g, '_'),
                jobs: [],
                display_order: colIndex
              };
              subcategories.push(subcategory);
              totalSubcategories++;
            }
          });
          
          // Process rows 2+ as jobs, mapping them to subcategories by column
          for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
            const jobRow = jsonData[rowIndex] as string[];
            
            jobRow.forEach((jobName, colIndex) => {
              if (jobName && jobName.trim() && subcategories[colIndex]) {
                const job: ServiceJob = {
                  id: `${sheetName.toLowerCase().replace(/\s+/g, '_')}_job_${rowIndex}_${colIndex}`,
                  name: jobName.trim(),
                  description: `${jobName.trim()} service`,
                  subcategory_id: subcategories[colIndex].id,
                  category_id: sheetName.toLowerCase().replace(/\s+/g, '_'),
                  base_price: 0,
                  estimated_duration: 60,
                  skill_level: 'intermediate',
                  display_order: rowIndex - 1,
                  is_active: true
                };
                subcategories[colIndex].jobs.push(job);
                totalJobs++;
              }
            });
          }
          
          // Only add subcategories that have jobs
          const subcategoriesWithJobs = subcategories.filter(sub => sub.jobs.length > 0);
          
          if (subcategoriesWithJobs.length > 0) {
            const category: ServiceMainCategory = {
              id: sheetName.toLowerCase().replace(/\s+/g, '_'),
              name: sheetName.trim(),
              description: `${sheetName.trim()} category services`,
              display_order: categoryIndex,
              is_active: true,
              subcategories: subcategoriesWithJobs
            };
            categories.push(category);
          }
        });
        
        console.log(`Parsed Excel: ${categories.length} categories, ${totalSubcategories} subcategories, ${totalJobs} jobs`);
        
        resolve({
          categories,
          totalJobs,
          totalSubcategories
        });
        
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

export const validateExcelStructure = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Check if we have at least one worksheet
        if (workbook.SheetNames.length === 0) {
          resolve(false);
          return;
        }
        
        // Check first worksheet structure
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
        
        // Should have at least 2 rows (subcategories + at least one job row)
        resolve(jsonData.length >= 2);
        
      } catch (error) {
        console.error('Error validating Excel structure:', error);
        resolve(false);
      }
    };
    
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file);
  });
};
