
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';

interface RawServiceData {
  category: string;
  subcategory: string;
  service: string;
  price?: number | string;
  time?: number | string;
  description?: string;
}

/**
 * Parse Excel data into the service hierarchy structure
 */
export const parseExcelData = (excelFile: File): Promise<ServiceMainCategory[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        if (!e.target?.result) {
          reject(new Error("Failed to read file"));
          return;
        }
        
        // Parse the Excel file
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          reject(new Error("No data found in Excel file"));
          return;
        }
        
        // Process the data
        const categories = processExcelData(jsonData);
        resolve(categories);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
      reject(new Error("Failed to read file"));
    };
    
    // Read the file as an array buffer
    reader.readAsArrayBuffer(excelFile);
  });
};

/**
 * Process Excel JSON data into service hierarchy
 */
const processExcelData = (data: any[]): ServiceMainCategory[] => {
  // Collect all raw data rows
  const rawServices: RawServiceData[] = data.map(row => ({
    category: String(row.category || row.Category || '').trim(),
    subcategory: String(row.subcategory || row.Subcategory || '').trim(),
    service: String(row.service || row.Service || row.name || row.Name || '').trim(),
    price: row.price || row.Price || 0,
    time: row.time || row.Time || row.estimatedTime || row.EstimatedTime || 0,
    description: row.description || row.Description || ''
  })).filter(row => row.category && row.subcategory && row.service);

  if (rawServices.length === 0) {
    console.warn("No valid service data found in Excel file");
    return [];
  }

  // Create a map to track categories and subcategories
  const categories: Record<string, ServiceMainCategory> = {};

  // Process each row
  rawServices.forEach((row) => {
    // Normalize and parse values
    const price = typeof row.price === 'string' ? parseFloat(row.price) : (row.price || 0);
    const time = typeof row.time === 'string' ? parseFloat(row.time) : (row.time || 0);
    
    // Handle category
    if (!categories[row.category]) {
      categories[row.category] = {
        id: uuidv4(),
        name: row.category,
        description: '',
        position: Object.keys(categories).length,
        subcategories: []
      };
    }

    // Find or create subcategory
    let subcategory = categories[row.category].subcategories.find(
      sub => sub.name === row.subcategory
    );

    if (!subcategory) {
      subcategory = {
        id: uuidv4(),
        name: row.subcategory,
        description: '',
        jobs: []
      };
      categories[row.category].subcategories.push(subcategory);
    }

    // Add the service job
    subcategory.jobs.push({
      id: uuidv4(),
      name: row.service,
      description: row.description || '',
      price: isNaN(price) ? 0 : price,
      estimatedTime: isNaN(time) ? 0 : time
    });
  });

  // Convert the categories map to an array
  return Object.values(categories);
};

/**
 * Format service hierarchy data to Excel-compatible format
 */
export const formatToExcelData = (categories: ServiceMainCategory[]): any[] => {
  const result: any[] = [];

  categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      subcategory.jobs.forEach(job => {
        result.push({
          Category: category.name,
          Subcategory: subcategory.name,
          Service: job.name,
          Description: job.description || '',
          Price: job.price || 0,
          Time: job.estimatedTime || 0
        });
      });
    });
  });

  return result;
};

/**
 * Export service data to Excel file
 */
export const exportToExcel = (categories: ServiceMainCategory[], filename: string = 'services-export'): void => {
  const data = formatToExcelData(categories);
  
  // Create a worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Create a workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Services");
  
  // Generate Excel file and trigger download
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

// Add aliases for existing functions for backward compatibility
export const parseExcelFile = parseExcelData;
export const writeExcelFile = exportToExcel;
