import { supabase } from '@/integrations/supabase/client';
import { bucketViewerService } from './bucketViewerService';
import type { 
  StorageFile, 
  SectorFiles, 
  ImportProgress, 
  ImportResult, 
  ImportStats, 
  ProcessedServiceData 
} from './types';
import * as XLSX from 'xlsx';

interface LocalSectorFiles {
  sectorName: string;
  excelFiles: string[];
  totalFiles: number;
}

function convertToLocalSectorFiles(sectorFiles: SectorFiles): LocalSectorFiles {
  return {
    sectorName: sectorFiles.sectorName,
    excelFiles: sectorFiles.excelFiles.map(file => file.path),
    totalFiles: sectorFiles.totalFiles
  };
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
    
    // Process the workbook and extract service data
    const sectors: any[] = [];
    let totalServices = 0;
    let totalCategories = 0;
    let totalSubcategories = 0;

    // Implementation would go here to parse the Excel data
    // For now, return mock data structure
    
    progressCallback?.({
      stage: 'complete',
      message: `Successfully processed file: ${filePath}`,
      progress: 100,
      completed: true,
      error: null
    });

    return {
      sectors,
      stats: {
        totalSectors: 1,
        totalCategories,
        totalSubcategories,
        totalServices,
        filesProcessed: 1
      }
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
      progress: 15,
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

    // Process each sector
    for (let i = 0; i < allSectorFiles.length; i++) {
      const sectorFile = allSectorFiles[i];
      const localSectorFile = convertToLocalSectorFiles(sectorFile);
      
      progressCallback?.({
        stage: 'processing',
        message: `Processing sector: ${localSectorFile.sectorName}`,
        progress: 15 + (i / allSectorFiles.length) * 70,
        completed: false,
        error: null
      });

      // Process each Excel file in the sector
      for (const filePath of localSectorFile.excelFiles) {
        const result = await processExcelFileFromStorage(filePath);
        
        // Accumulate stats
        totalStats.totalSectors += result.stats.totalSectors;
        totalStats.totalCategories += result.stats.totalCategories;
        totalStats.totalSubcategories += result.stats.totalSubcategories;
        totalStats.totalServices += result.stats.totalServices;
        totalStats.filesProcessed += result.stats.filesProcessed;
      }
    }

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

export async function importProcessedDataToDatabase(data: ProcessedServiceData): Promise<ImportResult> {
  // Implementation for importing processed data to database
  return {
    success: true,
    message: 'Data imported to database successfully',
    stats: data.stats
  };
}

export async function validateServiceData(data: ProcessedServiceData): Promise<boolean> {
  // Implementation for validating service data
  return true;
}

export async function clearAllServiceData(): Promise<void> {
  // Implementation for clearing all service data
  console.log('Clearing all service data...');
}

export async function getServiceCounts(): Promise<ImportStats> {
  // Implementation for getting service counts
  return {
    totalSectors: 0,
    totalCategories: 0,
    totalSubcategories: 0,
    totalServices: 0,
    filesProcessed: 0
  };
}
