
import * as XLSX from 'xlsx';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export interface ParsedExcelData {
  categories: ServiceMainCategory[];
  stats: {
    totalCategories: number;
    totalSubcategories: number;
    totalJobs: number;
  };
}

interface ExcelRow {
  [key: string]: any;
}

export const parseExcelFile = async (file: File): Promise<ParsedExcelData> => {
  console.log('📋 Starting Excel file parsing...');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        console.log('📊 Workbook sheets:', workbook.SheetNames);
        
        // Use the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with header row
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: ''
        }).map((row: any[]) => {
          // Convert array rows to objects with proper headers
          const headers = ['category', 'subcategory', 'job', 'description', 'price', 'estimatedTime'];
          const rowObj: ExcelRow = {};
          headers.forEach((header, index) => {
            rowObj[header] = row[index] || '';
          });
          return rowObj;
        });
        
        console.log('📋 Raw JSON data:', jsonData.slice(0, 5)); // Log first 5 rows
        
        if (!jsonData || jsonData.length === 0) {
          throw new Error('No data found in Excel file');
        }
        
        const processedData = processWorksheetData(jsonData);
        console.log('✅ Processed data:', processedData);
        
        resolve(processedData);
        
      } catch (error) {
        console.error('❌ Excel parsing error:', error);
        reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

const processWorksheetData = (rows: ExcelRow[]): ParsedExcelData => {
  console.log('🔄 Processing worksheet data with', rows.length, 'rows');
  
  const categories = new Map<string, ServiceMainCategory>();
  let totalSubcategories = 0;
  let totalJobs = 0;
  
  // Skip header row if it exists
  const dataRows = rows.slice(1).filter(row => 
    row.category && row.category.toString().trim() !== ''
  );
  
  console.log('📊 Processing', dataRows.length, 'data rows');
  
  dataRows.forEach((row, index) => {
    try {
      const categoryName = cleanValue(row.category);
      const subcategoryName = cleanValue(row.subcategory);
      const jobName = cleanValue(row.job);
      
      console.log(`Row ${index + 1}:`, { categoryName, subcategoryName, jobName });
      
      if (!categoryName) {
        console.warn(`Row ${index + 1}: Missing category name`);
        return;
      }
      
      // Get or create category
      if (!categories.has(categoryName)) {
        categories.set(categoryName, {
          id: `cat-${categoryName.toLowerCase().replace(/\s+/g, '-')}`,
          name: categoryName,
          description: '',
          subcategories: [],
          position: categories.size + 1
        });
      }
      
      const category = categories.get(categoryName)!;
      
      if (subcategoryName) {
        // Find or create subcategory
        let subcategory = category.subcategories.find(sub => sub.name === subcategoryName);
        
        if (!subcategory) {
          subcategory = {
            id: `sub-${subcategoryName.toLowerCase().replace(/\s+/g, '-')}`,
            name: subcategoryName,
            description: '',
            jobs: []
          };
          category.subcategories.push(subcategory);
          totalSubcategories++;
        }
        
        if (jobName) {
          // Add job to subcategory
          const job: ServiceJob = {
            id: `job-${jobName.toLowerCase().replace(/\s+/g, '-')}-${totalJobs}`,
            name: jobName,
            description: cleanValue(row.description) || '',
            price: parsePrice(row.price),
            estimatedTime: parseTime(row.estimatedTime)
          };
          
          subcategory.jobs.push(job);
          totalJobs++;
        }
      }
    } catch (error) {
      console.error(`Error processing row ${index + 1}:`, error, row);
    }
  });
  
  const categoriesArray = Array.from(categories.values());
  
  console.log('📈 Processing complete:', {
    categories: categoriesArray.length,
    subcategories: totalSubcategories,
    jobs: totalJobs
  });
  
  return {
    categories: categoriesArray,
    stats: {
      totalCategories: categoriesArray.length,
      totalSubcategories,
      totalJobs
    }
  };
};

const cleanValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const parsePrice = (value: any): number | undefined => {
  if (!value) return undefined;
  const cleaned = String(value).replace(/[$,]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? undefined : parsed;
};

const parseTime = (value: any): number | undefined => {
  if (!value) return undefined;
  const parsed = parseInt(String(value));
  return isNaN(parsed) ? undefined : parsed;
};
