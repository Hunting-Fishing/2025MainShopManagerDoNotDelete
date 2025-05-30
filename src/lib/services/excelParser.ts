
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
  
  if (workbook.SheetNames.length === 0) {
    return { categories: [], errors: ['No sheets found in Excel file'] };
  }
  
  // Process each sheet as a category
  workbook.SheetNames.forEach((sheetName, sheetIndex) => {
    try {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as string[][];
      
      if (jsonData.length < 2) {
        errors.push(`Sheet "${sheetName}": Must contain at least 2 rows (headers and data)`);
        return;
      }
      
      // First row contains subcategory headers starting from column B (index 1)
      const headerRow = jsonData[0];
      const subcategoryHeaders = headerRow.slice(1).filter(header => header && header.trim() !== '');
      
      if (subcategoryHeaders.length === 0) {
        errors.push(`Sheet "${sheetName}": No subcategory headers found in row 1 starting from column B`);
        return;
      }
      
      // Create category
      const category: ServiceMainCategory = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: sheetName.trim(),
        description: `Services for ${sheetName}`,
        subcategories: [],
        position: sheetIndex + 1
      };
      
      // Create subcategories
      const subcategoriesMap = new Map<number, ServiceSubcategory>();
      subcategoryHeaders.forEach((header, index) => {
        const subcategory: ServiceSubcategory = {
          id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
          name: header.trim(),
          description: `${header} services`,
          jobs: []
        };
        subcategoriesMap.set(index + 1, subcategory); // +1 because we skip column A
        category.subcategories.push(subcategory);
      });
      
      // Process data rows (starting from row 2)
      for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
        const row = jsonData[rowIndex];
        
        // Skip empty rows
        if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
          continue;
        }
        
        // Process each column starting from column B
        for (let colIndex = 1; colIndex < row.length && colIndex <= subcategoryHeaders.length; colIndex++) {
          const cellValue = row[colIndex];
          
          if (cellValue && cellValue.toString().trim() !== '') {
            const subcategory = subcategoriesMap.get(colIndex);
            if (subcategory) {
              // Parse the cell value - it might contain service name, price, and time
              const serviceData = parseServiceCell(cellValue.toString());
              
              const job: ServiceJob = {
                id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${rowIndex}-${colIndex}`,
                name: serviceData.name,
                description: serviceData.description,
                price: serviceData.price,
                estimatedTime: serviceData.estimatedTime
              };
              
              subcategory.jobs.push(job);
            }
          }
        }
      }
      
      // Only add category if it has subcategories with jobs
      const hasJobs = category.subcategories.some(sub => sub.jobs.length > 0);
      if (hasJobs) {
        categories.push(category);
      } else {
        errors.push(`Sheet "${sheetName}": No services found in any subcategory`);
      }
      
    } catch (error) {
      errors.push(`Sheet "${sheetName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  return { categories, errors };
};

const parseServiceCell = (cellValue: string): {
  name: string;
  description?: string;
  price?: number;
  estimatedTime?: number;
} => {
  const trimmed = cellValue.trim();
  
  // Try to parse format like "Service Name | $50 | 60min"
  const parts = trimmed.split('|').map(part => part.trim());
  
  if (parts.length === 1) {
    // Just service name
    return { name: parts[0] };
  }
  
  const result: any = { name: parts[0] };
  
  // Look for price and time in remaining parts
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    
    // Check for price (starts with $ or contains price keywords)
    const priceMatch = part.match(/\$?(\d+(?:\.\d{2})?)/);
    if (priceMatch && (part.includes('$') || part.toLowerCase().includes('price'))) {
      result.price = parseFloat(priceMatch[1]);
      continue;
    }
    
    // Check for time (contains min, hour, etc.)
    const timeMatch = part.match(/(\d+)(?:\s*(?:min|minutes?|hr|hours?|h))?/i);
    if (timeMatch && (part.toLowerCase().includes('min') || part.toLowerCase().includes('hour') || part.toLowerCase().includes('time'))) {
      let minutes = parseInt(timeMatch[1]);
      if (part.toLowerCase().includes('hour') || part.toLowerCase().includes('hr')) {
        minutes *= 60;
      }
      result.estimatedTime = minutes;
      continue;
    }
    
    // If not price or time, treat as description
    if (!result.description) {
      result.description = part;
    }
  }
  
  return result;
};

export const generateExcelTemplate = (): Blob => {
  const workbook = XLSX.utils.book_new();
  
  // Create sample categories as separate sheets
  const sampleCategories = [
    {
      name: 'Oil Change & Maintenance',
      subcategories: ['Oil Changes', 'Filter Services', 'Fluid Checks'],
      services: [
        ['Standard Oil Change | $35 | 30min', 'Air Filter Replacement | $25 | 15min', 'Brake Fluid Check | $15 | 10min'],
        ['Synthetic Oil Change | $65 | 30min', 'Cabin Filter Replacement | $30 | 20min', 'Coolant Level Check | $10 | 5min'],
        ['High Mileage Oil Change | $45 | 30min', 'Fuel Filter Replacement | $65 | 45min', 'Power Steering Fluid | $20 | 10min']
      ]
    },
    {
      name: 'Brakes',
      subcategories: ['Brake Pads', 'Brake Rotors', 'Brake Fluid'],
      services: [
        ['Front Brake Pad Replacement | $150 | 90min', 'Front Rotor Resurfacing | $80 | 60min', 'Brake Fluid Flush | $90 | 45min'],
        ['Rear Brake Pad Replacement | $140 | 90min', 'Rear Rotor Replacement | $200 | 120min', 'Brake Fluid Top-off | $15 | 10min'],
        ['Performance Brake Pads | $250 | 120min', 'Performance Rotors | $400 | 150min', 'DOT 4 Brake Fluid | $120 | 60min']
      ]
    },
    {
      name: 'Tires',
      subcategories: ['Tire Installation', 'Tire Repair', 'Wheel Services'],
      services: [
        ['Tire Mount & Balance | $80 | 60min', 'Tire Patch | $25 | 20min', 'Wheel Alignment | $100 | 90min'],
        ['Tire Rotation | $25 | 30min', 'Tire Plug | $20 | 15min', 'Wheel Balancing | $50 | 45min'],
        ['Tire Replacement | $150 | 45min', 'Sidewall Repair | $35 | 30min', 'Rim Repair | $75 | 60min']
      ]
    }
  ];
  
  sampleCategories.forEach(category => {
    // Create sheet data
    const sheetData: any[][] = [];
    
    // Header row with subcategories (starting from column B)
    const headerRow = ['Service Name', ...category.subcategories];
    sheetData.push(headerRow);
    
    // Data rows
    const maxRows = Math.max(...category.services.map(serviceCol => serviceCol.length));
    for (let rowIndex = 0; rowIndex < maxRows; rowIndex++) {
      const dataRow = [''];
      category.services.forEach(serviceCol => {
        dataRow.push(serviceCol[rowIndex] || '');
      });
      sheetData.push(dataRow);
    }
    
    // Create worksheet and add to workbook
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    
    // Set column widths
    worksheet['!cols'] = [
      { width: 20 }, // Column A
      { width: 30 }, // Column B
      { width: 30 }, // Column C
      { width: 30 }  // Column D
    ];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, category.name);
  });
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};
