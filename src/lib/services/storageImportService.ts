
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import * as XLSX from 'xlsx';

interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
}

export class StorageImportService {
  static async downloadFile(bucketName: string, fileName: string): Promise<Blob> {
    console.log(`Downloading file: ${fileName} from bucket: ${bucketName}`);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(fileName);
    
    if (error) {
      console.error('Download error:', error);
      throw error;
    }
    
    console.log('File downloaded successfully, size:', data.size);
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

  static async parseExcel(blob: Blob): Promise<any[]> {
    console.log('Parsing Excel file...');
    
    const arrayBuffer = await blob.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get the first worksheet
    const worksheetName = workbook.SheetNames[0];
    if (!worksheetName) {
      throw new Error('Excel file contains no worksheets');
    }
    
    console.log(`Reading worksheet: ${worksheetName}`);
    const worksheet = workbook.Sheets[worksheetName];
    
    // Convert worksheet to JSON with headers
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: ''
    });
    
    if (data.length === 0) return [];
    
    // Get headers from first row and convert to objects
    const headers = data[0] as string[];
    const rows = data.slice(1) as any[][];
    
    console.log('Excel headers:', headers);
    console.log('Excel data rows:', rows.length);
    
    // Convert to object format
    const result = rows
      .filter(row => row && row.some(cell => cell !== '')) // Filter out empty rows
      .map((row, index) => {
        const obj: any = {};
        headers.forEach((header, colIndex) => {
          const value = row[colIndex];
          obj[header] = value !== undefined ? String(value).trim() : '';
        });
        
        console.log(`Row ${index + 1}:`, obj);
        return obj;
      });
    
    console.log(`Parsed ${result.length} valid rows from Excel`);
    return result;
  }

  static async parseJSON(blob: Blob): Promise<any[]> {
    const text = await blob.text();
    const data = JSON.parse(text);
    
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      // If it's a single object, wrap it in an array
      return [data];
    }
    
    throw new Error('Invalid JSON format: expected array or object');
  }

  static async parseFile(blob: Blob, fileName: string): Promise<any[]> {
    console.log(`Parsing file: ${fileName}, size: ${blob.size} bytes`);
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    console.log(`File extension: ${extension}`);
    
    switch (extension) {
      case 'csv':
        return this.parseCSV(blob);
      case 'json':
        return this.parseJSON(blob);
      case 'xlsx':
      case 'xls':
        return this.parseExcel(blob);
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }
}

export const importFromStorage = async (
  bucketName: string,
  fileName: string,
  onProgress: (progress: ImportProgress) => void
): Promise<any[]> => {
  try {
    console.log(`Starting import from storage: ${bucketName}/${fileName}`);
    
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

    const rawData = await StorageImportService.parseFile(blob, fileName);
    console.log(`Parsed ${rawData.length} rows from file`);
    
    if (rawData.length === 0) {
      throw new Error('No data found in the file');
    }

    onProgress({
      stage: 'processing',
      progress: 75,
      message: 'Processing data...'
    });

    // Log the structure of the first few rows to help with debugging
    console.log('Sample of parsed data:');
    rawData.slice(0, 3).forEach((row, index) => {
      console.log(`Row ${index + 1}:`, row);
    });

    onProgress({
      stage: 'complete',
      progress: 100,
      message: `Successfully parsed ${rawData.length} rows`
    });

    console.log(`Storage import completed: ${rawData.length} rows`);
    return rawData;
  } catch (error) {
    console.error('Storage import failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Import failed');
  }
};
