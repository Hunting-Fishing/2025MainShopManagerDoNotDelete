
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import * as XLSX from 'xlsx';

interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
}

interface ExcelSheetData {
  sheetName: string;
  data: any[];
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

  static async parseExcel(blob: Blob): Promise<ExcelSheetData[]> {
    console.log('Parsing Excel file with multi-sheet support...');
    
    const arrayBuffer = await blob.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    if (workbook.SheetNames.length === 0) {
      throw new Error('Excel file contains no worksheets');
    }
    
    console.log(`Found ${workbook.SheetNames.length} worksheets:`, workbook.SheetNames);
    
    const sheetsData: ExcelSheetData[] = [];
    
    for (const sheetName of workbook.SheetNames) {
      console.log(`Processing sheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert worksheet to JSON with headers
      const sheetData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: ''
      });
      
      if (sheetData.length === 0) {
        console.warn(`Sheet "${sheetName}" is empty, skipping...`);
        continue;
      }
      
      // Get headers from first row and convert to objects
      const headers = sheetData[0] as string[];
      const rows = sheetData.slice(1) as any[][];
      
      console.log(`Sheet "${sheetName}" headers:`, headers);
      console.log(`Sheet "${sheetName}" data rows:`, rows.length);
      
      // Convert to object format
      const processedData = rows
        .filter(row => row && row.some(cell => cell !== '')) // Filter out empty rows
        .map((row, index) => {
          const obj: any = {};
          headers.forEach((header, colIndex) => {
            const value = row[colIndex];
            obj[header] = value !== undefined ? String(value).trim() : '';
          });
          
          if (index < 3) { // Log first 3 rows for debugging
            console.log(`Sheet "${sheetName}" Row ${index + 1}:`, obj);
          }
          return obj;
        });
      
      sheetsData.push({
        sheetName,
        data: processedData
      });
      
      console.log(`Processed sheet "${sheetName}": ${processedData.length} valid rows`);
    }
    
    console.log(`Excel parsing completed: ${sheetsData.length} sheets processed`);
    return sheetsData;
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

  static async parseFile(blob: Blob, fileName: string): Promise<ExcelSheetData[] | any[]> {
    console.log(`Parsing file: ${fileName}, size: ${blob.size} bytes`);
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    console.log(`File extension: ${extension}`);
    
    switch (extension) {
      case 'csv':
        const csvData = await this.parseCSV(blob);
        return [{ sheetName: 'Sheet1', data: csvData }];
      case 'json':
        const jsonData = await this.parseJSON(blob);
        return [{ sheetName: 'Sheet1', data: jsonData }];
      case 'xlsx':
      case 'xls':
        return await this.parseExcel(blob);
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }
}

export const importFromStorage = async (
  bucketName: string,
  fileName: string,
  onProgress: (progress: ImportProgress) => void
): Promise<ExcelSheetData[] | any[]> => {
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

    const parsedData = await StorageImportService.parseFile(blob, fileName);
    
    let totalRows = 0;
    if (Array.isArray(parsedData) && parsedData.length > 0 && 'sheetName' in parsedData[0]) {
      // Multi-sheet data
      const sheetsData = parsedData as ExcelSheetData[];
      totalRows = sheetsData.reduce((acc, sheet) => acc + sheet.data.length, 0);
      console.log(`Parsed ${sheetsData.length} sheets with ${totalRows} total rows`);
    } else {
      // Single sheet/CSV/JSON data
      totalRows = (parsedData as any[]).length;
      console.log(`Parsed ${totalRows} rows from single data source`);
    }
    
    if (totalRows === 0) {
      throw new Error('No data found in the file');
    }

    onProgress({
      stage: 'processing',
      progress: 75,
      message: 'Processing data...'
    });

    // Log sample data for debugging
    if (Array.isArray(parsedData) && parsedData.length > 0 && 'sheetName' in parsedData[0]) {
      const sheetsData = parsedData as ExcelSheetData[];
      console.log('Sample of parsed sheets data:');
      sheetsData.slice(0, 2).forEach((sheet, index) => {
        console.log(`Sheet ${index + 1} (${sheet.sheetName}):`, sheet.data.slice(0, 2));
      });
    } else {
      console.log('Sample of parsed data:');
      (parsedData as any[]).slice(0, 3).forEach((row, index) => {
        console.log(`Row ${index + 1}:`, row);
      });
    }

    onProgress({
      stage: 'complete',
      progress: 100,
      message: `Successfully parsed ${totalRows} rows`
    });

    console.log(`Storage import completed: ${totalRows} total rows`);
    return parsedData;
  } catch (error) {
    console.error('Storage import failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Import failed');
  }
};
