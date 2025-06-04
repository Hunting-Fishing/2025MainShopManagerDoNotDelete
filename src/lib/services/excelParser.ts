
import * as XLSX from 'xlsx';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export interface ParsedExcelData {
  categories: ServiceMainCategory[];
  duplicates: any[];
  stats: {
    totalCategories: number;
    totalSubcategories: number;
    totalJobs: number;
  };
}

export interface ExcelRow {
  Category?: string;
  Subcategory?: string;
  Service?: string;
  Job?: string;
  Description?: string;
  'Estimated Time'?: number;
  'Estimated Time (minutes)'?: number;
  Price?: number;
  Cost?: number;
  [key: string]: any;
}

export const parseExcelFile = async (file: File): Promise<ParsedExcelData> => {
  console.log('📋 Starting Excel file parsing:', file.name);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
        console.log('📊 Raw Excel data:', jsonData);
        
        const parsedData = processExcelData(jsonData);
        console.log('✅ Parsed Excel data:', parsedData);
        
        resolve(parsedData);
      } catch (error) {
        console.error('❌ Excel parsing error:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

const processExcelData = (rows: ExcelRow[]): ParsedExcelData => {
  const categoriesMap = new Map<string, ServiceMainCategory>();
  const subcategoriesMap = new Map<string, ServiceSubcategory>();
  
  rows.forEach((row, index) => {
    try {
      // Get category name (try different column names)
      const categoryName = row.Category || row.category || row.CATEGORY;
      if (!categoryName) {
        console.warn(`Row ${index + 1}: No category found`, row);
        return;
      }
      
      // Get subcategory name
      const subcategoryName = row.Subcategory || row.subcategory || row.SUBCATEGORY || row.SubCategory;
      if (!subcategoryName) {
        console.warn(`Row ${index + 1}: No subcategory found`, row);
        return;
      }
      
      // Get job/service name
      const jobName = row.Service || row.Job || row.service || row.job || row.SERVICE || row.JOB;
      if (!jobName) {
        console.warn(`Row ${index + 1}: No job/service name found`, row);
        return;
      }
      
      // Create or get category
      const categoryKey = categoryName.trim();
      if (!categoriesMap.has(categoryKey)) {
        categoriesMap.set(categoryKey, {
          id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: categoryKey,
          description: row.CategoryDescription || row['Category Description'] || '',
          subcategories: [],
          position: categoriesMap.size + 1
        });
      }
      
      const category = categoriesMap.get(categoryKey)!;
      
      // Create or get subcategory
      const subcategoryKey = `${categoryKey}_${subcategoryName.trim()}`;
      if (!subcategoriesMap.has(subcategoryKey)) {
        const subcategory: ServiceSubcategory = {
          id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: subcategoryName.trim(),
          description: row.SubcategoryDescription || row['Subcategory Description'] || '',
          jobs: [],
          category_id: category.id
        };
        
        subcategoriesMap.set(subcategoryKey, subcategory);
        category.subcategories.push(subcategory);
      }
      
      const subcategory = subcategoriesMap.get(subcategoryKey)!;
      
      // Create job
      const estimatedTime = parseNumber(row['Estimated Time'] || row['Estimated Time (minutes)'] || row.Time || row.Duration);
      const price = parseNumber(row.Price || row.Cost || row.price || row.cost);
      
      const job: ServiceJob = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: jobName.trim(),
        description: row.Description || row.description || '',
        estimatedTime: estimatedTime,
        price: price,
        subcategory_id: subcategory.id
      };
      
      subcategory.jobs.push(job);
      
    } catch (error) {
      console.error(`Error processing row ${index + 1}:`, error, row);
    }
  });
  
  const categories = Array.from(categoriesMap.values());
  
  const stats = {
    totalCategories: categories.length,
    totalSubcategories: categories.reduce((sum, cat) => sum + cat.subcategories.length, 0),
    totalJobs: categories.reduce((sum, cat) => 
      sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0
    )
  };
  
  console.log('📈 Processing complete:', stats);
  
  return {
    categories,
    duplicates: [], // TODO: Implement duplicate detection
    stats
  };
};

const parseNumber = (value: any): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? undefined : num;
};
