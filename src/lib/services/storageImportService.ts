
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
}

export class StorageImportService {
  static async downloadFile(bucketName: string, fileName: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileName);
    
    if (error) throw error;
    return data;
  }

  static async parseCSV(blob: Blob): Promise<any[]> {
    const text = await blob.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }
    
    return data;
  }

  static async batchInsert(
    data: ServiceMainCategory[], 
    onProgress: (progress: ImportProgress) => void
  ): Promise<void> {
    const batchSize = 100;
    let processed = 0;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      onProgress({
        stage: 'inserting',
        progress: (processed / data.length) * 100,
        message: `Inserting batch ${Math.floor(i / batchSize) + 1}...`
      });
      
      // Process batch (implement actual database insertion logic here)
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing
      
      processed += batch.length;
    }
  }
}

export const importFromStorage = async (
  bucketName: string,
  fileName: string,
  onProgress: (progress: ImportProgress) => void
): Promise<ServiceMainCategory[]> => {
  try {
    onProgress({
      stage: 'downloading',
      progress: 0,
      message: 'Downloading file from storage...'
    });

    const blob = await StorageImportService.downloadFile(bucketName, fileName);
    
    onProgress({
      stage: 'parsing',
      progress: 50,
      message: 'Parsing file content...'
    });

    const rawData = await StorageImportService.parseCSV(blob);
    
    // Convert raw data to ServiceMainCategory structure
    // This is a simplified conversion - you might need to adjust based on your CSV structure
    const categories: ServiceMainCategory[] = rawData.map((row, index) => ({
      id: row.id || `category-${index}`,
      name: row.name || '',
      description: row.description || '',
      subcategories: [],
      position: parseInt(row.position) || index
    }));

    onProgress({
      stage: 'complete',
      progress: 100,
      message: 'Import completed successfully'
    });

    return categories;
  } catch (error) {
    console.error('Storage import failed:', error);
    throw error;
  }
};
