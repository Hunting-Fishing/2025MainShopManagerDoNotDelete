
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { Parser } from '@json2csv/plainjs';

/**
 * Export data to CSV file
 */
export function exportToCSV(data: any[], filename: string) {
  try {
    const parser = new Parser();
    const csv = parser.parse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export data to CSV');
  }
}

/**
 * Export data to Excel file
 */
export function exportToExcel(data: any[], filename: string) {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export data to Excel');
  }
}

/**
 * Export multiple sheets of data to Excel file
 * @param workbookData Object with keys as sheet names and values as arrays of data
 * @param filename Name for the exported file (without extension)
 */
export function exportMultiSheetExcel(
  workbookData: { [sheetName: string]: any[] },
  filename: string
) {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Convert workbook data object into sheet structure
    const sheets = Object.entries(workbookData).map(([name, data]) => ({
      name,
      data: XLSX.utils.json_to_sheet(data)
    }));
    
    // Add each sheet to the workbook
    sheets.forEach(sheet => {
      XLSX.utils.book_append_sheet(workbook, sheet.data, sheet.name);
    });
    
    // Write to file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting multi-sheet Excel:', error);
    throw new Error('Failed to export multi-sheet data to Excel');
  }
}

/**
 * Export data to PDF file
 * @param data Data to export
 * @param filename Name for the exported file (without extension)
 */
export function exportToPDF(data: any[], filename: string) {
  try {
    // This is a placeholder - in a real implementation,
    // you would use a library like jsPDF to generate the PDF
    console.log('PDF export requested for:', data);
    throw new Error('PDF export not implemented yet');
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}
