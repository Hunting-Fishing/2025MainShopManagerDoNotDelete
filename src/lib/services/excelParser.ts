
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
  console.log('📋 Starting Excel file parsing...', file.name, file.size, 'bytes');
  
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
        
        // Get the range to understand the size of the data
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        console.log(`📏 Worksheet range: ${range.s.r} to ${range.e.r} rows, ${range.s.c} to ${range.e.c} columns`);
        console.log(`📊 Total rows in file: ${range.e.r + 1}`);
        
        // Convert to JSON with raw values to handle all data types properly
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1,
          defval: '',
          raw: false, // This ensures we get formatted string values
          range: 0 // Start from row 0 to include headers
        });
        
        console.log('📋 Raw data rows extracted:', jsonData.length);
        console.log('📋 First few rows:', jsonData.slice(0, 3));
        
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

const processWorksheetData = (rows: any[][]): ParsedExcelData => {
  console.log('🔄 Processing worksheet data with', rows.length, 'rows');
  
  if (rows.length === 0) {
    throw new Error('No data rows found in Excel file');
  }
  
  // Get headers from first row and normalize them
  const headers = rows[0].map((header: any) => 
    String(header || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '')
  );
  
  console.log('📋 Headers found:', headers);
  
  // Create flexible column mapping
  const getColumnIndex = (possibleNames: string[]): number => {
    for (const name of possibleNames) {
      const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const index = headers.findIndex(header => header.includes(normalizedName) || normalizedName.includes(header));
      if (index !== -1) return index;
    }
    return -1;
  };
  
  const categoryCol = getColumnIndex(['category', 'maincategory', 'servicecategory', 'type']);
  const subcategoryCol = getColumnIndex(['subcategory', 'subcat', 'service', 'subservice']);
  const jobCol = getColumnIndex(['job', 'service', 'task', 'work', 'description', 'name', 'title']);
  const descCol = getColumnIndex(['description', 'desc', 'details', 'notes']);
  const priceCol = getColumnIndex(['price', 'cost', 'amount', 'rate']);
  const timeCol = getColumnIndex(['time', 'hours', 'duration', 'estimated', 'estimatedtime']);
  
  console.log('📊 Column mapping:', {
    category: categoryCol,
    subcategory: subcategoryCol,
    job: jobCol,
    description: descCol,
    price: priceCol,
    time: timeCol
  });
  
  if (categoryCol === -1) {
    throw new Error('Could not find category column. Please ensure your Excel file has a column for categories.');
  }
  
  const categories = new Map<string, ServiceMainCategory>();
  let totalSubcategories = 0;
  let totalJobs = 0;
  let processedRows = 0;
  
  // Process all data rows (skip header row)
  const dataRows = rows.slice(1);
  console.log('📊 Processing', dataRows.length, 'data rows...');
  
  dataRows.forEach((row, index) => {
    try {
      const categoryName = cleanValue(row[categoryCol]);
      const subcategoryName = cleanValue(row[subcategoryCol] || '');
      const jobName = cleanValue(row[jobCol] || '');
      
      if (!categoryName) {
        // Skip empty rows
        return;
      }
      
      processedRows++;
      
      if (processedRows % 1000 === 0) {
        console.log(`📊 Processed ${processedRows} rows so far...`);
      }
      
      // Get or create category
      if (!categories.has(categoryName)) {
        categories.set(categoryName, {
          id: `cat-${categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
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
            id: `sub-${subcategoryName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${totalSubcategories}`,
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
            id: `job-${jobName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${totalJobs}`,
            name: jobName,
            description: cleanValue(row[descCol] || '') || '',
            price: parsePrice(row[priceCol]),
            estimatedTime: parseTime(row[timeCol])
          };
          
          subcategory.jobs.push(job);
          totalJobs++;
        }
      } else if (jobName) {
        // If we have a job but no subcategory, create a default subcategory
        let defaultSubcategory = category.subcategories.find(sub => sub.name === 'General');
        
        if (!defaultSubcategory) {
          defaultSubcategory = {
            id: `sub-general-${categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${totalSubcategories}`,
            name: 'General',
            description: '',
            jobs: []
          };
          category.subcategories.push(defaultSubcategory);
          totalSubcategories++;
        }
        
        const job: ServiceJob = {
          id: `job-${jobName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${totalJobs}`,
          name: jobName,
          description: cleanValue(row[descCol] || '') || '',
          price: parsePrice(row[priceCol]),
          estimatedTime: parseTime(row[timeCol])
        };
        
        defaultSubcategory.jobs.push(job);
        totalJobs++;
      }
    } catch (error) {
      console.error(`❌ Error processing row ${index + 2}:`, error, row);
    }
  });
  
  const categoriesArray = Array.from(categories.values());
  
  console.log('📈 Processing complete:', {
    totalRowsProcessed: processedRows,
    categories: categoriesArray.length,
    subcategories: totalSubcategories,
    jobs: totalJobs
  });
  
  if (totalJobs === 0) {
    console.warn('⚠️ No jobs were extracted from the Excel file. Please check the column headers and data format.');
  }
  
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
