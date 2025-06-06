
import { supabase } from '@/integrations/supabase/client';
import { bucketViewerService } from './bucketViewerService';
import type { 
  ImportProgress, 
  ImportResult, 
  ImportStats, 
  ProcessedServiceData 
} from './types';
import * as XLSX from 'xlsx';

interface ExcelServiceData {
  sector: string;
  category: string;
  subcategory: string;
  service: string;
  description?: string;
  estimatedTime?: number;
  price?: number;
}

export async function processExcelFileFromStorage(
  filePath: string,
  progressCallback?: (progress: ImportProgress) => void
): Promise<ProcessedServiceData> {
  try {
    progressCallback?.({
      stage: 'downloading',
      message: `Downloading file: ${filePath}`,
      progress: 10,
      completed: false,
      error: null
    });

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('service-data')
      .download(filePath);

    if (downloadError) throw downloadError;
    if (!fileData) throw new Error('No file data received');

    progressCallback?.({
      stage: 'parsing',
      message: `Parsing Excel file: ${filePath}`,
      progress: 30,
      completed: false,
      error: null
    });

    const arrayBuffer = await fileData.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const servicesData: ExcelServiceData[] = [];
    
    // Process each worksheet in the workbook
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Skip if no data
      if (jsonData.length <= 1) return;
      
      // Get headers from first row
      const headers = jsonData[0] as string[];
      
      // Process each data row
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];
        if (!row || row.length === 0) continue;
        
        const serviceData: ExcelServiceData = {
          sector: '',
          category: '',
          subcategory: '',
          service: ''
        };
        
        // Map columns to our data structure
        headers.forEach((header, index) => {
          const value = row[index];
          if (!value) return;
          
          const headerLower = header.toLowerCase().trim();
          
          if (headerLower.includes('sector') || headerLower.includes('industry')) {
            serviceData.sector = String(value).trim();
          } else if (headerLower.includes('category') || headerLower.includes('main')) {
            serviceData.category = String(value).trim();
          } else if (headerLower.includes('subcategory') || headerLower.includes('sub')) {
            serviceData.subcategory = String(value).trim();
          } else if (headerLower.includes('service') || headerLower.includes('job') || headerLower.includes('task')) {
            serviceData.service = String(value).trim();
          } else if (headerLower.includes('description') || headerLower.includes('detail')) {
            serviceData.description = String(value).trim();
          } else if (headerLower.includes('time') || headerLower.includes('hour') || headerLower.includes('duration')) {
            serviceData.estimatedTime = Number(value) || undefined;
          } else if (headerLower.includes('price') || headerLower.includes('cost') || headerLower.includes('rate')) {
            serviceData.price = Number(value) || undefined;
          }
        });
        
        // Only add if we have required fields
        if (serviceData.sector && serviceData.category && serviceData.subcategory && serviceData.service) {
          servicesData.push(serviceData);
        }
      }
    });

    progressCallback?.({
      stage: 'processing',
      message: `Processed ${servicesData.length} services from ${filePath}`,
      progress: 80,
      completed: false,
      error: null
    });

    // Group and count the data
    const sectors = new Set();
    const categories = new Set();
    const subcategories = new Set();
    
    servicesData.forEach(item => {
      sectors.add(item.sector);
      categories.add(`${item.sector}|${item.category}`);
      subcategories.add(`${item.sector}|${item.category}|${item.subcategory}`);
    });

    const stats: ImportStats = {
      totalSectors: sectors.size,
      totalCategories: categories.size,
      totalSubcategories: subcategories.size,
      totalServices: servicesData.length,
      filesProcessed: 1
    };

    progressCallback?.({
      stage: 'complete',
      message: `Successfully processed ${servicesData.length} services from ${filePath}`,
      progress: 100,
      completed: true,
      error: null
    });

    return {
      sectors: [{ name: filePath, services: servicesData }],
      stats
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    progressCallback?.({
      stage: 'error',
      message: errorMessage,
      progress: 0,
      completed: false,
      error: errorMessage
    });
    throw error;
  }
}

async function insertSectorData(sectorData: ExcelServiceData[]): Promise<void> {
  // Group data by sector -> category -> subcategory
  const hierarchy = new Map<string, Map<string, Map<string, ExcelServiceData[]>>>();
  
  sectorData.forEach(item => {
    if (!hierarchy.has(item.sector)) {
      hierarchy.set(item.sector, new Map());
    }
    const sectorMap = hierarchy.get(item.sector)!;
    
    if (!sectorMap.has(item.category)) {
      sectorMap.set(item.category, new Map());
    }
    const categoryMap = sectorMap.get(item.category)!;
    
    if (!categoryMap.has(item.subcategory)) {
      categoryMap.set(item.subcategory, []);
    }
    categoryMap.get(item.subcategory)!.push(item);
  });

  // Insert sectors
  for (const [sectorName] of hierarchy) {
    const { data: existingSector } = await supabase
      .from('service_sectors')
      .select('id')
      .eq('name', sectorName)
      .single();

    let sectorId;
    if (!existingSector) {
      const { data: newSector, error } = await supabase
        .from('service_sectors')
        .insert({ name: sectorName })
        .select('id')
        .single();
      
      if (error) throw error;
      sectorId = newSector.id;
    } else {
      sectorId = existingSector.id;
    }

    // Insert categories for this sector
    const categoryMap = hierarchy.get(sectorName)!;
    for (const [categoryName] of categoryMap) {
      const { data: existingCategory } = await supabase
        .from('service_categories')
        .select('id')
        .eq('name', categoryName)
        .eq('sector_id', sectorId)
        .single();

      let categoryId;
      if (!existingCategory) {
        const { data: newCategory, error } = await supabase
          .from('service_categories')
          .insert({ name: categoryName, sector_id: sectorId })
          .select('id')
          .single();
        
        if (error) throw error;
        categoryId = newCategory.id;
      } else {
        categoryId = existingCategory.id;
      }

      // Insert subcategories for this category
      const subcategoryMap = categoryMap.get(categoryName)!;
      for (const [subcategoryName, services] of subcategoryMap) {
        const { data: existingSubcategory } = await supabase
          .from('service_subcategories')
          .select('id')
          .eq('name', subcategoryName)
          .eq('category_id', categoryId)
          .single();

        let subcategoryId;
        if (!existingSubcategory) {
          const { data: newSubcategory, error } = await supabase
            .from('service_subcategories')
            .insert({ name: subcategoryName, category_id: categoryId })
            .select('id')
            .single();
          
          if (error) throw error;
          subcategoryId = newSubcategory.id;
        } else {
          subcategoryId = existingSubcategory.id;
        }

        // Insert jobs for this subcategory
        for (const service of services) {
          const { data: existingJob } = await supabase
            .from('service_jobs')
            .select('id')
            .eq('name', service.service)
            .eq('subcategory_id', subcategoryId)
            .single();

          if (!existingJob) {
            const { error } = await supabase
              .from('service_jobs')
              .insert({
                name: service.service,
                subcategory_id: subcategoryId,
                description: service.description,
                estimated_time: service.estimatedTime,
                price: service.price
              });
            
            if (error) throw error;
          }
        }
      }
    }
  }
}

export async function importServicesFromStorage(
  progressCallback?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  try {
    progressCallback?.({
      stage: 'scanning',
      message: 'Scanning storage for service files...',
      progress: 5,
      completed: false,
      error: null
    });

    const allSectorFiles = await bucketViewerService.getAllSectorFiles();
    
    if (allSectorFiles.length === 0) {
      throw new Error('No sector files found in storage');
    }

    progressCallback?.({
      stage: 'processing',
      message: `Found ${allSectorFiles.length} sectors with files`,
      progress: 10,
      completed: false,
      error: null
    });

    let totalStats: ImportStats = {
      totalSectors: 0,
      totalCategories: 0,
      totalSubcategories: 0,
      totalServices: 0,
      filesProcessed: 0
    };

    const allServicesData: ExcelServiceData[] = [];

    // Process each sector's files
    let fileIndex = 0;
    const totalFiles = allSectorFiles.reduce((sum, sector) => sum + sector.excelFiles.length, 0);

    for (const sectorFile of allSectorFiles) {
      progressCallback?.({
        stage: 'processing',
        message: `Processing sector: ${sectorFile.sectorName}`,
        progress: 10 + (fileIndex / totalFiles) * 60,
        completed: false,
        error: null
      });

      // Process each Excel file in the sector
      for (const file of sectorFile.excelFiles) {
        const result = await processExcelFileFromStorage(file.path);
        
        // Extract services data from the result
        result.sectors.forEach(sector => {
          if (Array.isArray(sector.services)) {
            allServicesData.push(...sector.services);
          }
        });
        
        totalStats.filesProcessed += 1;
        fileIndex += 1;
      }
    }

    progressCallback?.({
      stage: 'inserting',
      message: `Inserting ${allServicesData.length} services into database...`,
      progress: 70,
      completed: false,
      error: null
    });

    // Insert all collected data into the database
    if (allServicesData.length > 0) {
      await insertSectorData(allServicesData);
    }

    // Count final statistics
    const { data: sectorsCount } = await supabase
      .from('service_sectors')
      .select('id', { count: 'exact' });
    
    const { data: categoriesCount } = await supabase
      .from('service_categories')
      .select('id', { count: 'exact' });
    
    const { data: subcategoriesCount } = await supabase
      .from('service_subcategories')
      .select('id', { count: 'exact' });
    
    const { data: servicesCount } = await supabase
      .from('service_jobs')
      .select('id', { count: 'exact' });

    totalStats = {
      totalSectors: sectorsCount?.length || 0,
      totalCategories: categoriesCount?.length || 0,
      totalSubcategories: subcategoriesCount?.length || 0,
      totalServices: servicesCount?.length || 0,
      filesProcessed: totalStats.filesProcessed
    };

    progressCallback?.({
      stage: 'complete',
      message: 'Service import completed successfully!',
      progress: 100,
      completed: true,
      error: null
    });

    return {
      success: true,
      message: `Successfully imported ${totalStats.totalServices} services from ${totalStats.filesProcessed} files`,
      stats: totalStats
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Import failed';
    progressCallback?.({
      stage: 'error',
      message: errorMessage,
      progress: 0,
      completed: false,
      error: errorMessage
    });
    
    return {
      success: false,
      message: errorMessage
    };
  }
}

export async function clearAllServiceData(): Promise<void> {
  console.log('Clearing all service data...');
  
  // Delete in reverse dependency order
  const { error: jobsError } = await supabase
    .from('service_jobs')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  
  if (jobsError) throw jobsError;

  const { error: subcategoriesError } = await supabase
    .from('service_subcategories')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  
  if (subcategoriesError) throw subcategoriesError;

  const { error: categoriesError } = await supabase
    .from('service_categories')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  
  if (categoriesError) throw categoriesError;

  const { error: sectorsError } = await supabase
    .from('service_sectors')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  
  if (sectorsError) throw sectorsError;
}

export async function getServiceCounts(): Promise<ImportStats> {
  const { data: sectorsCount } = await supabase
    .from('service_sectors')
    .select('id', { count: 'exact' });
  
  const { data: categoriesCount } = await supabase
    .from('service_categories')
    .select('id', { count: 'exact' });
  
  const { data: subcategoriesCount } = await supabase
    .from('service_subcategories')
    .select('id', { count: 'exact' });
  
  const { data: servicesCount } = await supabase
    .from('service_jobs')
    .select('id', { count: 'exact' });

  return {
    totalSectors: sectorsCount?.length || 0,
    totalCategories: categoriesCount?.length || 0,
    totalSubcategories: subcategoriesCount?.length || 0,
    totalServices: servicesCount?.length || 0,
    filesProcessed: 0
  };
}
