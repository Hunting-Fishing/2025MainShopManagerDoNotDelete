import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

export interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
  error?: string;
  completed?: boolean;
}

interface ExcelSheetData {
  sheetName: string;
  data: any[];
}

export const importFromStorage = async (
  bucketName: string,
  fileName: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<ExcelSheetData[]> => {
  try {
    if (onProgress) {
      onProgress({
        stage: 'download',
        progress: 10,
        message: 'Downloading file from storage...'
      });
    }

    // Download file from Supabase storage
    const { data: fileData, error } = await supabase.storage
      .from(bucketName)
      .download(fileName);

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }

    if (onProgress) {
      onProgress({
        stage: 'parse',
        progress: 30,
        message: 'Parsing Excel file...'
      });
    }

    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Parse Excel file with increased limits and better performance
    const workbook = XLSX.read(arrayBuffer, { 
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false,
      sheetStubs: false,
      // Remove artificial limits
      bookVBA: false,
      bookDeps: false,
      bookFiles: false,
      bookProps: false
    });

    const sheetsData: ExcelSheetData[] = [];
    const totalSheets = workbook.SheetNames.length; // Process ALL sheets, not just 20
    
    console.log(`Processing ${totalSheets} sheets from Excel file`);

    for (let i = 0; i < totalSheets; i++) {
      const sheetName = workbook.SheetNames[i];
      
      if (onProgress) {
        onProgress({
          stage: 'parse',
          progress: 30 + (i / totalSheets) * 40,
          message: `Processing sheet ${i + 1}/${totalSheets}: ${sheetName}...`
        });
      }

      const worksheet = workbook.Sheets[sheetName];
      
      // Convert sheet to JSON without artificial row limits
      const sheetData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false,
        range: 0, // Start from first row
        raw: false
        // Remove the artificial 100 row limit
      }) as any[][];

      // Filter out completely empty rows but don't limit the number of rows
      const filteredData = sheetData.filter(row => 
        row && row.some(cell => cell && cell.toString().trim())
      );

      console.log(`Sheet "${sheetName}": ${filteredData.length} rows processed (no artificial limits)`);

      if (filteredData.length > 0) {
        sheetsData.push({
          sheetName,
          data: filteredData
        });
      }

      // Reduce delay frequency for better performance on large files
      if (i % 10 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 70,
        message: `Parsed ${sheetsData.length} sheets with data (all available data processed)`
      });
    }

    console.log(`Excel parsing completed. Total sheets with data: ${sheetsData.length}`);
    return sheetsData;

  } catch (error) {
    console.error('Error importing from storage:', error);
    throw error;
  }
};
