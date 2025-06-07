
export interface ExcelRowData {
  category: string;
  subcategory: string;
  serviceName: string;
  description: string;
  estimatedTime: number;
  price: number;
}

export interface MappedServiceData {
  sectorName: string; // From filename
  categories: {
    name: string;
    subcategories: {
      name: string;
      services: {
        name: string;
        description: string;
        estimatedTime: number;
        price: number;
      }[];
    }[];
  }[];
}

/**
 * Maps Excel data to correct service hierarchy
 * @param fileName - The Excel file name (becomes the main category)
 * @param rows - Raw Excel rows
 */
export function mapExcelToServiceHierarchy(fileName: string, rows: any[]): MappedServiceData {
  // Remove .xlsx extension from filename to get category name
  const mainCategoryName = fileName.replace(/\.xlsx?$/i, '').trim();
  
  // Group by what's currently labeled as "category" (which should be subcategory)
  const subcategoryGroups = new Map<string, any[]>();
  
  rows.forEach(row => {
    if (!row || typeof row !== 'object') return;
    
    // The first column in Excel (currently mapped as "category") should be subcategory
    const subcategoryName = row.category || row['AIR CONDITIONING SERVICES'] || '';
    
    if (subcategoryName && subcategoryName.trim()) {
      if (!subcategoryGroups.has(subcategoryName)) {
        subcategoryGroups.set(subcategoryName, []);
      }
      
      subcategoryGroups.get(subcategoryName)!.push({
        serviceName: row.subcategory || row['AIR CONDITIONING SERVICES.1'] || '',
        description: row.serviceName || row['ALIGNMENT SERVICES'] || '',
        estimatedTime: parseFloat(row.estimatedTime) || 0,
        price: parseFloat(row.price) || 0
      });
    }
  });
  
  // Convert to proper hierarchy
  const subcategories = Array.from(subcategoryGroups.entries()).map(([subcategoryName, services]) => ({
    name: subcategoryName,
    services: services
      .filter(service => service.serviceName && service.serviceName.trim())
      .map(service => ({
        name: service.serviceName,
        description: service.description || '',
        estimatedTime: service.estimatedTime || 0,
        price: service.price || 0
      }))
  })).filter(sub => sub.services.length > 0);
  
  return {
    sectorName: mainCategoryName,
    categories: [{
      name: mainCategoryName,
      subcategories
    }]
  };
}

/**
 * Processes multiple Excel files and creates sector-based hierarchy
 */
export function processMultipleExcelFiles(files: { fileName: string; data: any[] }[]): MappedServiceData[] {
  return files.map(file => mapExcelToServiceHierarchy(file.fileName, file.data));
}
