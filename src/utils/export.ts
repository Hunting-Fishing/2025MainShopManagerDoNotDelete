
import { Parser } from '@json2csv/plainjs';
import FileSaver from 'file-saver';

/**
 * Export data to CSV file
 */
export const exportToCSV = (data: any[], filename: string): void => {
  try {
    if (!data || !data.length) {
      throw new Error("No data to export");
    }
    
    const parser = new Parser();
    const csv = parser.parse(data);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    FileSaver.saveAs(blob, `${filename}.csv`);
  } catch (err) {
    console.error("Export failed:", err);
    throw err;
  }
};

/**
 * Export data to Excel file
 */
export const exportToExcel = async (data: any[], filename: string): Promise<void> => {
  try {
    // Dynamically import xlsx to reduce initial bundle size
    const XLSX = await import('xlsx');
    
    if (!data || !data.length) {
      throw new Error("No data to export");
    }
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    
    // Generate the file and trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (err) {
    console.error("Excel export failed:", err);
    throw err;
  }
};
