
import { supabase } from '@/integrations/supabase/client';
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
    
    // Parse Excel file with increased limits
    const workbook = XLSX.read(arrayBuffer, { 
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: false,
      sheetStubs: false,
      // Increase sheet processing limits
      bookVBA: false,
      bookDeps: false,
      bookFiles: false,
      bookProps: false
    });

    const sheetsData: ExcelSheetData[] = [];
    const totalSheets = Math.min(workbook.SheetNames.length, 20); // Process up to 20 sheets
    
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
      
      // Convert sheet to JSON with increased row limit
      const sheetData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
        blankrows: false,
        range: 0, // Start from first row
        // This will read up to 100 rows per sheet
        raw: false
      }) as any[][];

      // Filter out completely empty rows and limit to 100 rows
      const filteredData = sheetData
        .filter(row => row && row.some(cell => cell && cell.toString().trim()))
        .slice(0, 100);

      console.log(`Sheet "${sheetName}": ${filteredData.length} rows processed`);

      if (filteredData.length > 0) {
        sheetsData.push({
          sheetName,
          data: filteredData
        });
      }

      // Add small delay to prevent blocking
      if (i % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    if (onProgress) {
      onProgress({
        stage: 'complete',
        progress: 70,
        message: `Parsed ${sheetsData.length} sheets with data`
      });
    }

    console.log(`Excel parsing completed. Total sheets with data: ${sheetsData.length}`);
    return sheetsData;

  } catch (error) {
    console.error('Error importing from storage:', error);
    throw error;
  }
};
