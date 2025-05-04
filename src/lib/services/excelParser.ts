
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { v4 as uuidv4 } from 'uuid';

interface RawServiceData {
  category: string;
  subcategory: string;
  service: string;
  price?: number | string;
  time?: number | string;
  description?: string;
}

/**
 * Parse Excel data (as JSON) into the service hierarchy structure
 */
export const parseExcelData = (data: any[]): ServiceMainCategory[] => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error('Invalid data format for parsing');
    return [];
  }

  // Collect all raw data rows
  const rawServices: RawServiceData[] = data.map(row => ({
    category: String(row.category || row.Category || '').trim(),
    subcategory: String(row.subcategory || row.Subcategory || '').trim(),
    service: String(row.service || row.Service || row.name || row.Name || '').trim(),
    price: row.price || row.Price || 0,
    time: row.time || row.Time || row.estimatedTime || row.EstimatedTime || 0,
    description: row.description || row.Description || ''
  })).filter(row => row.category && row.subcategory && row.service);

  // Create a map to track categories and subcategories
  const categories: Record<string, ServiceMainCategory> = {};

  // Process each row
  rawServices.forEach((row, index) => {
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
