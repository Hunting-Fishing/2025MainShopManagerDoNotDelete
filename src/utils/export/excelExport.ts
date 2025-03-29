
import { utils, write } from "xlsx";
import { getFormattedDate } from './utils';

/**
 * Export data as Excel
 */
export const exportToExcel = (data: any[], title: string) => {
  try {
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    // Generate file and trigger download
    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}_${getFormattedDate()}.xlsx`;
    link.click();
  } catch (err) {
    console.error('Failed to export as Excel:', err);
    throw new Error('Failed to export as Excel');
  }
};

/**
 * Export multiple Excel worksheets
 */
export const exportMultiSheetExcel = (data: Record<string, any[]>, title: string) => {
  try {
    const workbook = utils.book_new();
    
    // Add each data set as a separate worksheet
    Object.entries(data).forEach(([sheetName, sheetData]) => {
      const worksheet = utils.json_to_sheet(sheetData);
      utils.book_append_sheet(workbook, worksheet, sheetName);
    });
    
    // Generate file and trigger download
    const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}_${getFormattedDate()}.xlsx`;
    link.click();
  } catch (err) {
    console.error('Failed to export multi-sheet Excel:', err);
    throw new Error('Failed to export as Excel');
  }
};
