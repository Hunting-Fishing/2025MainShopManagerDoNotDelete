
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
  console.log('📋 Starting Excel file parsing:', file.name, file.size, 'bytes');
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const sheetName = workbook.SheetNames[0];
        console.log('📊 Available sheets:', workbook.SheetNames);
        console.log('📄 Using sheet:', sheetName);
        
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with header row
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          raw: false
        });
        
        console.log('📊 Raw sheet data (first 5 rows):', jsonData.slice(0, 5));
        
        // Process the raw data to handle headers properly
        const processedData = processRawExcelData(jsonData);
        console.log('🔄 Processed Excel data:', processedData);
        
        const parsedData = processExcelData(processedData);
        console.log('✅ Final parsed data:', parsedData);
        
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

const processRawExcelData = (rawData: any[][]): ExcelRow[] => {
  if (rawData.length === 0) {
    console.warn('⚠️ Empty Excel data');
    return [];
  }
  
  // Find the header row (first non-empty row)
  let headerRowIndex = 0;
  for (let i = 0; i < rawData.length; i++) {
    if (rawData[i] && rawData[i].some(cell => cell && cell.toString().trim())) {
      headerRowIndex = i;
      break;
    }
  }
  
  const headers = rawData[headerRowIndex] || [];
  console.log('📋 Found headers at row', headerRowIndex + 1, ':', headers);
  
  // Clean and normalize headers
  const cleanHeaders = headers.map((header: any) => {
    if (!header) return '';
    return header.toString().trim().toLowerCase();
  });
  
  console.log('🧹 Cleaned headers:', cleanHeaders);
  
  // Process data rows
  const processedRows: ExcelRow[] = [];
  
  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row || !row.some(cell => cell && cell.toString().trim())) {
      continue; // Skip empty rows
    }
    
    const processedRow: ExcelRow = {};
    
    for (let j = 0; j < Math.max(headers.length, row.length); j++) {
      const header = cleanHeaders[j] || `column_${j}`;
      const value = row[j];
      
      if (value !== undefined && value !== null && value !== '') {
        processedRow[header] = value.toString().trim();
      }
    }
    
    console.log(`📝 Processed row ${i + 1}:`, processedRow);
    processedRows.push(processedRow);
  }
  
  console.log(`✅ Processed ${processedRows.length} data rows from Excel`);
  return processedRows;
};

const processExcelData = (rows: ExcelRow[]): ParsedExcelData => {
  console.log('🔄 Processing', rows.length, 'rows into service hierarchy');
  
  const categoriesMap = new Map<string, ServiceMainCategory>();
  const subcategoriesMap = new Map<string, ServiceSubcategory>();
  
  rows.forEach((row, index) => {
    try {
      // Try multiple possible column names for each field
      const categoryName = findColumnValue(row, [
        'category', 'categories', 'service category', 'main category', 'cat'
      ]);
      
      const subcategoryName = findColumnValue(row, [
        'subcategory', 'subcategories', 'sub category', 'service subcategory', 'subcat'
      ]);
      
      const jobName = findColumnValue(row, [
        'service', 'job', 'service name', 'job name', 'task', 'work', 'description'
      ]);
      
      console.log(`🔍 Row ${index + 1} extracted:`, {
        category: categoryName,
        subcategory: subcategoryName,
        job: jobName,
        rawRow: row
      });
      
      if (!categoryName) {
        console.warn(`⚠️ Row ${index + 1}: No category found`, row);
        return;
      }
      
      if (!subcategoryName) {
        console.warn(`⚠️ Row ${index + 1}: No subcategory found`, row);
        return;
      }
      
      if (!jobName) {
        console.warn(`⚠️ Row ${index + 1}: No job/service name found`, row);
        return;
      }
      
      // Create or get category
      const categoryKey = categoryName.trim();
      if (!categoriesMap.has(categoryKey)) {
        const newCategory: ServiceMainCategory = {
          id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: categoryKey,
          description: findColumnValue(row, ['category description', 'cat description']) || '',
          subcategories: [],
          position: categoriesMap.size + 1
        };
        
        categoriesMap.set(categoryKey, newCategory);
        console.log('➕ Created category:', newCategory.name);
      }
      
      const category = categoriesMap.get(categoryKey)!;
      
      // Create or get subcategory
      const subcategoryKey = `${categoryKey}_${subcategoryName.trim()}`;
      if (!subcategoriesMap.has(subcategoryKey)) {
        const subcategory: ServiceSubcategory = {
          id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: subcategoryName.trim(),
          description: findColumnValue(row, ['subcategory description', 'subcat description']) || '',
          jobs: [],
          category_id: category.id
        };
        
        subcategoriesMap.set(subcategoryKey, subcategory);
        category.subcategories.push(subcategory);
        console.log('➕ Created subcategory:', subcategory.name, 'in', category.name);
      }
      
      const subcategory = subcategoriesMap.get(subcategoryKey)!;
      
      // Extract pricing and time information
      const estimatedTime = parseNumber(findColumnValue(row, [
        'estimated time', 'time', 'duration', 'hours', 'minutes', 'est time'
      ]));
      
      const price = parseNumber(findColumnValue(row, [
        'price', 'cost', 'amount', 'rate', 'fee', 'charge'
      ]));
      
      // Create job
      const job: ServiceJob = {
        id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: jobName.trim(),
        description: findColumnValue(row, ['job description', 'service description', 'details']) || '',
        estimatedTime: estimatedTime,
        price: price,
        subcategory_id: subcategory.id
      };
      
      subcategory.jobs.push(job);
      console.log('➕ Created job:', job.name, 'in', subcategory.name);
      
    } catch (error) {
      console.error(`❌ Error processing row ${index + 1}:`, error, row);
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
  console.log('📋 Categories created:', categories.map(c => c.name));
  
  return {
    categories,
    duplicates: [], // TODO: Implement duplicate detection
    stats
  };
};

// Helper function to find a value in a row using multiple possible column names
const findColumnValue = (row: ExcelRow, possibleNames: string[]): string | undefined => {
  for (const name of possibleNames) {
    // Check exact match
    if (row[name] && row[name].toString().trim()) {
      return row[name].toString().trim();
    }
    
    // Check case-insensitive match
    const keys = Object.keys(row);
    const matchingKey = keys.find(key => 
      key.toLowerCase() === name.toLowerCase()
    );
    
    if (matchingKey && row[matchingKey] && row[matchingKey].toString().trim()) {
      return row[matchingKey].toString().trim();
    }
    
    // Check partial match (contains)
    const partialMatch = keys.find(key => 
      key.toLowerCase().includes(name.toLowerCase()) || 
      name.toLowerCase().includes(key.toLowerCase())
    );
    
    if (partialMatch && row[partialMatch] && row[partialMatch].toString().trim()) {
      return row[partialMatch].toString().trim();
    }
  }
  
  return undefined;
};

const parseNumber = (value: any): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  
  const stringValue = value.toString().replace(/[^0-9.-]/g, '');
  const num = parseFloat(stringValue);
  return isNaN(num) ? undefined : num;
};
