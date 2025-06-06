
import { supabase } from '@/integrations/supabase/client';

// Define ImportProgress locally to avoid import issues
export interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
  error?: string;
  completed?: boolean;
}

export interface ServiceCounts {
  sectors: number;
  categories: number;
  subcategories: number;
  jobs: number;
}

export interface ProcessedServiceData {
  sectorName: string;
  categoryName: string;
  subcategoryName: string;
  jobName: string;
  description?: string;
  estimatedTime?: number;
  laborCost?: number;
  materialCost?: number;
  totalCost?: number;
}

// Extract sector name from file path (e.g., "Automotive/file.xlsx" -> "Automotive")
function extractSectorFromPath(filePath: string): string {
  const pathParts = filePath.split('/');
  return pathParts.length > 1 ? pathParts[0] : 'General';
}

// Process Excel data and convert to service records
export async function processServiceData(
  sheetsData: any[],
  filePath: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<ProcessedServiceData[]> {
  const results: ProcessedServiceData[] = [];
  const sectorName = extractSectorFromPath(filePath);
  
  console.log(`Processing service data for sector: ${sectorName}`);
  
  for (let sheetIndex = 0; sheetIndex < sheetsData.length; sheetIndex++) {
    const sheet = sheetsData[sheetIndex];
    const categoryName = sheet.sheetName || `Category ${sheetIndex + 1}`;
    
    if (onProgress) {
      onProgress({
        stage: 'processing',
        progress: 70 + (sheetIndex / sheetsData.length) * 20,
        message: `Processing category: ${categoryName}`
      });
    }
    
    // Process each row in the sheet
    for (let rowIndex = 1; rowIndex < sheet.data.length; rowIndex++) {
      const row = sheet.data[rowIndex];
      
      if (!row || row.length === 0) continue;
      
      // Flexible column detection
      const headers = sheet.data[0] || [];
      const subcategoryIndex = findColumnIndex(headers, ['subcategory', 'service_type', 'sub_category']);
      const jobIndex = findColumnIndex(headers, ['job', 'service', 'service_name', 'job_name']);
      const descriptionIndex = findColumnIndex(headers, ['description', 'desc', 'details']);
      const timeIndex = findColumnIndex(headers, ['time', 'estimated_time', 'duration']);
      const laborIndex = findColumnIndex(headers, ['labor', 'labor_cost', 'labour_cost']);
      const materialIndex = findColumnIndex(headers, ['material', 'material_cost', 'parts_cost']);
      const totalIndex = findColumnIndex(headers, ['total', 'total_cost', 'price']);
      
      const subcategoryName = row[subcategoryIndex] || 'General';
      const jobName = row[jobIndex] || `Service ${rowIndex}`;
      
      if (jobName && jobName.toString().trim()) {
        results.push({
          sectorName,
          categoryName,
          subcategoryName: subcategoryName.toString().trim(),
          jobName: jobName.toString().trim(),
          description: row[descriptionIndex]?.toString().trim() || '',
          estimatedTime: parseNumber(row[timeIndex]),
          laborCost: parseNumber(row[laborIndex]),
          materialCost: parseNumber(row[materialIndex]),
          totalCost: parseNumber(row[totalIndex])
        });
      }
    }
  }
  
  return results;
}

// Helper function to find column index by possible header names
function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(header => 
      header && header.toString().toLowerCase().includes(name.toLowerCase())
    );
    if (index !== -1) return index;
  }
  return 0; // Default to first column
}

// Helper function to safely parse numbers
function parseNumber(value: any): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const num = parseFloat(value.toString());
  return isNaN(num) ? undefined : num;
}

// Create service records in the database
export async function createServiceRecord(data: ProcessedServiceData): Promise<boolean> {
  try {
    console.log(`Creating service record: ${data.sectorName} > ${data.categoryName} > ${data.subcategoryName} > ${data.jobName}`);
    
    // 1. Find or create sector
    let { data: existingSector } = await supabase
      .from('service_sectors')
      .select('id')
      .eq('name', data.sectorName)
      .single();
    
    let sectorId: string;
    if (!existingSector) {
      const { data: newSector, error: sectorError } = await supabase
        .from('service_sectors')
        .insert({ name: data.sectorName, description: `${data.sectorName} services` })
        .select('id')
        .single();
      
      if (sectorError) throw sectorError;
      sectorId = newSector.id;
    } else {
      sectorId = existingSector.id;
    }
    
    // 2. Find or create category
    let { data: existingCategory } = await supabase
      .from('service_categories')
      .select('id')
      .eq('name', data.categoryName)
      .eq('sector_id', sectorId)
      .single();
    
    let categoryId: string;
    if (!existingCategory) {
      const { data: newCategory, error: categoryError } = await supabase
        .from('service_categories')
        .insert({ 
          name: data.categoryName, 
          sector_id: sectorId,
          description: `${data.categoryName} category`
        })
        .select('id')
        .single();
      
      if (categoryError) throw categoryError;
      categoryId = newCategory.id;
    } else {
      categoryId = existingCategory.id;
    }
    
    // 3. Find or create subcategory
    let { data: existingSubcategory } = await supabase
      .from('service_subcategories')
      .select('id')
      .eq('name', data.subcategoryName)
      .eq('category_id', categoryId)
      .single();
    
    let subcategoryId: string;
    if (!existingSubcategory) {
      const { data: newSubcategory, error: subcategoryError } = await supabase
        .from('service_subcategories')
        .insert({ 
          name: data.subcategoryName, 
          category_id: categoryId,
          description: `${data.subcategoryName} subcategory`
        })
        .select('id')
        .single();
      
      if (subcategoryError) throw subcategoryError;
      subcategoryId = newSubcategory.id;
    } else {
      subcategoryId = existingSubcategory.id;
    }
    
    // 4. Create job (always create new job records)
    const { error: jobError } = await supabase
      .from('service_jobs')
      .insert({
        name: data.jobName,
        subcategory_id: subcategoryId,
        description: data.description || '',
        estimated_time: data.estimatedTime || 0,
        labor_cost: data.laborCost || 0,
        material_cost: data.materialCost || 0,
        total_cost: data.totalCost || (data.laborCost || 0) + (data.materialCost || 0)
      });
    
    if (jobError) throw jobError;
    
    return true;
  } catch (error) {
    console.error('Error creating service record:', error);
    return false;
  }
}

// Import services from storage bucket file
export async function importServicesFromStorage(
  bucketName: string,
  filePath: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<{ success: boolean; imported: number; errors: string[] }> {
  const errors: string[] = [];
  let imported = 0;
  
  try {
    if (onProgress) {
      onProgress({
        stage: 'download',
        progress: 10,
        message: 'Downloading file from storage...'
      });
    }
    
    // Import the actual Excel processing logic from storageImportService
    const { importFromStorage } = await import('./storageImportService');
    const sheetsData = await importFromStorage(bucketName, filePath, onProgress);
    
    if (onProgress) {
      onProgress({
        stage: 'processing',
        progress: 70,
        message: 'Processing service data...'
      });
    }
    
    // Process the Excel data into service records
    const serviceData = await processServiceData(sheetsData, filePath, onProgress);
    
    if (onProgress) {
      onProgress({
        stage: 'saving',
        progress: 90,
        message: 'Saving services to database...'
      });
    }
    
    // Save each service record
    for (const data of serviceData) {
      const success = await createServiceRecord(data);
      if (success) {
        imported++;
      } else {
        errors.push(`Failed to import: ${data.jobName}`);
      }
    }
    
    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 100,
        message: `Import completed! ${imported} services imported.`,
        completed: true
      });
    }
    
    return { success: true, imported, errors };
    
  } catch (error) {
    console.error('Import failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    errors.push(errorMessage);
    
    if (onProgress) {
      onProgress({
        stage: 'error',
        progress: 0,
        message: errorMessage,
        error: errorMessage
      });
    }
    
    return { success: false, imported, errors };
  }
}

// Get service counts for analytics
export async function getServiceCounts(): Promise<ServiceCounts> {
  try {
    const [sectorsResult, categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
      supabase.from('service_sectors').select('id', { count: 'exact' }),
      supabase.from('service_categories').select('id', { count: 'exact' }),
      supabase.from('service_subcategories').select('id', { count: 'exact' }),
      supabase.from('service_jobs').select('id', { count: 'exact' })
    ]);
    
    return {
      sectors: sectorsResult.count || 0,
      categories: categoriesResult.count || 0,
      subcategories: subcategoriesResult.count || 0,
      jobs: jobsResult.count || 0
    };
  } catch (error) {
    console.error('Error getting service counts:', error);
    return { sectors: 0, categories: 0, subcategories: 0, jobs: 0 };
  }
}

// Clear all service data
export async function clearAllServiceData(): Promise<void> {
  try {
    // Delete in reverse order due to foreign key constraints
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('All service data cleared successfully');
  } catch (error) {
    console.error('Error clearing service data:', error);
    throw error;
  }
}
