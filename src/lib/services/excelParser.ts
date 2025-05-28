
import * as XLSX from 'xlsx';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export interface ParsedExcelData {
  categories: ServiceMainCategory[];
  errors: string[];
}

export const parseExcelFile = async (file: File): Promise<ParsedExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const result = parseWorkbook(workbook);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

const parseWorkbook = (workbook: XLSX.WorkBook): ParsedExcelData => {
  const categories: ServiceMainCategory[] = [];
  const errors: string[] = [];
  
  // Assume the first sheet contains the data
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { categories: [], errors: ['No sheets found in Excel file'] };
  }
  
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  
  if (jsonData.length < 2) {
    return { categories: [], errors: ['Excel file must contain headers and at least one row of data'] };
  }
  
  // Expected format: Category, Category Description, Subcategory, Subcategory Description, Service Name, Service Description, Price, Estimated Time
  const headers = jsonData[0];
  const expectedHeaders = ['Category', 'Category Description', 'Subcategory', 'Subcategory Description', 'Service Name', 'Service Description', 'Price', 'Estimated Time'];
  
  // Validate headers
  const headerMismatch = expectedHeaders.some((header, index) => 
    !headers[index] || headers[index].toLowerCase() !== header.toLowerCase()
  );
  
  if (headerMismatch) {
    errors.push(`Invalid headers. Expected: ${expectedHeaders.join(', ')}`);
    return { categories, errors };
  }
  
  const categoryMap = new Map<string, ServiceMainCategory>();
  
  // Process each row
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    
    if (!row || row.length < 8) {
      errors.push(`Row ${i + 1}: Insufficient data`);
      continue;
    }
    
    const [
      categoryName,
      categoryDescription,
      subcategoryName,
      subcategoryDescription,
      serviceName,
      serviceDescription,
      priceStr,
      estimatedTimeStr
    ] = row;
    
    if (!categoryName || !subcategoryName || !serviceName) {
      errors.push(`Row ${i + 1}: Missing required fields (Category, Subcategory, or Service Name)`);
      continue;
    }
    
    // Parse price and estimated time
    const price = priceStr ? parseFloat(priceStr.toString()) : undefined;
    const estimatedTime = estimatedTimeStr ? parseInt(estimatedTimeStr.toString()) : undefined;
    
    if (priceStr && isNaN(price!)) {
      errors.push(`Row ${i + 1}: Invalid price format`);
      continue;
    }
    
    if (estimatedTimeStr && isNaN(estimatedTime!)) {
      errors.push(`Row ${i + 1}: Invalid estimated time format`);
      continue;
    }
    
    // Get or create category
    let category = categoryMap.get(categoryName);
    if (!category) {
      category = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: categoryName,
        description: categoryDescription || undefined,
        subcategories: [],
        position: categoryMap.size + 1
      };
      categoryMap.set(categoryName, category);
    }
    
    // Get or create subcategory
    let subcategory = category.subcategories.find(sub => sub.name === subcategoryName);
    if (!subcategory) {
      subcategory = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: subcategoryName,
        description: subcategoryDescription || undefined,
        jobs: []
      };
      category.subcategories.push(subcategory);
    }
    
    // Create service/job
    const job: ServiceJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: serviceName,
      description: serviceDescription || undefined,
      price: price,
      estimatedTime: estimatedTime
    };
    
    subcategory.jobs.push(job);
  }
  
  return {
    categories: Array.from(categoryMap.values()),
    errors
  };
};

export const generateExcelTemplate = (): Blob => {
  const templateData = [
    ['Category', 'Category Description', 'Subcategory', 'Subcategory Description', 'Service Name', 'Service Description', 'Price', 'Estimated Time'],
    ['Oil Change & Maintenance', 'Regular maintenance services', 'Oil Changes', 'Various oil change services', 'Standard Oil Change', 'Regular oil change with conventional oil', '35', '30'],
    ['Oil Change & Maintenance', 'Regular maintenance services', 'Oil Changes', 'Various oil change services', 'Synthetic Oil Change', 'Premium synthetic oil change', '65', '30'],
    ['Brakes', 'Brake system services', 'Brake Pads', 'Brake pad replacement services', 'Front Brake Pad Replacement', 'Replace front brake pads', '150', '90']
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Service Categories');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};
